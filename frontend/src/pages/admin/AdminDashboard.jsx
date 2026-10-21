import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  GitPullRequest,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import IssueBookModal from '../../components/circulation/IssueBookModal';
import ReturnBookModal from '../../components/circulation/ReturnBookModal';
import BookFormModal from '../../components/books/BookFormModal';
import StaffActivityTracker from '../../components/admin/StaffActivityTracker';
import { getAdminDashboard } from '../../services/dashboardService';
import { getMonthlyStatistics } from '../../services/reportService';
import { issueBook, returnBook } from '../../services/transactionService';
import { createBook } from '../../services/bookService';
import { updateRequestStatus } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [selectedTransactionForReturn, setSelectedTransactionForReturn] = useState(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, monthlyRes] = await Promise.all([
        getAdminDashboard(),
        getMonthlyStatistics(),
      ]);

      if (dashRes.success) setData(dashRes);
      if (monthlyRes.success) setMonthlyTrends(monthlyRes.monthlyData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleIssueSubmit = async (payload) => {
    try {
      const res = await issueBook(payload);
      if (res.success) {
        toast.success(res.message || 'Book issued successfully');
        setIsIssueModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    }
  };

  const handleReturnSubmit = async (payload) => {
    try {
      const res = await returnBook(payload);
      if (res.success) {
        toast.success(res.message || 'Book returned successfully');
        setIsReturnModalOpen(false);
        setSelectedTransactionForReturn(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleAddBookSubmit = async (payload) => {
    try {
      const res = await createBook(payload);
      if (res.success) {
        toast.success('Book created successfully');
        setIsAddBookModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book');
    }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      const res = await updateRequestStatus(reqId, { status: 'approved' });
      if (res.success) {
        toast.success('Request approved successfully');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling campus library metrics..." size="lg" />;
  }

  const { stats, categoryDistribution, topBorrowed, recentTransactions, recentRequests } = data || {};

  const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Library Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time circulation metrics, overdue tracking, and inventory distribution.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Issue Book</span>
          </button>

          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Add Book</span>
          </button>

          <Link
            to="/admin/reports"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Reports & PDF</span>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner if any overdue books exist */}
      {stats?.overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent border border-rose-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
                Action Required: {stats.overdueCount} Overdue Book(s) Detected
              </h4>
              <p className="text-xs text-rose-600/90 dark:text-rose-300/80 mt-0.5">
                Students with overdue loans are accumulating late penalties. View overdue transactions to send notices or record returns.
              </p>
            </div>
          </div>
          <Link
            to="/admin/transactions?status=overdue"
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all shrink-0"
          >
            View Overdue
          </Link>
        </div>
      )}

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Titles"
          value={stats?.totalBooks || 0}
          subtitle={`${stats?.totalCopies || 0} Total Physical Copies`}
          icon={BookOpen}
          color="brand"
          onClick={() => navigate('/admin/books')}
        />

        <StatCard
          title="Available Stock"
          value={stats?.availableCopies || 0}
          subtitle="Ready on shelves"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/admin/books?status=available')}
        />

        <StatCard
          title="Currently Issued"
          value={stats?.issuedCopies || 0}
          subtitle="In student custody"
          icon={ArrowLeftRight}
          color="blue"
          onClick={() => navigate('/admin/transactions?status=issued')}
        />

        <StatCard
          title="Registered Students"
          value={stats?.totalStudents || 0}
          subtitle="Active campus library users"
          icon={Users}
          color="purple"
          onClick={() => navigate('/admin/students')}
        />

        <StatCard
          title="Overdue Books"
          value={stats?.overdueCount || 0}
          subtitle="Past due deadline"
          icon={AlertTriangle}
          color="rose"
          onClick={() => navigate('/admin/transactions?status=overdue')}
        />

        <StatCard
          title="Fines Collected"
          value={formatCurrency(stats?.totalFineCollected || 0)}
          subtitle={`${formatCurrency(stats?.totalFinePending || 0)} Pending`}
          icon={Receipt}
          color="amber"
          onClick={() => navigate('/admin/fines')}
        />
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Issues & Returns Trends */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Monthly Circulation Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Issues vs. Returns over the last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-600" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Issues</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Returns</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="issues" name="Issued" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="returns" name="Returned" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inventory breakdown across academic disciplines
            </p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryDistribution?.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="truncate text-slate-600 dark:text-slate-300">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Staff & Librarian Live Attendance & Activity Tracking (Admin Only) */}
      {isAdmin && (
        <StaffActivityTracker staffMembers={data?.staffMembers || []} />
      )}

      {/* Lower Dashboard Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Recent Circulation Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest student book borrowings and returns
              </p>
            </div>
            <Link
              to="/admin/transactions"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>All Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Book</th>
                  <th className="pb-3 font-semibold">Due Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentTransactions?.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={t.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.userId?.name}`}
                          alt={t.userId?.name}
                          className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                            {t.userId?.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{t.userId?.studentId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 pr-2 max-w-[180px]">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {t.bookId?.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{t.bookId?.author}</p>
                    </td>

                    <td className="py-3 pr-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {formatDate(t.dueDate)}
                    </td>

                    <td className="py-3 pr-2">
                      <Badge status={t.status} size="sm" />
                    </td>

                    <td className="py-3 text-right">
                      {t.status === 'issued' ? (
                        <button
                          onClick={() => {
                            setSelectedTransactionForReturn(t);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 hover:text-white dark:text-emerald-400 hover:bg-emerald-600 rounded-lg border border-emerald-500/30 transition-all"
                        >
                          Return
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Book Requests (1 Col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Pending Book Requests
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Student acquisition requests
                </p>
              </div>
              <Link
                to="/admin/requests"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentRequests?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-60" />
                  No pending student book requests!
                </div>
              ) : (
                recentRequests?.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {req.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          By {req.userId?.name} ({req.userId?.studentId})
                        </p>
                      </div>
                      <Badge status={req.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                      <span className="text-slate-400">
                        {formatDate(req.requestDate, { month: 'short', day: 'numeric' })}
                      </span>
                      <button
                        onClick={() => handleApproveRequest(req._id)}
                        className="px-2 py-0.5 text-[10px] font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Borrowed Books Widget */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Most Borrowed Volumes
            </h4>
            <div className="space-y-2">
              {topBorrowed?.slice(0, 3).map((b) => (
                <div key={b._id} className="flex items-center justify-between text-xs">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-200 max-w-[180px]">
                    {b.title}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold shrink-0">
                    {b.timesBorrowed} loans
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Circulation Desk Modals */}
      {isIssueModalOpen && (
        <IssueBookModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onSubmit={handleIssueSubmit}
        />
      )}

      {isReturnModalOpen && selectedTransactionForReturn && (
        <ReturnBookModal
          isOpen={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedTransactionForReturn(null);
          }}
          transaction={selectedTransactionForReturn}
          onSubmit={handleReturnSubmit}
        />
      )}

      {isAddBookModalOpen && (
        <BookFormModal
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          onSubmit={handleAddBookSubmit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
