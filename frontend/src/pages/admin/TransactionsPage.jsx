import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import ReturnBookModal from '../../components/circulation/ReturnBookModal';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { getTransactions, returnBook } from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { TRANSACTION_STATUSES } from '../../utils/constants';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedTxnForReturn, setSelectedTxnForReturn] = useState(null);

  const { toast } = useToast();

  const fetchTransactionsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransactions({
        search: searchQuery,
        status: selectedStatus,
        startDate,
        endDate,
        page: currentPage,
        limit: 15,
      });

      if (res.success) {
        setTransactions(res.transactions || []);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction records');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, startDate, endDate, currentPage, toast]);

  useEffect(() => {
    fetchTransactionsList();
  }, [fetchTransactionsList]);

  const handleReturnSubmit = async (payload) => {
    try {
      const res = await returnBook(payload);
      if (res.success) {
        toast.success(res.message || 'Book returned successfully');
        setSelectedTxnForReturn(null);
        fetchTransactionsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      { key: 'transactionId', label: 'Transaction ID' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentId', label: 'Student Roll No' },
      { key: 'bookTitle', label: 'Book Title' },
      { key: 'isbn', label: 'ISBN' },
      { key: 'issueDateFormatted', label: 'Issue Date' },
      { key: 'dueDateFormatted', label: 'Due Date' },
      { key: 'returnDateFormatted', label: 'Return Date' },
      { key: 'status', label: 'Status' },
      { key: 'fine', label: 'Fine (INR)' },
    ];

    const exportData = transactions.map((t) => ({
      transactionId: t.transactionId,
      studentName: t.userId?.name || '—',
      studentId: t.userId?.studentId || '—',
      bookTitle: t.bookId?.title || '—',
      isbn: t.bookId?.isbn || '—',
      issueDateFormatted: formatDate(t.issueDate),
      dueDateFormatted: formatDate(t.dueDate),
      returnDateFormatted: t.returnDate ? formatDate(t.returnDate) : 'Not Returned',
      status: t.status,
      fine: t.fine || 0,
    }));

    exportToCSV('library_transactions', exportData, headers);
    toast.success('Transactions exported to CSV');
  };

  const handleExportPDF = () => {
    const headers = ['Txn ID', 'Student', 'Roll No', 'Book Title', 'Issued', 'Due Date', 'Status', 'Fine'];
    const rows = transactions.map((t) => [
      t.transactionId || '—',
      t.userId?.name || '—',
      t.userId?.studentId || '—',
      t.bookId?.title?.slice(0, 26) || '—',
      formatDate(t.issueDate),
      formatDate(t.dueDate),
      t.status.toUpperCase(),
      t.fine ? `₹${t.fine}` : '₹0',
    ]);

    exportToPDF({
      title: 'Circulation & Borrowing Transactions Audit Report',
      subtitle: `Filtered Status: ${selectedStatus} | Records: ${transactions.length}`,
      headers,
      rows,
      filename: 'circulation_audit_log',
    });

    toast.success('PDF report generated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Transaction History & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete record of book issues, returns, extensions, and overdue fines.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by student, book, ISBN, or transaction code..."
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="issued">Currently Issued</option>
              <option value="returned">Returned Volumes</option>
              <option value="overdue">Overdue Loans</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner text="Loading transaction records..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Transactions Found"
          description="No transactions match your current search and filter settings."
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Txn Code</th>
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Book Title</th>
                <th className="pb-3 font-semibold">Issue Date</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Return Date</th>
                <th className="pb-3 font-semibold">Fine</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {t.transactionId}
                  </td>

                  <td className="py-3.5 pr-3">
                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {t.userId?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.userId?.studentId}</p>
                  </td>

                  <td className="py-3.5 pr-3 max-w-[190px]">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {t.bookId?.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.bookId?.isbn}</p>
                  </td>

                  <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formatDate(t.issueDate)}
                  </td>

                  <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formatDate(t.dueDate)}
                  </td>

                  <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {t.returnDate ? formatDate(t.returnDate) : <span className="text-amber-500 font-medium">Pending</span>}
                  </td>

                  <td className="py-3.5 pr-3 font-semibold whitespace-nowrap">
                    {t.fine > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">₹{t.fine}</span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>

                  <td className="py-3.5 pr-3">
                    <Badge status={t.status} size="sm" />
                  </td>

                  <td className="py-3.5 text-right whitespace-nowrap">
                    {t.status === 'issued' ? (
                      <button
                        onClick={() => setSelectedTxnForReturn(t)}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 hover:text-white dark:text-emerald-400 hover:bg-emerald-600 rounded-lg border border-emerald-500/30 transition-all"
                      >
                        Return
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={15}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Return Modal */}
      {selectedTxnForReturn && (
        <ReturnBookModal
          isOpen={!!selectedTxnForReturn}
          onClose={() => setSelectedTxnForReturn(null)}
          transaction={selectedTxnForReturn}
          onSubmit={handleReturnSubmit}
        />
      )}
    </div>
  );
};

export default TransactionsPage;
