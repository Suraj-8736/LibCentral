import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BookMarked,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 bg-brand-500/10 dark:bg-brand-500/15 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Central Academic Library System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading max-w-4xl mx-auto leading-tight">
          Smarter Campus Knowledge &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-500">
            Book Circulation.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Comprehensive library management platform for universities. Real-time catalog searches, automated overdue penalties, instant book loans, and in-depth analytics.
        </p>

        {/* CTA Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Sign In to Library</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl shadow-sm transition-all"
          >
            Create Student Account
          </Link>
        </div>

        {/* Hero Banner Showcase */}
        <div className="mt-12 relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 group">
          <div className="relative aspect-[21/9] sm:aspect-[2.2/1] w-full overflow-hidden">
            <img
              src="/library_hero_banner.jpg"
              alt="Modern Academic Digital Library"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-300" />
                  <span>Smart Central Campus Hub</span>
                </div>
                <h3 className="text-base sm:text-2xl font-bold text-white font-heading drop-shadow-md">
                  State-of-the-Art Digital & Physical Learning Repository
                </h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>24/7 Digital Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Highlights Ribbon */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 font-heading">16+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Catalog Volumes</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">3 Roles</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin, Librarian, Student</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-heading">₹5 / Day</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated Fine Engine</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-heading">PDF & CSV</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Exportable Reports</p>
          </div>
        </div>
      </section>

      {/* Role-Based Portals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Tailored Experiences for Every Campus Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
            Fine-grained permissions and dedicated dashboards for staff and scholars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/50 transition-colors">
            <div className="p-3 w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Administrator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
              Full control over book inventory, student directory, system fine policies, circulation logs, and academic PDF reports.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Executive analytics & charts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>System configuration & rules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fine waiver & reconciliation</span>
              </li>
            </ul>
          </div>

          {/* Librarian */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/50 transition-colors">
            <div className="p-3 w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Librarian
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
              Streamlined circulation desk to issue and return books, approve student acquisition requests, and track overdue loans.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>One-click issue & return engine</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Approve/Reject book requests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Overdue reminders & notifications</span>
              </li>
            </ul>
          </div>

          {/* Student */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/50 transition-colors">
            <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Student / Scholar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
              Self-service portal to browse book catalog, monitor return due dates, check fines, request books, and review borrowing history.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live catalog search & filters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Due date countdown alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fine statement & digital receipts</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
