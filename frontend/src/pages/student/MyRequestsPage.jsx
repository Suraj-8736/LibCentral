import React, { useState, useEffect, useCallback } from 'react';
import {
  GitPullRequest,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  Trash2,
  Sparkles,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { getMyRequests, createRequest, deleteRequest } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please specify the book title');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createRequest(formData);
      if (res.success) {
        toast.success('Book acquisition request submitted to library');
        setIsModalOpen(false);
        setFormData({ title: '', author: '', notes: '' });
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      const res = await deleteRequest(id);
      if (res.success) {
        toast.success('Request cancelled');
        fetchRequests();
      }
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            My Book Acquisition Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Request unavailable catalog titles or recommend new volumes for library procurement.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Acquisition Request</span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <LoadingSpinner text="Retrieving your book requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No Requests Submitted"
          description="You haven't requested any unavailable or new library books yet."
          actionText="Request a Book"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {req.title}
                  </span>
                  <Badge status={req.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {req.author ? `Author: ${req.author}` : 'General Academic Request'} • Submitted on {formatDate(req.requestDate)}
                </p>

                {req.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                    "{req.notes}"
                  </p>
                )}

                {req.adminNotes && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-brand-600 dark:text-brand-400">Librarian Response: </span>
                    <span className="text-slate-600 dark:text-slate-300">{req.adminNotes}</span>
                  </div>
                )}
              </div>

              {req.status === 'pending' && (
                <button
                  onClick={() => handleCancelRequest(req._id)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-rose-500/20 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Request</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Submit Book Acquisition Request"
          subtitle="Recommend an academic title or request an out-of-stock library volume"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Operating System Concepts (Silberschatz)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Author(s)
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Abraham Silberschatz, Peter B. Galvin"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Coursework Purpose / Remarks
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Why do you need this title? e.g. Major Project reference, Exam prep..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Send Request to Library</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MyRequestsPage;
