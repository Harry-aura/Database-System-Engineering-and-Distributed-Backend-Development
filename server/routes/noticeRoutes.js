/**
 * Notice routes.
 * @module routes/noticeRoutes
 */
const express = require('express');
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getNotices)
  .post(protect, authorizeRoles('admin'), createNotice);

router
  .route('/:id')
  .get(protect, getNoticeById)
  .put(protect, authorizeRoles('admin'), updateNotice)
  .delete(protect, authorizeRoles('admin'), deleteNotice);

module.exports = router;