const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      default: 'Apex Institute of Technology & Science',
    },
    libraryName: {
      type: String,
      default: 'Central Academic Library',
    },
    finePerDay: {
      type: Number,
      default: 5,
      min: 0,
    },
    loanPeriodDays: {
      type: Number,
      default: 14,
      min: 1,
    },
    maxBooksPerStudent: {
      type: Number,
      default: 4,
      min: 1,
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    contactEmail: {
      type: String,
      default: 'library@apexinstitute.edu',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    address: {
      type: String,
      default: 'Central Campus, University Road, Knowledge City',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
