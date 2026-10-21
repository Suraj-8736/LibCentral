import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated, isStaff } = useAuth();

  const destination = isAuthenticated
    ? isStaff
      ? '/admin/dashboard'
      : '/student/dashboard'
    : '/';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-md">
        <BookOpen className="w-8 h-8" />
      </div>

      <h1 className="text-6xl sm:text-8xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
        404
      </h1>

      <h2 className="text-xl sm:text-2xl font-bold mt-2 font-heading">
        Page or Catalog Volume Not Found
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-8">
        The library resource or page URL you are looking for has been relocated or does not exist.
      </p>

      <Link
        to={destination}
        className="px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
