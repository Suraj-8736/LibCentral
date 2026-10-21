import React, { useState, useEffect, useCallback } from 'react';
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  User,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { getRequests, updateRequestStatus } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

const BookRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Status Action Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('approved'); // 'approved' | 'rejected'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  const fetchRequestsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRequests({
        status: selectedStatus,
        page: currentPage,
        limit: 15,
      });

      if (res.success) {
        setRequests(res.requests || []);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load book requests');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, currentPage, toast]);

  useEffect(() => {
    fetchRequestsList();
  }, [fetchRequestsList]);

  const handleOpenActionModal = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setAdminNotes(
      type === 'approved'
        ? 'Approved. Volume placed on order / reserved at circulation counter.'
        : 'Currently unavailable from institutional supplier.'
    );
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const res = await updateRequestStatus(selectedRequest._id, {
        status: actionType,
        adminNotes,
      });

      if (res.success) {
        toast.success(`Request marked as ${actionType}`);
        setSelectedRequest(null);
        fetchRequestsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Student Book Acquisition Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review and process student demands for out-of-stock or newly suggested library titles.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs">
          {['All', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving book requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No Requests Found"
          description="There are currently no book acquisition requests matching this filter."
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Requested Book</th>
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Request Date</th>
                <th className="pb-3 font-semibold">Student Notes</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Book */}
                  <td className="py-3.5 pr-3 max-w-[220px]">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {req.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {req.author ? `By ${req.author}` : 'Catalog Request'}
                    </p>
                  </td>

                  {/* Student */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={req.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.userId?.name}`}
                        alt={req.userId?.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {req.userId?.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{req.userId?.studentId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Request Date */}
                  <td className="py-3.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatDate(req.requestDate)}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 pr-3 max-w-[180px] text-slate-500 dark:text-slate-400 italic truncate">
                    {req.notes || '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pr-3">
                    <Badge status={req.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right whitespace-nowrap">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenActionModal(req, 'approved')}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(req, 'rejected')}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-500/30 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium capitalize">
                        {req.status} by Staff
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

      {/* Status Decision Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={actionType === 'approved' ? 'Approve Book Request' : 'Reject Book Request'}
          subtitle={`Decision for: "${selectedRequest.title}"`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmAction} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Requested by: {selectedRequest.userId?.name} ({selectedRequest.userId?.studentId})
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Book Title: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.title}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Notes / Feedback for Student
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Message displayed on the student's notification..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                  actionType === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BookRequestsPage;
