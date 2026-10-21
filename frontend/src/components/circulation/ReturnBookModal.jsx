import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { BookOpen, AlertTriangle, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import confetti from 'canvas-confetti';

const ReturnBookModal = ({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  loading = false,
  finePerDay = 5,
}) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [calc, setCalc] = useState({ lateDays: 0, fine: 0 });

  useEffect(() => {
    if (transaction && transaction.dueDate) {
      const due = new Date(transaction.dueDate);
      const ret = new Date(returnDate);
      due.setHours(0, 0, 0, 0);
      ret.setHours(0, 0, 0, 0);

      const diffTime = ret.getTime() - due.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setCalc({
          lateDays: diffDays,
          fine: diffDays * Number(finePerDay),
        });
      } else {
        setCalc({ lateDays: 0, fine: 0 });
      }
    }
  }, [transaction, returnDate, finePerDay]);

  if (!transaction) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      transactionId: transaction._id,
      returnDate,
      notes,
    });

    if (calc.lateDays === 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Book Return"
      subtitle={`Transaction ID: ${transaction.transactionId || transaction._id}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Book & Borrower Overview */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Borrower Details</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {transaction.userId?.name} ({transaction.userId?.studentId})
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={transaction.bookId?.coverImage}
                alt={transaction.bookId?.title}
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {transaction.bookId?.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Author: {transaction.bookId?.author}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Issued: </span>
                  <span className="font-semibold">{formatDate(transaction.issueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Due: </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {formatDate(transaction.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Date Control */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Actual Return Date
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Fine & Penalty Assessment Banner */}
        {calc.lateDays > 0 ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Late Return Detected ({calc.lateDays} Days Overdue)
                </p>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                  Calculated at ₹{finePerDay} per day penalty rate
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-rose-500">Fine Incurred</p>
              <p className="text-xl font-extrabold text-rose-700 dark:text-rose-300 font-heading">
                ₹{calc.fine}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Returned On Time
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                Zero fine incurred. Book will immediately return to available catalog stock.
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Condition / Return Remarks
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Good condition, returned at desk"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>Complete Return</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnBookModal;
