import React, { useState, useEffect } from 'react';
import {
  History,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { getMyTransactions } from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

const StudentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getMyTransactions();
        if (res.success) {
          setHistory(res.transactions || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load borrowing history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [toast]);

  const returnedOnTimeCount = history.filter((t) => t.status === 'returned' && (!t.lateDays || t.lateDays === 0)).length;
  const returnedCount = history.filter((t) => t.status === 'returned').length;
  const onTimePercentage = returnedCount > 0 ? Math.round((returnedOnTimeCount / returnedCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Borrowing History & Reading Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Lifetime record of all books borrowed, return stamps, and library circulation history.
        </p>
      </div>

      {/* Reading Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Books Borrowed</p>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5 font-heading">
              {history.length} Volumes
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Books Returned</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-heading">
              {returnedCount} Completed
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">On-Time Return Rate</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 font-heading">
              {onTimePercentage}%
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* History Timeline */}
      {loading ? (
        <LoadingSpinner text="Compiling your reading history..." />
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Borrowing History Found"
          description="You haven't borrowed any books from the central library yet."
          actionText="Browse Books Catalog"
          onAction={() => window.location.href = '/browse-books'}
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Txn Code</th>
                <th className="pb-3 font-semibold">Book Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Issue Date</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Returned Date</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Fine Incurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {history.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {t.transactionId || t._id.slice(-8)}
                  </td>

                  <td className="py-3.5 pr-3 max-w-[220px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center">
                        <img
                          src={t.bookId?.coverImage}
                          alt={t.bookId?.title}
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {t.bookId?.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{t.bookId?.author}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {t.bookId?.category}
                  </td>

                  <td className="py-3.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatDate(t.issueDate)}
                  </td>

                  <td className="py-3.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatDate(t.dueDate)}
                  </td>

                  <td className="py-3.5 pr-3 whitespace-nowrap">
                    {t.returnDate ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatDate(t.returnDate)}
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold">Active Loan</span>
                    )}
                  </td>

                  <td className="py-3.5 pr-3">
                    <Badge status={t.status} size="sm" />
                  </td>

                  <td className="py-3.5 text-right whitespace-nowrap font-bold">
                    {t.fine > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">₹{t.fine}</span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryPage;
