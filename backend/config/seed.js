const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');
const BookRequest = require('../models/BookRequest');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const { booksData, studentsData } = require('../utils/seedData');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';
    await mongoose.connect(mongoUri);
    console.log('🔄 Connected to database for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Book.deleteMany();
    await Transaction.deleteMany();
    await Fine.deleteMany();
    await BookRequest.deleteMany();
    await Notification.deleteMany();
    await Setting.deleteMany();
    console.log('🧹 Cleaned existing database collections.');

    // 1. Create Default Settings
    await Setting.create({
      collegeName: 'National Institute of Science & Technology',
      libraryName: 'Central Academic Library',
      finePerDay: 5,
      loanPeriodDays: 14,
      maxBooksPerStudent: 4,
      currencySymbol: '₹',
      contactEmail: 'library@nist.edu',
      contactPhone: '+91 11 2345 6789',
      address: 'Knowledge Enclave, Academic District, New Delhi - 110001',
    });
    console.log('⚙️ Library settings initialized.');

    // 2. Create Admin and Librarian Users
    const admin = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@library.edu',
      password: 'admin123',
      role: 'admin',
      phone: '+91 99000 11223',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminRajesh',
      course: 'Faculty / Staff',
      branch: 'Administration',
      year: 'Faculty / Staff',
      status: 'active',
    });

    const librarian = await User.create({
      name: 'Sunita Mehra',
      email: 'librarian@library.edu',
      password: 'librarian123',
      role: 'librarian',
      phone: '+91 99111 22334',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunitaLibrarian',
      course: 'Faculty / Staff',
      branch: 'Library Sciences',
      year: 'Faculty / Staff',
      status: 'active',
    });

    // 3. Create Student (Saurabh Sahu)
    const createdStudents = [];
    for (const student of studentsData) {
      const s = await User.create(student);
      createdStudents.push(s);
    }
    console.log(`👤 Created 1 Admin, 1 Librarian, and ${createdStudents.length} Student (Saurabh Sahu).`);

    // 4. Create Books (All 46 books with 0 timesBorrowed and 100% available copies)
    const createdBooks = [];
    for (const book of booksData) {
      const b = await Book.create(book);
      createdBooks.push(b);
    }
    console.log(`📚 Created ${createdBooks.length} Catalog Books (0 borrowed, all copies available).`);
    console.log('✨ Clean state: 0 active transactions, 0 fines, 0 pending requests.');

    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Demo Credentials for Instant Testing:');
    console.log('1. Admin:     admin@library.edu       /  admin123');
    console.log('2. Librarian: librarian@library.edu   /  librarian123');
    console.log('3. Student:   sahu720p@gmail.com      /  sahu720p (Saurabh Sahu)');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
