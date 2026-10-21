import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Barcode,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import BookCard from '../../components/books/BookCard';
import BookFormModal from '../../components/books/BookFormModal';
import BookDetailsModal from '../../components/books/BookDetailsModal';
import IssueBookModal from '../../components/circulation/IssueBookModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} from '../../services/bookService';
import { issueBook } from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../utils/constants';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [bookToIssueDirectly, setBookToIssueDirectly] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();
  const { isStaff } = useAuth();

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBooks({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        order,
        page: currentPage,
        limit: viewMode === 'grid' ? 12 : 15,
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
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, order, currentPage, viewMode, toast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedBookForEdit) {
        const res = await updateBook(selectedBookForEdit._id, formData);
        if (res.success) {
          toast.success('Book updated successfully');
          setIsFormModalOpen(false);
          setSelectedBookForEdit(null);
          fetchBooks();
        }
      } else {
        const res = await createBook(formData);
        if (res.success) {
          toast.success('Book created successfully');
          setIsFormModalOpen(false);
          fetchBooks();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    try {
      setActionLoading(true);
      const res = await deleteBook(bookToDelete._id);
      if (res.success) {
        toast.success('Book deleted successfully');
        setBookToDelete(null);
        fetchBooks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueSubmit = async (payload) => {
    try {
      setActionLoading(true);
      const res = await issueBook(payload);
      if (res.success) {
        toast.success(res.message || 'Book issued successfully');
        setBookToIssueDirectly(null);
        fetchBooks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
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
            Book Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage library volumes, shelf locations, ISBN metadata, and physical stock.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => {
              setSelectedBookForEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by title, author, ISBN, or publisher..."
            />
          </div>

          {/* Availability Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
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
              <option value="out_of_stock">Out of Stock (0 Copies)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split(':');
                setSortBy(sb);
                setOrder(ord);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="createdAt:desc">Newest Additions</option>
              <option value="title:asc">Title (A - Z)</option>
              <option value="title:desc">Title (Z - A)</option>
              <option value="popular:desc">Most Borrowed</option>
              <option value="year:desc">Publication Year</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
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

      {/* Main Books Content */}
      {loading ? (
        <LoadingSpinner text="Fetching library books catalog..." />
      ) : books.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description="Try adjusting your search query, clearing filters, or adding a new book to the catalog."
          actionText={isStaff ? 'Add New Book' : undefined}
          onAction={isStaff ? () => setIsFormModalOpen(true) : undefined}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onViewDetails={() => setSelectedBookForDetails(book)}
              onEdit={
                isStaff
                  ? () => {
                      setSelectedBookForEdit(book);
                      setIsFormModalOpen(true);
                    }
                  : undefined
              }
              onDelete={isStaff ? () => setBookToDelete(book) : undefined}
              onIssueDirectly={isStaff ? () => setBookToIssueDirectly(book) : undefined}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Book Info</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">ISBN</th>
                <th className="pb-3 font-semibold">Shelf</th>
                <th className="pb-3 font-semibold">Copies</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          onClick={() => setSelectedBookForDetails(book)}
                          className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate max-w-[200px]"
                        >
                          {book.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">By {book.author}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {book.category}
                    </span>
                  </td>

                  <td className="py-3 pr-3 font-mono text-slate-500 dark:text-slate-400">
                    {book.isbn}
                  </td>

                  <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                    {book.shelfNumber || 'Rack A-1'}
                  </td>

                  <td className="py-3 pr-3">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {book.availableCopies}
                    </span>
                    <span className="text-slate-400"> / {book.totalCopies}</span>
                  </td>

                  <td className="py-3 pr-3">
                    <Badge status={book.availableCopies > 0 ? 'available' : 'out_of_stock'} size="sm" />
                  </td>

                  <td className="py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBookForDetails(book)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isStaff && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBookForEdit(book);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Edit Book"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setBookToDelete(book)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
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
        totalItems={totalBooks}
        itemsPerPage={viewMode === 'grid' ? 12 : 15}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Add / Edit Book Modal */}
      {isFormModalOpen && (
        <BookFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedBookForEdit(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={selectedBookForEdit}
          loading={actionLoading}
        />
      )}

      {/* View Details Modal */}
      {selectedBookForDetails && (
        <BookDetailsModal
          isOpen={!!selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          book={selectedBookForDetails}
          onIssueDirectly={isStaff ? (b) => setBookToIssueDirectly(b) : undefined}
        />
      )}

      {/* Quick Issue Modal */}
      {bookToIssueDirectly && (
        <IssueBookModal
          isOpen={!!bookToIssueDirectly}
          onClose={() => setBookToIssueDirectly(null)}
          preselectedBook={bookToIssueDirectly}
          onSubmit={handleIssueSubmit}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {bookToDelete && (
        <ConfirmDialog
          isOpen={!!bookToDelete}
          onClose={() => setBookToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Book from Catalog"
          message={`Are you sure you want to delete "${bookToDelete.title}"? This cannot be undone.`}
          confirmText="Delete Book"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default BooksPage;
