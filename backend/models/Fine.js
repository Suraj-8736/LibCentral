const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    fineId: {
      type: String,
      unique: true,
      sparse: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    lateDays: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI / Online', 'Card', 'Waived', 'Not Paid'],
      default: 'Not Paid',
    },
    receiptNumber: {
      type: String,
      default: '',
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fine', fineSchema);
