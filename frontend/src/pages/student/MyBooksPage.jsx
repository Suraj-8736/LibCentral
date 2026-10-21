import React, { useState, useEffect, useCallback } from 'react';
import {
  BookMarked,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Barcode,
  Layers,
  ArrowRight,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { getMyTransactions } from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const MyBooksPage = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [historyLoans, setHistoryLoans] = useState([]);
  const [selectedTab, setSelectedTab] = useState('active'); // 'active' | 'history'
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const fetchMyLoans = useCallback(async () => {
    try {
      setLoading(true);
      const [activeRes, allRes] = await Promise.all([
        getMyTransactions({ status: 'issued' }),
        getMyTransactions(),
      ]);

      if (activeRes.success) setActiveLoans(activeRes.transactions || []);
      if (allRes.success) {
        const returned = allRes.transactions?.filter((t) => t.status === 'returned') || [];
        setHistoryLoans(returned);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your issued books');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyLoans();
  }, [fetchMyLoans]);

  const displayLoans = selectedTab === 'active' ? activeLoans : historyLoans;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            My Issued Books & Loans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor return deadlines, shelf origins, and borrowing history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-semibold">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedTab === 'active'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Currently Issued ({activeLoans.length})
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedTab === 'history'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Past Returned ({historyLoans.length})
          </button>
        </div>
      </div>

      {/* Circulation Guidelines Banner */}
      {selectedTab === 'active' && activeLoans.length > 0 && (
        <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-brand-800 dark:text-brand-300">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>
              <strong>Circulation Rule:</strong> Please return books to the central library desk by the specified due date. Late returns accrue ₹5/day penalty.
            </span>
          </div>
          <span className="font-bold text-brand-600 dark:text-brand-400 shrink-0">Desk Timings: 9:00 AM - 7:00 PM</span>
        </div>
      )}

      {/* Loans Grid / Cards */}
      {loading ? (
        <LoadingSpinner text="Fetching your loans registry..." />
      ) : displayLoans.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={selectedTab === 'active' ? 'No Books Currently Issued' : 'No Past Loans Found'}
          description={
            selectedTab === 'active'
              ? 'You do not have any library books checked out right now.'
              : 'You have not returned any books in the past.'
          }
          actionText={selectedTab === 'active' ? 'Browse Catalog' : undefined}
          onAction={selectedTab === 'active' ? () => window.location.href = '/browse-books' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayLoans.map((loan) => {
            const isOverdue = loan.isOverdue;
            return (
              <div
                key={loan._id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-sm ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : loan.daysRemaining <= 3
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-center">
                    <img
                      src={loan.bookId?.coverImage}
                      alt={loan.bookId?.title}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {loan.bookId?.category}
                      </span>
                      <Badge status={loan.status} size="sm" />
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 pt-1 font-heading">
                      {loan.bookId?.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      By {loan.bookId?.author}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <MapPin className="w-3 h-3 text-brand-500" />
                      <span>{loan.bookId?.shelfNumber || 'Rack A-1'}</span>
                    </div>
                  </div>
                </div>

                {/* Dates & Status Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(loan.issueDate)}
                    </span>
                  </div>

                  {loan.returnDate ? (
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Returned On</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatDate(loan.returnDate)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Deadline</span>
                      <p className={`font-bold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatDate(loan.dueDate)}
                      </p>
                      {isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-500">
                          {loan.currentLateDays}d Overdue (₹{loan.currentEstimatedFine} Fine)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {loan.daysRemaining} days remaining
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBooksPage;
