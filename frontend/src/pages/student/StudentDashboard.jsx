import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  GitPullRequest,
  Receipt,
  History,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  BookmarkPlus,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookDetailsModal from '../../components/books/BookDetailsModal';
import Modal from '../../components/common/Modal';
import { getStudentDashboard } from '../../services/dashboardService';
import { createRequest } from '../../services/requestService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);
  const [bookToRequest, setBookToRequest] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchStudentDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getStudentDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboardData();
  }, []);

  const handleBorrowRequestSubmit = async (e) => {
    e.preventDefault();
    if (!bookToRequest) return;

    try {
      setRequestLoading(true);
      const res = await createRequest({
        bookId: bookToRequest._id,
        title: bookToRequest.title,
        author: bookToRequest.author,
        notes: requestNotes,
      });

      if (res.success) {
        toast.success(res.message || 'Book request submitted successfully');
        setBookToRequest(null);
        setRequestNotes('');
        fetchStudentDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching your student library profile & active loans..." size="lg" />;
  }

  const { stats, activeLoans, recentActivity, recommendedBooks } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/10 blur-2xl rounded-full -mr-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Scholar Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Student ID: <span className="font-bold text-white">{user?.studentId || 'STU-NEW'}</span> •{' '}
              {user?.course} ({user?.year}) • {user?.branch}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/browse-books"
              className="px-4 py-2.5 text-xs font-bold bg-white text-brand-700 hover:bg-indigo-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
            <Link
              to="/my-books"
              className="px-4 py-2.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <BookMarked className="w-4 h-4" />
              <span>My Issued Books</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Loans"
          value={stats?.activeLoansCount || 0}
          subtitle="Currently in possession"
          icon={BookMarked}
          color="brand"
          onClick={() => navigate('/my-books')}
        />

        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequestsCount || 0}
          subtitle="Awaiting staff approval"
          icon={GitPullRequest}
          color="amber"
          onClick={() => navigate('/my-requests')}
        />

        <StatCard
          title="Pending Fines"
          value={formatCurrency(stats?.pendingFineAmount || 0)}
          subtitle={stats?.pendingFineAmount > 0 ? 'Payment due at counter' : 'Clean account balance'}
          icon={Receipt}
          color={stats?.pendingFineAmount > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/my-fines')}
        />

        <StatCard
          title="Lifetime Borrowed"
          value={`${stats?.totalBorrowedLifetime || 0} Books`}
          subtitle="Total volumes checked out"
          icon={History}
          color="purple"
          onClick={() => navigate('/borrowing-history')}
        />
      </div>

      {/* Main Grid: Active Loans & Recommended Books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Currently Borrowed Books (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Currently Issued Books ({activeLoans?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Keep track of return deadlines to avoid the ₹5/day overdue penalty
              </p>
            </div>
            <Link
              to="/my-books"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {activeLoans?.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You have 0 active books checked out
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Explore the library catalog and request any academic textbook.
              </p>
              <Link
                to="/browse-books"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
              >
                Browse Books Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoans?.map((loan) => (
                <div
                  key={loan._id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    loan.isOverdue
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : loan.daysRemaining <= 3
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center">
                      <img
                        src={loan.bookId?.coverImage}
                        alt={loan.bookId?.title}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {loan.bookId?.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Author: {loan.bookId?.author} • Shelf: {loan.bookId?.shelfNumber}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Issued on {formatDate(loan.issueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-1.5">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Return Deadline</p>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {formatDate(loan.dueDate)}
                      </p>
                    </div>

                    {loan.isOverdue ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold animate-pulse">
                        {loan.currentLateDays}d Overdue (₹{loan.currentEstimatedFine} Fine)
                      </span>
                    ) : loan.daysRemaining <= 3 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold">
                        {loan.daysRemaining} days left
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                        {loan.daysRemaining} days left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recommended Books (1 Col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Recommended For You
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Popular titles in computer science & tech
                </p>
              </div>
              <Link
                to="/browse-books"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                All
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedBooks?.slice(0, 4).map((book) => (
                <div
                  key={book._id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        onClick={() => setSelectedBookForDetails(book)}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate"
                      >
                        {book.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {book.author}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {book.availableCopies} available
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookToRequest(book);
                      setRequestNotes('');
                    }}
                    className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white transition-colors shrink-0"
                    title="Borrow or Request Book"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/my-fines"
              className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-brand-600"
            >
              <span>Fine Policy & Rates</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">₹5 / Day</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Book Details Modal */}
      {selectedBookForDetails && (
        <BookDetailsModal
          isOpen={!!selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          book={selectedBookForDetails}
          onRequestBorrow={(book) => {
            setBookToRequest(book);
            setRequestNotes('');
          }}
        />
      )}

      {/* Request Modal */}
      {bookToRequest && (
        <Modal
          isOpen={!!bookToRequest}
          onClose={() => setBookToRequest(null)}
          title="Submit Book Borrow Request"
          subtitle={`Volume: "${bookToRequest.title}"`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleBorrowRequestSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{bookToRequest.title}</p>
              <p className="text-slate-500 dark:text-slate-400">By {bookToRequest.author}</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                {bookToRequest.availableCopies > 0
                  ? `${bookToRequest.availableCopies} copies currently on shelves (${bookToRequest.shelfNumber})`
                  : 'Currently out of stock (will be requested from library acquisitions)'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Academic Subject Coursework (Optional)
              </label>
              <textarea
                rows={2}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="e.g. For final year project research, exam prep..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBookToRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2"
              >
                {requestLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Confirm Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentDashboard;
