import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Building,
  HelpCircle,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { getMyFines } from '../../services/fineService';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MyFinesPage = () => {
  const [fines, setFines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const res = await getMyFines();
        if (res.success) {
          setFines(res.fines || []);
          setSummary(res.summary);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load your fine statement');
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          My Library Fine Statement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Review accumulated overdue penalties, counter payments, and digital receipts.
        </p>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Fine</p>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 font-heading">
              {formatCurrency(summary?.totalPending || 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Settled Fines</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-heading">
              {formatCurrency(summary?.totalPaid || 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Late Fee Rate</p>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5 font-heading">
              ₹5 / Day
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Payment Instruction Alert */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Building className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-white">How to Settle Fines: </span>
          Fines can be settled at the Central Library Circulation Helpdesk using Cash, UPI (GPay / PhonePe), or Campus Debit Cards. A digital receipt code will be updated to your account immediately upon payment.
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving fine statement..." />
      ) : fines.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Zero Fines Outstanding!"
          description="Your library account is in good standing with no pending penalties."
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Fine Ref</th>
                <th className="pb-3 font-semibold">Overdue Book Title</th>
                <th className="pb-3 font-semibold">Late Duration</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Receipt Number</th>
                <th className="pb-3 font-semibold text-right">Payment Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fines.map((f) => (
                <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {f.fineId || f._id.slice(-8)}
                  </td>

                  <td className="py-3.5 pr-3 max-w-[220px]">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {f.bookId?.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">ISBN: {f.bookId?.isbn}</p>
                  </td>

                  <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {f.lateDays} Days Late
                  </td>

                  <td className="py-3.5 pr-3 font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                    ₹{f.amount}
                  </td>

                  <td className="py-3.5 pr-3">
                    <Badge status={f.status} size="sm" />
                  </td>

                  <td className="py-3.5 pr-3 font-mono text-slate-500 dark:text-slate-400">
                    {f.receiptNumber || '—'}
                  </td>

                  <td className="py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                    {f.paymentMethod || 'Not Paid'}
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

export default MyFinesPage;
