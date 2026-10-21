import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  BookmarkPlus,
  Eye,
  Layers,
  MapPin,
} from 'lucide-react';
import BookCard from '../../components/books/BookCard';
import BookDetailsModal from '../../components/books/BookDetailsModal';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getBooks } from '../../services/bookService';
import { createRequest } from '../../services/requestService';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../utils/constants';

const BrowseBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);
  const [bookToRequest, setBookToRequest] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const { toast } = useToast();

  const fetchBooksCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBooks({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        page: currentPage,
        limit: 12,
      });

      if (res.success) {
        setBooks(res.books || []);
        setTotalPages(res.totalPages || 1);
        setTotalBooks(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load books catalog');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, currentPage, toast]);

  useEffect(() => {
    fetchBooksCatalog();
  }, [fetchBooksCatalog]);

  const handleBorrowRequestSubmit = async (e) => {
    e.preventDefault();
    if (!bookToRequest) return;

    try {
      setRequestLoading(true);
      const res = await createRequest({
        bookId: bookToRequest._id,
        title: bookToRequest.title,
        author: bookToRequest.author,
        notes: requestNotes,
      });

      if (res.success) {
        toast.success(res.message || 'Borrow request submitted successfully');
        setBookToRequest(null);
        setRequestNotes('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Browse Library Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Explore textbooks, research publications, and reference guides across university departments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by book title, author name, or ISBN..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Availability</option>
              <option value="available">Available in Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="popular">Most Popular</option>
              <option value="createdAt">Newest Additions</option>
              <option value="title">Title (A - Z)</option>
              <option value="year">Publication Year</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <LoadingSpinner text="Searching library catalog..." />
      ) : books.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description="We couldn't find any books matching your search. You can submit a request for the book under My Requests."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onViewDetails={() => setSelectedBookForDetails(book)}
              onRequestBorrow={() => {
                setBookToRequest(book);
                setRequestNotes('');
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalBooks}
        itemsPerPage={12}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Details Modal */}
      {selectedBookForDetails && (
        <BookDetailsModal
          isOpen={!!selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          book={selectedBookForDetails}
          onRequestBorrow={(book) => {
            setBookToRequest(book);
            setRequestNotes('');
          }}
        />
      )}

      {/* Borrow / Request Modal */}
      {bookToRequest && (
        <Modal
          isOpen={!!bookToRequest}
          onClose={() => setBookToRequest(null)}
          title="Borrow Request"
          subtitle={`Book: "${bookToRequest.title}"`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleBorrowRequestSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{bookToRequest.title}</p>
              <p className="text-slate-500 dark:text-slate-400">By {bookToRequest.author}</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                {bookToRequest.availableCopies > 0
                  ? `${bookToRequest.availableCopies} available in stack (${bookToRequest.shelfNumber})`
                  : 'Currently checked out (librarian will reserve upon return)'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Coursework Purpose / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="e.g. For semester assignment, exam preparation..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBookToRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2"
              >
                {requestLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BrowseBooksPage;
