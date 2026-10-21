const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// @desc    Get all books with search, filters, sorting & pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Search by title, author, or ISBN
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } },
        { isbn: { $regex: search.trim(), $options: 'i' } },
        { publisher: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Status / Availability
    if (status && status !== 'All') {
      if (status === 'available') {
        query.availableCopies = { $gt: 0 };
      } else if (status === 'out_of_stock') {
        query.availableCopies = 0;
      } else {
        query.status = status;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOptions = {};
    if (sortBy === 'title') {
      sortOptions.title = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'author') {
      sortOptions.author = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'popular') {
      sortOptions.timesBorrowed = -1;
    } else if (sortBy === 'year') {
      sortOptions.publicationYear = order === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Fetch active borrowers / recent transactions for this book
    const recentTransactions = await Transaction.find({ bookId: book._id })
      .populate('userId', 'name studentId email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      book,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private (Admin / Librarian)
const createBook = async (req, res, next) => {
  try {
    const {
      isbn,
      title,
      author,
      category,
      publisher,
      publicationYear,
      description,
      totalCopies,
      availableCopies,
      shelfNumber,
      coverImage,
    } = req.body;

    // Check ISBN uniqueness
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `A book with ISBN '${isbn}' already exists`,
      });
    }

    // Auto generate bookId code
    const count = await Book.countDocuments();
    const bookId = `BK-${String(count + 1001).padStart(4, '0')}`;

    const copies = Number(totalCopies) || 1;
    const avail = availableCopies !== undefined ? Number(availableCopies) : copies;

    const book = await Book.create({
      bookId,
      isbn,
      title,
      author,
      category: category || 'Computer Science',
      publisher: publisher || 'University Press',
      publicationYear: publicationYear || new Date().getFullYear(),
      description: description || 'Academic textbook and reference guide.',
      totalCopies: copies,
      availableCopies: avail,
      shelfNumber: shelfNumber || 'Rack A-101',
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      status: avail > 0 ? 'available' : 'out_of_stock',
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private (Admin / Librarian)
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // If totalCopies is changed, compute availableCopies shift safely
    if (req.body.totalCopies !== undefined) {
      const newTotal = Number(req.body.totalCopies);
      const currentlyIssued = book.totalCopies - book.availableCopies;
      if (newTotal < currentlyIssued) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total copies below currently issued count (${currentlyIssued} copies are currently borrowed)`,
        });
      }
      req.body.availableCopies = newTotal - currentlyIssued;
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin / Librarian)
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Check if any copies are currently issued
    const activeLoans = await Transaction.countDocuments({
      bookId: book._id,
      status: { $in: ['issued', 'overdue'] },
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book: ${activeLoans} copy/copies are currently issued to students.`,
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct categories with counts
// @route   GET /api/books/categories/list
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      categories: categories.map((c) => ({
        name: c._id,
        count: c.count,
        totalCopies: c.totalCopies,
        availableCopies: c.availableCopies,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
};
