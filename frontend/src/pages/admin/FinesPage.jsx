import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Ban,
  DollarSign,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { getFines, payFine, waiveFine } from '../../services/fineService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';

const FinesPage = () => {
  const [fines, setFines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [fineToPay, setFineToPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [payNotes, setPayNotes] = useState('');

  // Waive Modal
  const [fineToWaive, setFineToWaive] = useState(null);
  const [waiveReason, setWaiveReason] = useState('Medical or administrative dispensation');

  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchFinesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getFines({
        status: selectedStatus,
        search: searchQuery,
        page: currentPage,
        limit: 15,
      });

      if (res.success) {
        setFines(res.fines || []);
        setSummary(res.summary);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery, currentPage, toast]);

  useEffect(() => {
    fetchFinesList();
  }, [fetchFinesList]);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!fineToPay) return;

    try {
      setActionLoading(true);
      const res = await payFine(fineToPay._id, {
        paymentMethod,
        notes: payNotes,
      });

      if (res.success) {
        toast.success(res.message || 'Fine marked as paid');
        setFineToPay(null);
        fetchFinesList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle fine');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaiveSubmit = async (e) => {
    e.preventDefault();
    if (!fineToWaive) return;

    try {
      setActionLoading(true);
      const res = await waiveFine(fineToWaive._id, {
        reason: waiveReason,
      });

      if (res.success) {
        toast.success('Fine waived successfully');
        setFineToWaive(null);
        fetchFinesList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to waive fine');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      { key: 'fineId', label: 'Fine ID' },
      { key: 'studentName', label: 'Student' },
      { key: 'studentId', label: 'Roll Number' },
      { key: 'bookTitle', label: 'Book Title' },
      { key: 'lateDays', label: 'Late Days' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'status', label: 'Status' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'receiptNumber', label: 'Receipt No' },
      { key: 'date', label: 'Generated Date' },
    ];

    const data = fines.map((f) => ({
      fineId: f.fineId || f._id,
      studentName: f.userId?.name || '—',
      studentId: f.userId?.studentId || '—',
      bookTitle: f.bookId?.title || '—',
      lateDays: f.lateDays || 0,
      amount: f.amount || 0,
      status: f.status,
      paymentMethod: f.paymentMethod || '—',
      receiptNumber: f.receiptNumber || '—',
      date: formatDate(f.createdAt),
    }));

    exportToCSV('library_fines_statement', data, headers);
    toast.success('Fines statement exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Overdue Fine Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track late return penalties, counter payments, digital receipts, and authorized waivers.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Fines CSV</span>
        </button>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collected</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-heading">
              {formatCurrency(summary?.totalCollected || 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outstanding</p>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 font-heading">
              {formatCurrency(summary?.totalPending || 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Penalty Levied</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-heading">
              {formatCurrency(summary?.totalFineAssessed || 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search by student, roll no, fine ID, or book title..."
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
          {['All', 'pending', 'paid'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <LoadingSpinner text="Querying fines ledger..." />
      ) : fines.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Fine Records Found"
          description="There are currently no overdue fines matching your search filters."
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Fine Ref</th>
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Overdue Book</th>
                <th className="pb-3 font-semibold">Late Days</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Payment Status</th>
                <th className="pb-3 font-semibold">Receipt / Mode</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fines.map((f) => (
                <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {f.fineId || f._id.slice(-8)}
                  </td>

                  <td className="py-3.5 pr-3">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {f.userId?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{f.userId?.studentId}</p>
                  </td>

                  <td className="py-3.5 pr-3 max-w-[190px]">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {f.bookId?.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">ISBN: {f.bookId?.isbn}</p>
                  </td>

                  <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {f.lateDays} Days
                  </td>

                  <td className="py-3.5 pr-3 font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                    ₹{f.amount}
                  </td>

                  <td className="py-3.5 pr-3">
                    <Badge status={f.status} size="sm" />
                  </td>

                  <td className="py-3.5 pr-3">
                    {f.status === 'paid' ? (
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {f.paymentMethod}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{f.receiptNumber}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unpaid</span>
                    )}
                  </td>

                  <td className="py-3.5 text-right whitespace-nowrap">
                    {f.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setFineToPay(f);
                            setPayNotes('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                        >
                          Mark Paid
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => setFineToWaive(f)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-500/30 transition-colors"
                          >
                            Waive
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Settled
                      </span>
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

      {/* Mark Paid Modal */}
      {fineToPay && (
        <Modal
          isOpen={!!fineToPay}
          onClose={() => setFineToPay(null)}
          title="Collect & Settle Library Fine"
          subtitle={`Student: ${fineToPay.userId?.name} | Amount: ₹${fineToPay.amount}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-600">Total Penalty Amount Due</p>
              <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 font-heading">
                ₹{fineToPay.amount}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                For {fineToPay.lateDays} days overdue on "{fineToPay.bookId?.title}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Collection Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="UPI / Online">UPI / Online Transfer (GPay, PhonePe, Paytm)</option>
                <option value="Card">POS Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Reference / Remarks
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. Counter cash received / UPI txn ref"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setFineToPay(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Generate Receipt & Settle</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Waive Modal */}
      {fineToWaive && (
        <Modal
          isOpen={!!fineToWaive}
          onClose={() => setFineToWaive(null)}
          title="Waive Library Fine"
          subtitle={`Student: ${fineToWaive.userId?.name} | Amount: ₹${fineToWaive.amount}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleWaiveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Reason for Waiver
              </label>
              <textarea
                rows={3}
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="Enter justification for audit log..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setFineToWaive(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20"
              >
                Confirm Waiver
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FinesPage;
