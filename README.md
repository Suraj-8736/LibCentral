# 📚 LibCentral — University code README.md

A modern, full-stack, production-grade **Library Management System** built with **React.js, Tailwind CSS, Node.js/Express.js, and MongoDB**. Designed specifically for colleges and universities with role-based access control, real-time book circulation, automatic overdue fine calculations, live librarian session tracking, digital payment receipts, and PDF/CSV reporting.

---

## 🌟 Key Features

### 1. Role-Based Access Control (3 Distinct Roles)
- **Admin**:
  - Full access to manage the 46+ book university catalog and student directory.
  - **Librarian & Staff Live Attendance**: Real-time monitoring of who is currently signed in (🟢 Online / ⚪ Offline), last login/logout timestamps, and complete session audit logs.
  - Issue and return books with automated fine calculations.
  - Manage overdue accounts, collect/waive fines, and view detailed financial logs.
  - Comprehensive analytical reports with 1-click **Export to PDF** & **Export to CSV**.
  - Configure library circulation policies (Fine per day, loan duration, max books limit).
- **Librarian**:
  - Add, edit, and categorize library books across 1st, 2nd, 3rd, and 4th Year engineering branches.
  - Real-time circulation desk to issue and return books.
  - Review, approve, or reject student book acquisition requests.
  - Monitor overdue accounts and collect late penalties.
- **Student**:
  - Search and filter university catalog books by category, year/branch, availability, and keyword.
  - Real-time **Due Date Countdown Badges** (e.g. "Due in 4 days" or "6 Days Overdue!").
  - Submit acquisition requests for out-of-stock or new curriculum volumes.
  - Track borrowing history, outstanding fines, and digital receipt numbers.
  - In-app notification center for loan reminders and request decisions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18/19, Vite, Tailwind CSS, React Router DOM, Lucide React, Recharts |
| **Export Engines** | jsPDF, jsPDF-AutoTable, CSV Exporter |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, CORS, Express Error Middleware |

---

## 🚀 Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) (Running locally on `localhost:27017` or MongoDB Atlas URI)

### 1. Install Dependencies
```bash
# Install root, backend, and frontend packages in one command
npm run install:all
```

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=lib_super_secret_jwt_key_2026_modern_academic_system_98765
JWT_EXPIRE=30d
FINE_PER_DAY=5
DEFAULT_LOAN_DAYS=14

# Optional: Gmail SMTP OTP Configuration (for email OTP sign-in & password recovery)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
EMAIL_FROM_NAME=LibCentral Academic Library
```

### 3. Seed Database with Curriculum Books & Staff Accounts
Populate 46 university catalog books (1st to 4th Year with custom SVG covers), staff accounts, and registered students:
```bash
npm run seed
```

### 4. Start Development Servers
```bash
# Starts both Express backend (Port 5001) and React frontend (Port 5173) concurrently
npm run dev
```

Visit the application at: **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

You can use the **1-Click Quick Login buttons** on the login page, or log in manually with:

| Role | Email | Password |
| :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@library.edu` | `admin123` |
| 📖 **Librarian** | `librarian@library.edu` | `librarian123` |JWT_SECRET=<your-jwt-secret>

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student user
- `POST /api/auth/login` — Sign in with email & password (updates `isOnline = true`)
- `POST /api/auth/send-login-otp` — Generate and send 6-digit login OTP via email
- `POST /api/auth/login-with-otp` — Instant passwordless sign-in with email OTP
- `POST /api/auth/forgot-password` — Send 6-digit password reset OTP to user email
- `POST /api/auth/verify-otp` — Verify password reset OTP
- `POST /api/auth/reset-password` — Set new password using verified OTP
- `POST /api/auth/logout` — Sign out and record logout timestamp (`isOnline = false`)
- `GET /api/auth/staff-status` — Get live staff/librarian online status and audit history (Admin only)
- `GET /api/auth/me` — Get current logged-in user profile
- `PUT /api/auth/profile` — Update user profile details
- `PUT /api/auth/change-password` — Change account password

### Book Management (`/api/books`)
- `GET /api/books` — Get books with search, category, status filter, and pagination
- `GET /api/books/:id` — Get single book details and borrowing history
- `POST /api/books` — Create new book (Admin/Librarian)
- `PUT /api/books/:id` — Update book (Admin/Librarian)
- `DELETE /api/books/:id` — Delete book (Admin/Librarian)
- `GET /api/books/categories/list` — Distinct categories with counts

