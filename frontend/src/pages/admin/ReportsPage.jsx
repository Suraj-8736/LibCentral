import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  BookOpen,
  Users,
  ArrowLeftRight,
  Receipt,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getSummaryReport,
  getMonthlyStatistics,
  getTopBorrowedBooks,
  getMostActiveStudents,
} from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchAllReportData = async () => {
      try {
        setLoading(true);
        const [sumRes, monthRes, bookRes, stuRes] = await Promise.all([
          getSummaryReport(),
          getMonthlyStatistics(),
          getTopBorrowedBooks(),
          getMostActiveStudents(),
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (monthRes.success) setMonthlyTrends(monthRes.monthlyData || []);
        if (bookRes.success) setTopBooks(bookRes.topBooks || []);
        if (stuRes.success) setTopStudents(stuRes.topStudents || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load analytical reports');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReportData();
  }, [toast]);

  const handleExportPDF = () => {
    if (!summary) return;

    const headers = ['Category Discipline', 'Titles Count', 'Total Copies', 'Available', 'Issued Copies', 'Times Borrowed'];
    const rows = summary.categories.map((c) => [
      c.category,
      c.titles,
      c.totalCopies,
      c.availableCopies,
      c.issuedCopies,
      c.timesBorrowed,
    ]);

    exportToPDF({
      title: 'University Central Library Annual Audit & Circulation Report',
      subtitle: `Total Titles: ${summary.inventory.totalBookTitles} | Physical Stock: ${summary.inventory.totalCopies} | Total Fines Collected: ₹${summary.fines.totalCollected}`,
      headers,
      rows,
      filename: 'library_comprehensive_report',
    });

    toast.success('Executive PDF report downloaded');
  };

  const handleExportCategoriesCSV = () => {
    if (!summary) return;

    const headers = [
      { key: 'category', label: 'Discipline Category' },
      { key: 'titles', label: 'Book Titles' },
      { key: 'totalCopies', label: 'Total Copies' },
      { key: 'availableCopies', label: 'Available Copies' },
      { key: 'issuedCopies', label: 'Currently Issued' },
      { key: 'timesBorrowed', label: 'Times Borrowed' },
    ];

    exportToCSV('library_category_distribution', summary.categories, headers);
    toast.success('Category report exported to CSV');
  };

  if (loading) {
    return <LoadingSpinner text="Generating analytical reports & intelligence metrics..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Library Intelligence & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-ready circulation metrics, student reading trends, and downloadable statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCategoriesCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Download Audit PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory</span>
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {summary?.inventory?.totalBookTitles} Titles
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{summary?.inventory?.totalCopies} Copies Total</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{summary?.inventory?.availableCopies} Available</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Circulation</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {summary?.circulation?.totalTransactions} Loans
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{summary?.circulation?.currentlyIssued} Active</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{summary?.circulation?.totalOverdue} Overdue</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Membership</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {summary?.members?.totalStudents} Students
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{summary?.members?.activeStudents} Active</span>
            <span>{summary?.members?.suspendedStudents} Suspended</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fines & Revenue</span>
            <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
            {formatCurrency(summary?.fines?.totalCollected || 0)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Collected</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{formatCurrency(summary?.fines?.totalPending || 0)} Pending</span>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            6-Month Loan & Return Velocity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical borrowing trends across academic terms
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Legend />
              <Area type="monotone" dataKey="issues" name="Book Issues" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIssues)" />
              <Area type="monotone" dataKey="returns" name="Book Returns" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReturns)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Rankings: Top Books & Top Borrowers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Books */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Top 10 Most Borrowed Books
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {topBooks.map((b, i) => (
              <div key={b._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center font-extrabold text-slate-400 font-heading">
                    #{i + 1}
                  </span>
                  <div className="w-8 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {b.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{b.category} • By {b.author}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold shrink-0">
                  {b.timesBorrowed} loans
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Students */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Top 10 Active Student Readers
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {topStudents.map((s, i) => (
              <div key={s._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center font-extrabold text-slate-400 font-heading">
                    #{i + 1}
                  </span>
                  <img
                    src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`}
                    alt={s.name}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{s.studentId} • {s.branch}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  {s.totalBorrowed} borrowed
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-3">
          Discipline & Category Audit Table
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="pb-3 font-semibold">Discipline Category</th>
              <th className="pb-3 font-semibold">Book Titles</th>
              <th className="pb-3 font-semibold">Physical Copies</th>
              <th className="pb-3 font-semibold">Available</th>
              <th className="pb-3 font-semibold">Issued</th>
              <th className="pb-3 font-semibold text-right">Circulation Demand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {summary?.categories?.map((c) => (
              <tr key={c.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 pr-3 font-bold text-slate-900 dark:text-white">
                  {c.category}
                </td>
                <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                  {c.titles}
                </td>
                <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                  {c.totalCopies}
                </td>
                <td className="py-3 pr-3 font-semibold text-emerald-600 dark:text-emerald-400">
                  {c.availableCopies}
                </td>
                <td className="py-3 pr-3 font-semibold text-blue-600 dark:text-blue-400">
                  {c.issuedCopies}
                </td>
                <td className="py-3 text-right font-bold text-brand-600 dark:text-brand-400">
                  {c.timesBorrowed} borrows
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
