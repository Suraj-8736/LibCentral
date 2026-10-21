const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const Notification = require('../models/Notification');

// @desc    Create book request (Student)
// @route   POST /api/requests
// @access  Private (Student)
const createRequest = async (req, res, next) => {
  try {
    const { bookId, title, author, notes } = req.body;

    let bookTitle = title;
    let bookAuthor = author;

    if (bookId) {
      const book = await Book.findById(bookId);
      if (book) {
        bookTitle = book.title;
        bookAuthor = book.author;
      }
    }

    if (!bookTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide book title',
      });
    }

    // Check if user already has a pending request for this same book
    const existing = await BookRequest.findOne({
      userId: req.user._id,
      title: bookTitle,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this book.',
      });
    }

    const request = await BookRequest.create({
      userId: req.user._id,
      bookId: bookId || null,
      title: bookTitle,
      author: bookAuthor || '',
      notes: notes || '',
      status: 'pending',
    });

    const populated = await BookRequest.findById(request._id)
      .populate('userId', 'name email studentId course branch')
      .populate('bookId', 'title author coverImage availableCopies');

    res.status(201).json({
      success: true,
      message: 'Book request submitted successfully',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all book requests (Admin / Librarian)
// @route   GET /api/requests
// @access  Private (Admin / Librarian)
const getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await BookRequest.countDocuments(query);
    const requests = await BookRequest.find(query)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId', 'title author coverImage availableCopies shelfNumber')
      .populate('processedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own requests
// @route   GET /api/requests/my
// @access  Private (Student)
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await BookRequest.find({ userId: req.user._id })
      .populate('bookId', 'title author coverImage availableCopies shelfNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a book request (Admin / Librarian)
// @route   PATCH /api/requests/:id/status
// @access  Private (Admin / Librarian)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected', 'fulfilled', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided',
      });
    }

    const request = await BookRequest.findById(req.params.id)
      .populate('userId')
      .populate('bookId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    request.processedBy = req.user._id;
    request.processedDate = new Date();

    await request.save();

    // Create notification for student
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    await Notification.create({
      userId: request.userId._id,
      title: `Book Request ${statusText}`,
      message: `Your request for "${request.title}" has been ${status}.${adminNotes ? ` Note: ${adminNotes}` : ''}`,
      type: status === 'approved' ? 'request_approved' : status === 'rejected' ? 'request_rejected' : 'system',
      link: '/my-requests',
    });

    const updated = await BookRequest.findById(request._id)
      .populate('userId', 'name email studentId course branch phone avatar')
      .populate('bookId')
      .populate('processedBy', 'name role');

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
      request: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel / delete a pending book request
// @route   DELETE /api/requests/:id
// @access  Private (Student self or Admin)
const deleteRequest = async (req, res, next) => {
  try {
    const request = await BookRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (
      req.user.role === 'student' &&
      request.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request',
      });
    }

    await BookRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getMyRequests,
  updateRequestStatus,
  deleteRequest,
};
