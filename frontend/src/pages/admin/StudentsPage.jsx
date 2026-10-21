import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  BookOpen,
  Receipt,
  History,
  X,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
} from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { COURSES, BRANCHES, YEARS } from '../../utils/constants';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  const fetchStudentsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStudents({
        search: searchQuery,
        course: selectedCourse,
        branch: selectedBranch,
        status: selectedStatus,
        page: currentPage,
        limit: 12,
      });
      if (res.success) {
        setStudents(res.students || []);
        setTotalPages(res.totalPages || 1);
        setTotalStudents(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students directory');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCourse, selectedBranch, selectedStatus, currentPage, toast]);

  useEffect(() => {
    fetchStudentsList();
  }, [fetchStudentsList]);

  const handleOpenDetails = async (studentId) => {
    try {
      setActionLoading(true);
      const data = await getStudentById(studentId);
      if (data.success) {
        setStudentDetails(data);
      }
    } catch (err) {
      toast.error('Failed to load student profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedStudentForEdit) {
        const res = await updateStudent(selectedStudentForEdit._id, formData);
        if (res.success) {
          toast.success('Student profile updated successfully');
          setIsFormModalOpen(false);
          setSelectedStudentForEdit(null);
          fetchStudentsList();
        }
      } else {
        const res = await createStudent(formData);
        if (res.success) {
          toast.success('Student registered successfully');
          setIsFormModalOpen(false);
          fetchStudentsList();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleStudentStatus(id);
      if (res.success) {
        toast.success(res.message);
        fetchStudentsList();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setActionLoading(true);
      const res = await deleteStudent(studentToDelete._id);
      if (res.success) {
        toast.success('Student deleted successfully');
        setStudentToDelete(null);
        fetchStudentsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
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
            Student & Member Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage university scholars, course programs, active loans, and account permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedStudentForEdit(null);
            setIsFormModalOpen(true);
          }}
          className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by student name, roll number, or email..."
            />
          </div>

          {/* Course */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Degree Courses</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Account Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Members</option>
              <option value="suspended">Suspended Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving student registry records..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="No students match the current filters or search terms."
          actionText="Register New Student"
          onAction={() => setIsFormModalOpen(true)}
        />
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 font-semibold">Student Info</th>
                <th className="pb-3 font-semibold">Student ID</th>
                <th className="pb-3 font-semibold">Program & Branch</th>
                <th className="pb-3 font-semibold">Active Loans</th>
                <th className="pb-3 font-semibold">Fines</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Info */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                        alt={student.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p
                          onClick={() => handleOpenDetails(student._id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate"
                        >
                          {student.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="py-3.5 pr-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {student.studentId || '—'}
                  </td>

                  {/* Course & Branch */}
                  <td className="py-3.5 pr-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.course} • {student.year}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {student.branch}
                    </p>
                  </td>

                  {/* Active Loans */}
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      student.activeLoans > 0
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <BookOpen className="w-3 h-3" />
                      <span>{student.activeLoans} Active</span>
                    </span>
                  </td>

                  {/* Fines */}
                  <td className="py-3.5 pr-3">
                    {student.unpaidFine > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <Receipt className="w-3 h-3" />
                        <span>₹{student.unpaidFine} Due</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">None</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pr-3">
                    <button
                      onClick={() => handleToggleStatus(student._id)}
                      className="group cursor-pointer"
                      title="Click to toggle status"
                    >
                      <Badge status={student.status} size="sm">
                        {student.status}
                      </Badge>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetails(student._id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="View Borrowing History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStudentForEdit(student);
                          setIsFormModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Edit Student"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
        totalItems={totalStudents}
        itemsPerPage={12}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Add / Edit Student Modal */}
      {isFormModalOpen && (
        <StudentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedStudentForEdit(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={selectedStudentForEdit}
          loading={actionLoading}
        />
      )}

      {/* Student Profile & Borrowing History Modal */}
      {studentDetails && (
        <StudentHistoryModal
          isOpen={!!studentDetails}
          onClose={() => setStudentDetails(null)}
          data={studentDetails}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {studentToDelete && (
        <ConfirmDialog
          isOpen={!!studentToDelete}
          onClose={() => setStudentToDelete(null)}
          onConfirm={handleDeleteStudent}
          title="Delete Student Record"
          message={`Are you sure you want to remove student "${studentToDelete.name}" (${studentToDelete.studentId}) from the directory?`}
          confirmText="Delete Student"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

// Internal Form Modal
const StudentFormModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const isEdit = !!initialData?._id;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '1st Year',
    phone: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        studentId: initialData.studentId || '',
        course: initialData.course || 'B.Tech',
        branch: initialData.branch || 'Computer Science & Engineering',
        year: initialData.year || '1st Year',
        phone: initialData.phone || '',
        status: initialData.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: 'student123',
        studentId: '',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        year: '1st Year',
        phone: '',
        status: 'active',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student Profile' : 'Register New Student'}
      subtitle={isEdit ? `Editing: ${formData.name}` : 'Create a library borrower account for student'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter student full name"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student ID / Roll No
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="Enter student ID / roll no"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course
            </label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Branch / Department
            </label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Year
            </label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter mobile number"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
          >
            {isEdit ? 'Save Changes' : 'Register Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Internal Student Profile & History Modal
const StudentHistoryModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  const { student, activeTransactions, history, fines, totalFines, pendingFines } = data;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Borrowing Profile"
      subtitle={`${student.name} (${student.studentId})`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/30"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{student.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student.course} ({student.year}) • {student.branch}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {student.email} • {student.phone || 'No phone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-center self-stretch sm:self-auto">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-1 sm:flex-initial min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Active Loans</p>
              <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-heading">
                {activeTransactions?.length || 0}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-1 sm:flex-initial min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Pending Fines</p>
              <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-heading">
                ₹{pendingFines || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Active Issued Books */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Currently Issued Volumes ({activeTransactions?.length || 0})
          </h4>
          {activeTransactions?.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              No active books currently borrowed.
            </p>
          ) : (
            <div className="space-y-2">
              {activeTransactions.map((t) => (
                <div
                  key={t._id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.bookId?.coverImage}
                      alt={t.bookId?.title}
                      className="w-8 h-10 rounded object-cover shadow-xs"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.bookId?.title}</p>
                      <p className="text-[11px] text-slate-400">Due: {formatDate(t.dueDate)}</p>
                    </div>
                  </div>
                  <Badge status={t.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History Log */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Complete Borrowing History ({history?.length || 0})
          </h4>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
            {history?.map((t) => (
              <div key={t._id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{t.bookId?.title}</p>
                  <p className="text-[10px] text-slate-400">
                    Issued: {formatDate(t.issueDate)} | Returned: {t.returnDate ? formatDate(t.returnDate) : 'Not Returned'}
                  </p>
                </div>
                <Badge status={t.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default StudentsPage;
