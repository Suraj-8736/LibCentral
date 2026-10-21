const Fine = require('../models/Fine');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @desc    Get all fines with filtering
// @route   GET /api/fines
// @access  Private (Admin / Librarian)
const getFines = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const allFines = await Fine.find(query)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId', 'title author isbn coverImage')
      .populate('transactionId')
      .populate('collectedBy', 'name role')
      .sort({ createdAt: -1 });

    let filtered = allFines;
    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      filtered = allFines.filter((f) => {
        const studentName = f.userId?.name?.toLowerCase() || '';
        const studentId = f.userId?.studentId?.toLowerCase() || '';
        const bookTitle = f.bookId?.title?.toLowerCase() || '';
        const fineId = f.fineId?.toLowerCase() || '';
        return (
          studentName.includes(s) ||
          studentId.includes(s) ||
          bookTitle.includes(s) ||
          fineId.includes(s)
        );
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    // Fine statistics
    const totalCollected = allFines
      .filter((f) => f.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPending = allFines
      .filter((f) => f.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      count: paginated.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      fines: paginated,
      summary: {
        totalFinesCount: allFines.length,
        totalCollected,
        totalPending,
        totalFineAssessed: totalCollected + totalPending,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's fines
// @route   GET /api/fines/my
// @access  Private (Student)
const getMyFines = async (req, res, next) => {
  try {
    const fines = await Fine.find({ userId: req.user._id })
      .populate('bookId', 'title author isbn coverImage')
      .populate('transactionId', 'issueDate dueDate returnDate')
      .sort({ createdAt: -1 });

    const totalPending = fines
      .filter((f) => f.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPaid = fines
      .filter((f) => f.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      count: fines.length,
      fines,
      summary: {
        totalPending,
        totalPaid,
        total: totalPending + totalPaid,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark fine as paid
// @route   PATCH /api/fines/:id/pay
// @access  Private (Admin / Librarian)
const payFine = async (req, res, next) => {
  try {
    const { paymentMethod = 'Cash', notes = '' } = req.body;

    const fine = await Fine.findById(req.params.id)
      .populate('userId')
      .populate('bookId');

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine record not found',
      });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This fine has already been marked as paid',
      });
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    fine.status = 'paid';
    fine.paidAt = new Date();
    fine.paymentMethod = paymentMethod;
    fine.receiptNumber = receiptNumber;
    fine.collectedBy = req.user._id;
    if (notes) fine.notes = notes;

    await fine.save();

    // Update parent transaction
    if (fine.transactionId) {
      await Transaction.findByIdAndUpdate(fine.transactionId, {
        fineStatus: 'paid',
      });
    }

    // Send notification to student
    await Notification.create({
      userId: fine.userId._id,
      title: 'Fine Payment Received',
      message: `Payment of ₹${fine.amount} for "${fine.bookId?.title || 'Book'}" has been marked as paid. Receipt #: ${receiptNumber}.`,
      type: 'fine',
      link: '/my-fines',
    });

    const updatedFine = await Fine.findById(fine._id)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId')
      .populate('collectedBy', 'name role');

    res.json({
      success: true,
      message: `Fine of ₹${fine.amount} marked as paid successfully. Receipt: ${receiptNumber}`,
      fine: updatedFine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Waive a fine (Admin only)
// @route   PATCH /api/fines/:id/waive
// @access  Private (Admin)
const waiveFine = async (req, res, next) => {
  try {
    const { reason = 'Authorized fine waiver' } = req.body;

    const fine = await Fine.findById(req.params.id)
      .populate('userId')
      .populate('bookId');

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine record not found',
      });
    }

    fine.status = 'paid';
    fine.paidAt = new Date();
    fine.paymentMethod = 'Waived';
    fine.receiptNumber = `WAIVE-${Math.floor(10000 + Math.random() * 90000)}`;
    fine.collectedBy = req.user._id;
    fine.notes = `Waived by Admin: ${reason}`;

    await fine.save();

    if (fine.transactionId) {
      await Transaction.findByIdAndUpdate(fine.transactionId, {
        fineStatus: 'paid',
      });
    }

    await Notification.create({
      userId: fine.userId._id,
      title: 'Fine Waived by Admin',
      message: `Your fine of ₹${fine.amount} for "${fine.bookId?.title || 'Book'}" has been waived. Reason: ${reason}`,
      type: 'fine',
      link: '/my-fines',
    });

    res.json({
      success: true,
      message: `Fine of ₹${fine.amount} has been waived.`,
      fine,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFines,
  getMyFines,
  payFine,
  waiveFine,
};
