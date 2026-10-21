import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  BookOpen,
  User,
  Calendar,
  Layers,
  MapPin,
  Barcode,
  Building,
  TrendingUp,
  BookmarkPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BookDetailsModal = ({
  isOpen,
  onClose,
  book,
  onRequestBorrow,
  onIssueDirectly,
}) => {
  const { isStaff, isStudent } = useAuth();
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Information & Availability"
      subtitle={`Catalog Identifier: ${book.bookId || book.isbn}`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Cover Image */}
        <div className="w-full md:w-56 shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-900 aspect-[3/4] relative flex items-center justify-center p-2">
            <img
              src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'}
              alt={book.title}
              className="w-full h-full object-contain rounded-xl shadow-sm bg-white dark:bg-slate-900"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop';
              }}
            />
            <div className="absolute top-3 right-3 z-10">
              <Badge status={isAvailable ? 'available' : 'out_of_stock'} size="sm">
                {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Times Borrowed</p>
            <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400 font-heading">
              {book.timesBorrowed || 0} times
            </p>
          </div>
        </div>

        {/* Right Details Grid */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {book.category}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading leading-snug">
              {book.title}
            </h3>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span>By {book.author}</span>
            </p>

            {/* Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {book.description || 'No synopsis provided for this catalog volume.'}
            </p>
          </div>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Barcode className="w-3.5 h-3.5" />
                <span>ISBN</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{book.isbn}</p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Shelf Rack</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{book.shelfNumber || 'Rack A-101'}</p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Building className="w-3.5 h-3.5" />
                <span>Publisher</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{book.publisher || 'University Press'}</p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Year</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{book.publicationYear}</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>

            {isStudent && (
              <button
                onClick={() => {
                  onClose();
                  if (onRequestBorrow) onRequestBorrow(book);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-md flex items-center gap-1.5 ${
                  isAvailable
                    ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isAvailable ? 'Borrow This Book' : 'Request When Available'}</span>
              </button>
            )}

            {isStaff && isAvailable && (
              <button
                onClick={() => {
                  onClose();
                  if (onIssueDirectly) onIssueDirectly(book);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Issue to Student</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookDetailsModal;
