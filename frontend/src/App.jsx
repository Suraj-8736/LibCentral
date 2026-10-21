import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Admin / Librarian Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BooksPage from './pages/admin/BooksPage';
import StudentsPage from './pages/admin/StudentsPage';
import IssueReturnPage from './pages/admin/IssueReturnPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import BookRequestsPage from './pages/admin/BookRequestsPage';
import FinesPage from './pages/admin/FinesPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseBooksPage from './pages/student/BrowseBooksPage';
import MyBooksPage from './pages/student/MyBooksPage';
import MyRequestsPage from './pages/student/MyRequestsPage';
import MyFinesPage from './pages/student/MyFinesPage';
import StudentHistoryPage from './pages/student/StudentHistoryPage';

// Shared Pages
import ProfilePage from './pages/shared/ProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';
import NotFoundPage from './pages/shared/NotFoundPage';

// Protected Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'} replace />;
  }

  return children;
};

// Public Route Guard (Redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  if (token && user) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Pages with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Pages with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin / Librarian Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <BooksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/circulation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <IssueReturnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <BookRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fines"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <FinesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-books"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <BrowseBooksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-books"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyBooksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-fines"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyFinesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/borrowing-history"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Authenticated Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