### Student Directory (`/api/students`)
- `GET /api/students` — List all students with search & branch/year filters (Admin/Librarian)
- `POST /api/students` — Register a new student (Admin/Librarian)
- `GET /api/students/:id` — Get student profile and full borrowing ledger
- `PUT /api/students/:id` — Update student information (Admin/Librarian)
- `DELETE /api/students/:id` — Remove student record (Admin/Librarian)
- `PATCH /api/students/:id/status` — Activate or suspend student account (Admin/Librarian)

### Circulation & Transactions (`/api/transactions`)
- `GET /api/transactions` — All transactions with search & date filters
- `POST /api/transactions/issue` — Issue book to student (atomic stock decrement)
- `POST /api/transactions/return` — Return book (atomic stock increment + auto fine calculation)
- `GET /api/transactions/my` — Student's active and past loans
- `GET /api/transactions/overdue` — Overdue transactions past due date

### Book Requests (`/api/requests`)
- `GET /api/requests` — View all student acquisition requests (Admin/Librarian)
- `POST /api/requests` — Submit new book acquisition request (Student)
- `GET /api/requests/my` — View student's own requests
- `PATCH /api/requests/:id/status` — Approve or reject book request (Admin/Librarian)

### Fines & Penalties (`/api/fines`)
- `GET /api/fines` — List all fine records with summary
- `GET /api/fines/my` — Current student's fine statement
- `PATCH /api/fines/:id/pay` — Settle fine (Cash, UPI, Card) and generate receipt
- `PATCH /api/fines/:id/waive` — Waive fine (Admin only)

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Get user notifications (loan alerts, approval updates)
- `PATCH /api/notifications/read-all` — Mark all notifications as read
- `PATCH /api/notifications/:id/read` — Mark single notification as read
- `DELETE /api/notifications/:id` — Delete notification

### Dashboard & Analytics (`/api/dashboard` & `/api/reports`)
- `GET /api/dashboard/admin` — Admin/Librarian high-level KPI metrics & recent activity
- `GET /api/dashboard/student` — Student personalized dashboard stats & active loans
- `GET /api/reports/summary` — Full institutional library audit metrics
- `GET /api/reports/monthly` — 6-month loan & return velocity for charts
- `GET /api/reports/top-books` — Top 10 most borrowed books
- `GET /api/reports/top-students` — Top 10 active student readers

### System Settings (`/api/settings`)
- `GET /api/settings` — Get current library configuration (fine rate, loan period, limits)
- `PUT /api/settings` — Update circulation rules and fine rates (Admin only)

---

## 📂 Project Architecture

```
library-management-system/
├── backend/
│   ├── config/             # DB connection and seed script
│   ├── controllers/        # Express request handlers & business logic
│   ├── middleware/         # JWT auth, RBAC authorize, error handling
│   ├── models/             # Mongoose schemas (User, Book, Transaction, Fine, etc.)
│   ├── routes/             # REST endpoints
│   ├── utils/              # Calculation helpers, JWT generator, seed dictionary
│   ├── .env & .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI, Staff Tracker, Modals, StatCards
│   │   ├── context/        # AuthContext, ThemeContext, ToastContext, NotificationContext
│   │   ├── layouts/        # DashboardLayout, PublicLayout
│   │   ├── pages/          # Admin, Student, Public, and Shared Views
│   │   ├── services/       # Axios API client modules
│   │   ├── utils/          # PDF/CSV exporters, formatters, constants
│   │   ├── App.jsx         # React Router with ProtectedRoute guards
│   │   ├── main.jsx
│   │   └── index.css       # Tailwind CSS & Glassmorphism design system
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json            # Root runner script (concurrently)
└── README.md
```

---

## 👨‍💻 Project & Developer Details
- **Project**: LibCentral — Academic Library Management System
- **Lead Developer**: Saurabh Sahu
- **Email**: sahu720p@gmail.com
- **Repository**: Full-Stack MERN (React, Node.js, Express.js, MongoDB)

---

## 📄 License
This project is open-source and licensed under the **MIT License**.

