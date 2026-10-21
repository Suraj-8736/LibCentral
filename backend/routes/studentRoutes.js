const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin', 'librarian'), getStudents);
router.post('/', protect, authorize('admin', 'librarian'), createStudent);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, authorize('admin', 'librarian'), updateStudent);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteStudent);
router.patch('/:id/status', protect, authorize('admin', 'librarian'), toggleStudentStatus);

module.exports = router;
