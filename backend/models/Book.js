const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isbn: {
      type: String,
      required: [true, 'Please add an ISBN'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please add author name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add category'],
      trim: true,
      default: 'Computer Science',
    },
    publisher: {
      type: String,
      trim: true,
      default: 'University Press',
    },
    publicationYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    description: {
      type: String,
      default: 'Comprehensive academic textbook and reference manual.',
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please specify total copies'],
      min: [1, 'Total copies must be at least 1'],
      default: 5,
    },
    availableCopies: {
      type: Number,
      required: [true, 'Please specify available copies'],
      min: [0, 'Available copies cannot be negative'],
      default: 5,
    },
    shelfNumber: {
      type: String,
      default: 'Rack A-101',
      trim: true,
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'reserved'],
      default: 'available',
    },
    timesBorrowed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto update status based on available copies
bookSchema.pre('save', function (next) {
  if (this.availableCopies === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.availableCopies > 0) {
    this.status = 'available';
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
