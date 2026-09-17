/**
 * Visitor routes.
 * @module routes/visitorRoutes
 */
const express = require('express');
const {
  getVisitors,
  getPendingVisitors,
  createVisitor,
  updateVisitorStatus,
  checkInVisitor,
  checkOutVisitor,
  deleteVisitor,
} = require('../controllers/visitorController');
const {
  protect,
  authorizeRoles,
  protectAdminSecurity,
} = require('../middleware/authMiddleware');
const { uploadVisitorPhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Residents fetch their pending approvals; admin/security fetch the full log.
router
  .route('/pending')
  .get(protect, authorizeRoles('resident'), getPendingVisitors);

router
  .route('/')
  .get(protect, getVisitors)
  .post(
    protect,
    authorizeRoles('admin', 'security'),
    uploadVisitorPhoto,
    createVisitor
  );

router
  .route('/:id/status')
  .patch(protect, authorizeRoles('resident'), updateVisitorStatus);

router
  .route('/:id/checkin')
  .patch(protect, protectAdminSecurity, checkInVisitor);

router
  .route('/:id/checkout')
  .patch(protect, protectAdminSecurity, checkOutVisitor);

router
  .route('/:id')
  .delete(protect, authorizeRoles('admin'), deleteVisitor);

module.exports = router;