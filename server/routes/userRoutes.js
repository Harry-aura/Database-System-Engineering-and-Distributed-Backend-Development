/**
 * User management routes (admin).
 * @module routes/userRoutes
 */
const express = require('express');
const {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, authorizeRoles('admin'), getUsers)
  .post(protect, authorizeRoles('admin'), registerUser);

router
  .route('/:id')
  .get(protect, authorizeRoles('admin'), getUserById)
  .put(protect, authorizeRoles('admin'), updateUser)
  .delete(protect, authorizeRoles('admin'), deleteUser);

module.exports = router;