const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');
const BookRequest = require('../models/BookRequest');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

dotenv.config();

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';
    await mongoose.connect(mongoUri);
    console.log('🔄 Connected to MongoDB for data clearance...');

    // 1. Delete all Students (keeping admin and librarian)
    const studentDeleteResult = await User.deleteMany({ role: 'student' });
    console.log(`👤 Deleted ${studentDeleteResult.deletedCount} student accounts.`);

    // 2. Delete all Transactions
    const txnDeleteResult = await Transaction.deleteMany({});
    console.log(`📋 Deleted ${txnDeleteResult.deletedCount} transaction records.`);

    // 3. Delete all Fines
    const fineDeleteResult = await Fine.deleteMany({});
    console.log(`💰 Deleted ${fineDeleteResult.deletedCount} fine records.`);

    // 4. Delete all Book Requests
    const requestDeleteResult = await BookRequest.deleteMany({});
    console.log(`📖 Deleted ${requestDeleteResult.deletedCount} book requests.`);

    // 5. Delete all Notifications
    const notifDeleteResult = await Notification.deleteMany({});
    console.log(`🔔 Deleted ${notifDeleteResult.deletedCount} notifications.`);

    // 6. Reset Book stats (availableCopies = totalCopies, timesBorrowed = 0, status = 'available')
    const books = await Book.find({});
    let updatedBooksCount = 0;
    for (const book of books) {
      book.availableCopies = book.totalCopies;
      book.timesBorrowed = 0;
      book.status = 'available';
      await book.save();
      updatedBooksCount++;
    }
    console.log(`📚 Reset circulation & borrow metrics for ${updatedBooksCount} books.`);

    // 7. Check Remaining Users (Admin / Librarian)
    const remainingUsers = await User.find({}, 'name email role');
    console.log('\n✅ Remaining Active Staff Accounts:');
    remainingUsers.forEach((u) => {
      console.log(`   - ${u.name} (${u.email}) [Role: ${u.role}]`);
    });

    // 8. Check Settings
    const settingsCount = await Setting.countDocuments();
    console.log(`⚙️ Settings preserved: ${settingsCount} configuration record(s).`);

    console.log('\n=============================================');
    console.log('✨ DATA CLEARANCE & ANALYTICS RESET COMPLETE!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during data clearance:', error);
    process.exit(1);
  }
};

clearData();
