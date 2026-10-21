const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Fine = require('../models/Fine');
const Setting = require('../models/Setting');
const Notification = require('../models/Notification');
const calculateFine = require('../utils/calculateFine');

// @desc    Get all transactions with search & filtering
// @route   GET /api/transactions
// @access  Private (Admin / Librarian)
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 15,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      if (status === 'overdue') {
        query.status = 'issued';
        query.dueDate = { $lt: new Date() };
      } else {
        query.status = status;
      }
    }

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let transactionQuery = Transaction.find(query)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId', 'title author isbn coverImage shelfNumber category')
      .populate('issuedBy', 'name role')
      .populate('returnedTo', 'name role')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    const allTransactions = await transactionQuery;

    // Filter in-memory for deep search on populated fields if search query provided
    let filteredTransactions = allTransactions;
    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      filteredTransactions = allTransactions.filter((t) => {
        const studentName = t.userId?.name?.toLowerCase() || '';
        const studentId = t.userId?.studentId?.toLowerCase() || '';
        const bookTitle = t.bookId?.title?.toLowerCase() || '';
        const bookIsbn = t.bookId?.isbn?.toLowerCase() || '';
        const transId = t.transactionId?.toLowerCase() || '';
        return (
          studentName.includes(s) ||
          studentId.includes(s) ||
          bookTitle.includes(s) ||
          bookIsbn.includes(s) ||
          transId.includes(s)
        );
      });
    }

    const total = filteredTransactions.length;
    const paginated = filteredTransactions.slice(skip, skip + limitNum);

    // Calculate dynamic overdue flags
    const today = new Date();
    const result = paginated.map((t) => {
      const obj = t.toObject();
      if (obj.status === 'issued' && new Date(obj.dueDate) < today) {
        obj.isCurrentlyOverdue = true;
        const { lateDays, fine } = calculateFine(obj.dueDate, today, 5);
        obj.currentLateDays = lateDays;
        obj.currentEstimatedFine = fine;
      } else {
        obj.isCurrentlyOverdue = false;
      }
      return obj;
    });

    res.json({
      success: true,
      count: result.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      transactions: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue a book to a student
// @route   POST /api/transactions/issue
// @access  Private (Admin / Librarian)
const issueBook = async (req, res, next) => {
  try {
    const { userId, bookId, issueDate, dueDate, notes } = req.body;

    // Verify student exists and is active
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (student.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue book: Student account is suspended',
      });
    }

    // Get library settings
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }

    // Check maximum active books limit
    const activeLoans = await Transaction.countDocuments({
      userId: student._id,
      status: 'issued',
    });

    if (activeLoans >= setting.maxBooksPerStudent) {
      return res.status(400).json({
        success: false,
        message: `Borrowing limit reached: Student already has ${activeLoans} active book(s). Maximum allowed is ${setting.maxBooksPerStudent}.`,
      });
    }

    // Verify book exists and has stock
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `Book '${book.title}' is currently out of stock (0 copies available).`,
      });
    }

    // Calculate dates
    const iDate = issueDate ? new Date(issueDate) : new Date();
    let dDate;
    if (dueDate) {
      dDate = new Date(dueDate);
    } else {
      dDate = new Date(iDate);
      dDate.setDate(dDate.getDate() + (setting.loanPeriodDays || 14));
    }

    // Generate transaction ID
    const count = await Transaction.countDocuments();
    const transactionId = `TXN-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    // Create transaction
    const transaction = await Transaction.create({
      transactionId,
      userId: student._id,
      bookId: book._id,
      issueDate: iDate,
      dueDate: dDate,
      status: 'issued',
      issuedBy: req.user._id,
      notes: notes || '',
    });

    // Update book inventory
    book.availableCopies -= 1;
    book.timesBorrowed += 1;
    if (book.availableCopies === 0) {
      book.status = 'out_of_stock';
    }
    await book.save();

    // Create student notification
    await Notification.create({
      userId: student._id,
      title: 'Book Issued Successfully',
      message: `"${book.title}" has been issued to you. Due date for return is ${dDate.toLocaleDateString()}.`,
      type: 'issue',
      link: '/my-books',
    });

    const populated = await Transaction.findById(transaction._id)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId')
      .populate('issuedBy', 'name role');

    res.status(201).json({
      success: true,
      message: `Book '${book.title}' issued successfully to ${student.name}`,
      transaction: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a book
// @route   POST /api/transactions/return
// @access  Private (Admin / Librarian)
const returnBook = async (req, res, next) => {
  try {
    const { transactionId, returnDate, notes } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('userId')
      .populate('bookId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been marked as returned',
      });
    }

    const rDate = returnDate ? new Date(returnDate) : new Date();

    // Retrieve settings for fine rate
    const setting = (await Setting.findOne()) || { finePerDay: 5 };

    // Calculate late days and fine
    const { lateDays, fine } = calculateFine(
      transaction.dueDate,
      rDate,
      setting.finePerDay || 5
    );

    // Update transaction
    transaction.returnDate = rDate;
    transaction.status = 'returned';
    transaction.lateDays = lateDays;
    transaction.fine = fine;
    transaction.fineStatus = fine > 0 ? 'pending' : 'none';
    transaction.returnedTo = req.user._id;
    if (notes) transaction.notes = `${transaction.notes ? transaction.notes + ' | ' : ''}${notes}`;

    await transaction.save();

    // Increase available copies on Book
    const book = await Book.findById(transaction.bookId._id);
    if (book) {
      book.availableCopies += 1;
      if (book.availableCopies > 0 && book.status === 'out_of_stock') {
        book.status = 'available';
      }
      await book.save();
    }

    let createdFine = null;
    // Create Fine record if late
    if (fine > 0) {
      const fineCount = await Fine.countDocuments();
      const fineId = `FINE-${String(fineCount + 1001).padStart(5, '0')}`;

      createdFine = await Fine.create({
        fineId,
        transactionId: transaction._id,
        userId: transaction.userId._id,
        bookId: transaction.bookId._id,
        amount: fine,
        lateDays,
        status: 'pending',
        notes: `Returned ${lateDays} days late on ${rDate.toLocaleDateString()}`,
      });

      // Notify student of overdue fine
      await Notification.create({
        userId: transaction.userId._id,
        title: 'Book Returned with Overdue Fine',
        message: `You returned "${book?.title || 'Book'}" ${lateDays} days late. A fine of ₹${fine} has been generated.`,
        type: 'fine',
        link: '/my-fines',
      });
    } else {
      // Normal return notification
      await Notification.create({
        userId: transaction.userId._id,
        title: 'Book Returned Successfully',
        message: `You have successfully returned "${book?.title || 'Book'}". Thank you!`,
        type: 'return',
        link: '/my-books',
      });
    }

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId')
      .populate('issuedBy', 'name role')
      .populate('returnedTo', 'name role');

    res.json({
      success: true,
      message:
        fine > 0
          ? `Book returned successfully. Late by ${lateDays} day(s). Fine incurred: ₹${fine}.`
          : 'Book returned on time with zero fine.',
      transaction: updatedTransaction,
      fine: createdFine,
      lateDays,
      fineAmount: fine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's active & past transactions
// @route   GET /api/transactions/my
// @access  Private (Student)
const getMyTransactions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'All') {
      if (status === 'overdue') {
        query.status = 'issued';
        query.dueDate = { $lt: new Date() };
      } else {
        query.status = status;
      }
    }

    const transactions = await Transaction.find(query)
      .populate('bookId')
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });

    const today = new Date();
    const result = transactions.map((t) => {
      const obj = t.toObject();
      if (obj.status === 'issued') {
        const due = new Date(obj.dueDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        obj.daysRemaining = diffDays;
        obj.isOverdue = diffDays < 0;
        if (diffDays < 0) {
          const { lateDays, fine } = calculateFine(obj.dueDate, today, 5);
          obj.currentLateDays = lateDays;
          obj.currentEstimatedFine = fine;
        }
      }
      return obj;
    });

    res.json({
      success: true,
      count: result.length,
      transactions: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue transactions
// @route   GET /api/transactions/overdue
// @access  Private (Admin / Librarian)
const getOverdueTransactions = async (req, res, next) => {
  try {
    const today = new Date();
    const transactions = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: today },
    })
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId', 'title author isbn coverImage shelfNumber')
      .sort({ dueDate: 1 });

    const enriched = transactions.map((t) => {
      const obj = t.toObject();
      const { lateDays, fine } = calculateFine(obj.dueDate, today, 5);
      obj.lateDays = lateDays;
      obj.fine = fine;
      return obj;
    });

    res.json({
      success: true,
      count: enriched.length,
      transactions: enriched,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  issueBook,
  returnBook,
  getMyTransactions,
  getOverdueTransactions,
};
