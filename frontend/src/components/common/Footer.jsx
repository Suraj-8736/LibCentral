import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = ({ className = '' }) => {
  return (
    <footer className={`border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm py-6 text-center text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Designed & Developed by Saurabh Sahu
          </span>
        </div>
        <p>© {new Date().getFullYear()} LibCentral. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
