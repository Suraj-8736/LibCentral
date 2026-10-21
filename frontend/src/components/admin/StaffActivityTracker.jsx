import React, { useState } from 'react';
import {
  Users,
  Shield,
  BookMarked,
  Activity,
  LogIn,
  LogOut,
  Clock,
  History,
  X,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Laptop,
} from 'lucide-react';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/formatters';

const formatTimeOnly = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const formatDuration = (startString, endString, isActive = false) => {
  if (!startString) return '—';
  const start = new Date(startString).getTime();
  const end = endString ? new Date(endString).getTime() : (isActive ? Date.now() : start);
  const diffMins = Math.max(0, Math.round((end - start) / (1000 * 60)));
  
  if (diffMins < 1) return '< 1 min';
  if (diffMins < 60) return `${diffMins} mins`;
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hrs}h ${mins}m`;
};

const StaffActivityTracker = ({ staffMembers = [] }) => {
  const [selectedStaffForHistory, setSelectedStaffForHistory] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  // Filter specifically for Librarians
  const librarians = staffMembers.filter((s) => s.role === 'librarian');
  // Fallback to all staff if no librarian role exists yet
  const displayStaff = librarians.length > 0 ? librarians : staffMembers;

  const onlineCount = displayStaff.filter((s) => s.isOnline).length;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <span>Librarian Live Attendance & Activity</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                onlineCount > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {onlineCount} {onlineCount === 1 ? 'Librarian' : 'Librarians'} Online Now
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking of login time, logout/tab-close timestamps & daily login frequency
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Assigned Librarians: <strong className="text-slate-700 dark:text-slate-200">{displayStaff.length}</strong></span>
        </div>
      </div>

      {/* Librarian Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {displayStaff.map((staff) => {
          const isOnline = staff.isOnline;
          const loginHistory = staff.loginHistory || [];

          // Calculate today's metrics
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const todayLogs = loginHistory.filter((log) => {
            const logDate = new Date(log.loginTime);
            return logDate >= todayStart;
          });

          const todayLoginCount = todayLogs.length;

          let todayTotalMinutes = 0;
          todayLogs.forEach((log) => {
            const start = new Date(log.loginTime).getTime();
            const end = log.logoutTime ? new Date(log.logoutTime).getTime() : (isOnline ? Date.now() : start);
            todayTotalMinutes += Math.max(0, Math.round((end - start) / (1000 * 60)));
          });

          const todayHours = Math.floor(todayTotalMinutes / 60);
          const todayMins = todayTotalMinutes % 60;
          const todayTimeString = todayTotalMinutes > 0 ? `${todayHours > 0 ? `${todayHours}h ` : ''}${todayMins}m` : '0m';

          // Current / Latest session
          const latestLog = loginHistory[0];

          return (
            <div
              key={staff._id}
              className={`p-5 rounded-2xl border transition-all ${
                isOnline
                  ? 'bg-gradient-to-br from-emerald-500/[0.04] via-white to-indigo-500/[0.02] dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-800/70 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Profile Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`}
                      alt={staff.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {staff.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {staff.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {staff.email} {staff.phone ? `• ${staff.phone}` : ''}
                    </p>
                  </div>
                </div>

                {/* Live Status Pill */}
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>🟢 Currently Active & Signed In</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>⚪ Offline (Tab Closed / Logged Out)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Key Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
                {/* 1. Today's Login Count */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                    Today's Logins
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      {todayLoginCount}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {todayLoginCount === 1 ? 'time' : 'times today'}
                    </span>
                  </div>
                </div>

                {/* 2. Total Time Spent Today */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Today's Duty Time
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                      {todayTimeString}
                    </span>
                    <span className="text-[11px] text-slate-400">active</span>
                  </div>
                </div>

                {/* 3. Last/Current Login Time */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                    Last Sign In
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {staff.lastLogin ? formatTimeOnly(staff.lastLogin) : '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {staff.lastLogin ? formatRelativeTime(staff.lastLogin) : ''}
                    </span>
                  </div>
                </div>

                {/* 4. Last Logout / Cut Time */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Last Sign Out / Cut
                  </span>
                  <div>
                    {isOnline ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In Session
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {staff.lastLogout ? formatTimeOnly(staff.lastLogout) : (latestLog?.logoutTime ? formatTimeOnly(latestLog.logoutTime) : '—')}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {staff.lastLogout ? formatRelativeTime(staff.lastLogout) : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Today's Session Log Breakdown */}
              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Today's Login & Logout Sessions ({todayLoginCount})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffForHistory(staff)}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Full Historical Logs</span>
                  </button>
                </div>

                {todayLogs.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-center text-slate-400 text-xs">
                    No login sessions recorded yet today for this librarian.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayLogs.slice(0, 3).map((log, index) => {
                      const isActiveNow = index === 0 && isOnline && !log.logoutTime;
                      const duration = formatDuration(log.loginTime, log.logoutTime, isActiveNow);

                      return (
                        <div
                          key={log._id || index}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                              #{todayLogs.length - index}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1">
                                <LogIn className="w-3 h-3 text-emerald-500" />
                                Login: <strong className="text-slate-900 dark:text-white">{formatTimeOnly(log.loginTime)}</strong>
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1">
                                <LogOut className="w-3 h-3 text-rose-500" />
                                Logout / Cut:{' '}
                                {isActiveNow ? (
                                  <strong className="text-emerald-600 dark:text-emerald-400">🟢 Active Now</strong>
                                ) : (
                                  <strong className="text-slate-900 dark:text-white">{formatTimeOnly(log.logoutTime)}</strong>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 sm:self-auto self-end">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              Duration: <strong className="text-slate-700 dark:text-slate-300">{duration}</strong>
                            </span>
                            {isActiveNow ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {todayLogs.length > 3 && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedStaffForHistory(staff)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                        >
                          + {todayLogs.length - 3} more sessions today (View all)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Audit Modal */}
      {selectedStaffForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStaffForHistory.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStaffForHistory.name}`}
                  alt={selectedStaffForHistory.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    {selectedStaffForHistory.name} — Attendance & Login History
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Role: <span className="capitalize font-semibold text-brand-600 dark:text-brand-400">{selectedStaffForHistory.role}</span> ({selectedStaffForHistory.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStaffForHistory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Recorded Sessions ({selectedStaffForHistory.loginHistory?.length || 0})
                </span>
                <span className="text-xs text-slate-400">Chronological history</span>
              </div>

              {!selectedStaffForHistory.loginHistory || selectedStaffForHistory.loginHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No login history recorded yet for this user.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedStaffForHistory.loginHistory.map((log, index) => {
                    const isCurrentActive = index === 0 && selectedStaffForHistory.isOnline && !log.logoutTime;
                    const durationText = formatDuration(log.loginTime, log.logoutTime, isCurrentActive);

                    return (
                      <div
                        key={log._id || index}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Session #{selectedStaffForHistory.loginHistory.length - index}
                            </span>
                            {isCurrentActive ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Session
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                Completed
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                              <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                              <strong className="text-slate-800 dark:text-slate-200">In:</strong> {formatDateTime(log.loginTime)}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="flex items-center gap-1">
                              <LogOut className="w-3.5 h-3.5 text-rose-400" />
                              <strong className="text-slate-800 dark:text-slate-200">Out / Cut:</strong>{' '}
                              {isCurrentActive ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">In Session</span>
                              ) : log.logoutTime ? (
                                formatDateTime(log.logoutTime)
                              ) : (
                                '—'
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {durationText}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center sm:justify-end gap-1 mt-0.5">
                            <Laptop className="w-3 h-3" />
                            <span>{log.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-400">
                Auto-synced with live attendance heartbeat & disconnect beacon
              </span>
              <button
                type="button"
                onClick={() => setSelectedStaffForHistory(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StaffActivityTracker;
