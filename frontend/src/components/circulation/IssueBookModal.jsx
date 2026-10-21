import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Search, User, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { getStudents } from '../../services/studentService';
import { getBooks } from '../../services/bookService';
import { formatDate } from '../../utils/formatters';

const IssueBookModal = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedBook = null,
  preselectedStudent = null,
  loading = false,
}) => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(preselectedStudent);
  const [selectedBook, setSelectedBook] = useState(preselectedBook);

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 14);

  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(defaultDue.toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedBook(preselectedBook);
      setSelectedStudent(preselectedStudent);
      setError('');
      loadStudents();
      loadBooks();
    }
  }, [isOpen, preselectedBook, preselectedStudent]);

  const loadStudents = async (query = '') => {
    try {
      const data = await getStudents({ search: query, limit: 8, status: 'active' });
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBooks = async (query = '') => {
    try {
      const data = await getBooks({ search: query, limit: 8, status: 'available' });
      if (data.success) {
        setBooks(data.books || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }
    if (!selectedBook) {
      setError('Please select a book with available copies');
      return;
    }
    if (selectedBook.availableCopies <= 0) {
      setError('Selected book has 0 available copies');
      return;
    }

    onSubmit({
      userId: selectedStudent._id,
      bookId: selectedBook._id,
      issueDate,
      dueDate,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Circulation Desk: Issue Book"
      subtitle="Select a verified student and catalog volume to record issuance"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              1. Select Student *
            </label>

            {selectedStudent ? (
              <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedStudent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`}
                    alt={selectedStudent.name}
                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-brand-400"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedStudent.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedStudent.studentId} • {selectedStudent.branch?.split(' ')[0]}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs font-semibold text-rose-500 hover:underline shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      loadStudents(e.target.value);
                    }}
                    placeholder="Search by name, student ID, email..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  {students.length === 0 ? (
                    <p className="p-3 text-center text-xs text-slate-400">No active students found</p>
                  ) : (
                    students.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => {
                          setSelectedStudent(s);
                          setError('');
                        }}
                        className="p-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {s.studentId} • {s.course}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">Select</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Book Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              2. Select Book *
            </label>

            {selectedBook ? (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-12 rounded-lg overflow-hidden bg-white dark:bg-slate-900 p-0.5 border border-emerald-300 dark:border-emerald-700 shadow-xs shrink-0 flex items-center justify-center">
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedBook.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedBook.availableCopies} available • {selectedBook.shelfNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="text-xs font-semibold text-rose-500 hover:underline shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      loadBooks(e.target.value);
                    }}
                    placeholder="Search by title, ISBN, author..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  {books.length === 0 ? (
                    <p className="p-3 text-center text-xs text-slate-400">No available books found</p>
                  ) : (
                    books.map((b) => (
                      <div
                        key={b._id}
                        onClick={() => {
                          setSelectedBook(b);
                          setError('');
                        }}
                        className="p-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {b.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {b.author} • {b.availableCopies} left
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Select</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date (Standard 14 Days)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Circulation Notes / Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Coursework project, lab reference, special reservation"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>Confirm & Issue Book</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueBookModal;
