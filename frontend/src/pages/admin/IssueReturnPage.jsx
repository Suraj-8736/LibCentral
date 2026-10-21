import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  UserCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Receipt,
} from 'lucide-react';
import IssueBookModal from '../../components/circulation/IssueBookModal';
import ReturnBookModal from '../../components/circulation/ReturnBookModal';
import SearchInput from '../../components/common/SearchInput';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { getTransactions, issueBook, returnBook } from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';

const IssueReturnPage = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedTransactionForReturn, setSelectedTransactionForReturn] = useState(null);

  const { toast } = useToast();

  const fetchActiveLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransactions({
        status: 'issued',
        search: searchQuery,
        limit: 50,
      });
      if (res.success) {
        setActiveLoans(res.transactions || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active loans');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    fetchActiveLoans();
  }, [fetchActiveLoans]);

  const handleIssueSubmit = async (payload) => {
    try {
      const res = await issueBook(payload);
      if (res.success) {
        toast.success(res.message || 'Book issued successfully');
        setIsIssueModalOpen(false);
        fetchActiveLoans();
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
        setSelectedTransactionForReturn(null);
        fetchActiveLoans();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Circulation Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time book issuance, barcode search, return processing, and overdue calculations.
          </p>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Circulation Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Quick search by Student ID, Name, Book Title, ISBN, or Transaction Code..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Active Borrowings: <strong className="text-slate-900 dark:text-white">{activeLoans.length}</strong></span>
        </div>
      </div>

      {/* Active Borrowing Loans Table */}
      {loading ? (
        <LoadingSpinner text="Querying active circulation records..." />
      ) : activeLoans.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No Active Loans Found"
          description="All books are currently in library inventory. Click Issue New Loan to check out a volume to a student."
          actionText="Issue Book"
          onAction={() => setIsIssueModalOpen(true)}
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Borrower</th>
                <th className="pb-3 font-semibold">Book Title</th>
                <th className="pb-3 font-semibold">Issue Date</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Circulation Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activeLoans.map((txn) => {
                const isOverdue = txn.isCurrentlyOverdue;
                return (
                  <tr
                    key={txn._id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                      isOverdue ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    {/* TXN ID */}
                    <td className="py-3.5 pr-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {txn.transactionId || txn._id.slice(-8)}
                    </td>

                    {/* Borrower */}
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={txn.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${txn.userId?.name}`}
                          alt={txn.userId?.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {txn.userId?.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {txn.userId?.studentId} • {txn.userId?.branch?.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Book */}
                    <td className="py-3.5 pr-3 max-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={txn.bookId?.coverImage}
                          alt={txn.bookId?.title}
                          className="w-8 h-10 rounded object-cover shadow-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {txn.bookId?.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {txn.bookId?.shelfNumber || 'Shelf'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300">
                      {formatDate(txn.issueDate)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 pr-3">
                      <p className={`font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {formatDate(txn.dueDate)}
                      </p>
                      {isOverdue && (
                        <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                          {txn.currentLateDays}d late (Est Fine: ₹{txn.currentEstimatedFine})
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-3">
                      <Badge status={isOverdue ? 'overdue' : 'issued'} size="sm">
                        {isOverdue ? 'Overdue' : 'Issued'}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTransactionForReturn(txn)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all ${
                          isOverdue
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        }`}
                      >
                        Process Return
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isIssueModalOpen && (
        <IssueBookModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onSubmit={handleIssueSubmit}
        />
      )}

      {selectedTransactionForReturn && (
        <ReturnBookModal
          isOpen={!!selectedTransactionForReturn}
          onClose={() => setSelectedTransactionForReturn(null)}
          transaction={selectedTransactionForReturn}
          onSubmit={handleReturnSubmit}
        />
      )}
    </div>
  );
};

export default IssueReturnPage;
