/**
 * Amenity booking routes.
 * @module routes/bookingRoutes
 */
const express = require('express');
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getBookings)
  .post(protect, authorizeRoles('admin', 'resident'), createBooking);

router
  .route('/:id')
  .put(protect, updateBooking)
  .delete(protect, authorizeRoles('admin', 'resident'), deleteBooking);

module.exports = router;