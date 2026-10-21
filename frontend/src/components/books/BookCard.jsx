import React from 'react';
import { BookOpen, Layers, MapPin, Eye, BookmarkPlus, Edit, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

const BookCard = ({
  book,
  onViewDetails,
  onRequestBorrow,
  onEdit,
  onDelete,
  onIssueDirectly,
}) => {
  const { isStaff, isStudent } = useAuth();
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden card-hover transition-all duration-300">
      {/* Cover Image Container - Full uncropped book display */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-b from-slate-100 via-slate-150 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-3 border-b border-slate-100 dark:border-slate-800/80">
        {/* Ambient subtle blur glow behind book */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 dark:opacity-30 scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${book.coverImage})` }}
        />

        {/* Book Showcase Frame */}
        <div className="relative z-10 h-full max-w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md shadow-slate-900/15 group-hover:shadow-2xl group-hover:scale-[1.03] transition-all duration-300 ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-slate-900 flex items-center justify-center">
          <img
            src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'}
            alt={book.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop';
            }}
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900/85 text-white backdrop-blur-md border border-white/10 shadow-xs max-w-[55%] truncate">
            {book.category}
          </span>

          <Badge status={isAvailable ? 'available' : 'out_of_stock'} size="sm">
            {isAvailable ? `${book.availableCopies} Left` : 'Out of Stock'}
          </Badge>
        </div>

        {/* Bottom Shelf Tag */}
        <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between text-[11px] pointer-events-none">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/75 text-white/90 backdrop-blur-md border border-white/10 font-medium">
            <MapPin className="w-3 h-3 text-brand-400" />
            <span className="text-[10px]">{book.shelfNumber || 'Rack A-1'}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-900/75 text-[10px] font-mono font-bold text-slate-300 backdrop-blur-md border border-white/10">
            {book.bookId || book.isbn?.slice(-6)}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-4">
        <h4
          onClick={onViewDetails}
          className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer font-heading"
          title={book.title}
        >
          {book.title}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          By <span className="font-semibold text-slate-700 dark:text-slate-300">{book.author}</span>
        </p>

        {/* Copies Info */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{book.availableCopies} / {book.totalCopies} Copies</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {book.publicationYear}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-2 flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {isStudent && (
            <button
              onClick={onRequestBorrow}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                isAvailable
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{isAvailable ? 'Borrow' : 'Request'}</span>
            </button>
          )}

          {isStaff && (
            <div className="flex items-center gap-1">
              {onIssueDirectly && isAvailable && (
                <button
                  onClick={onIssueDirectly}
                  className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
                  title="Issue to student"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Edit book"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                  title="Delete book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
