import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookMarked,
  Users,
  ArrowLeftRight,
  ClipboardList,
  GitPullRequest,
  Receipt,
  BarChart3,
  Settings,
  BookOpen,
  History,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isLibrarian, isStaff, isStudent } = useAuth();

  const adminNavLinks = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Book Catalog', to: '/admin/books', icon: BookMarked },
    { label: 'Students', to: '/admin/students', icon: Users },
    { label: 'Circulation Desk', to: '/admin/circulation', icon: ArrowLeftRight },
    { label: 'Transactions', to: '/admin/transactions', icon: ClipboardList },
    { label: 'Book Requests', to: '/admin/requests', icon: GitPullRequest },
    { label: 'Fine Management', to: '/admin/fines', icon: Receipt },
    { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'Settings', to: '/admin/settings', icon: Settings }] : []),
  ];

  const studentNavLinks = [
    { label: 'Student Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Browse Catalog', to: '/browse-books', icon: BookOpen },
    { label: 'My Issued Books', to: '/my-books', icon: BookMarked },
    { label: 'My Requests', to: '/my-requests', icon: GitPullRequest },
    { label: 'My Fines', to: '/my-fines', icon: Receipt },
    { label: 'Borrowing History', to: '/borrowing-history', icon: History },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  const navLinks = isStaff ? adminNavLinks : studentNavLinks;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Close Button for Mobile */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-slate-900 dark:text-white tracking-tight">
              Lib<span className="text-brand-600 dark:text-brand-400">Central</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.studentId || user?.email}
              </p>
              <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isStaff ? 'Library Management' : 'Student Portal'}
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 via-brand-500/5 to-transparent border border-brand-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Library v2.0</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated fines, real-time inventory, and instant reporting.
            </p>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
