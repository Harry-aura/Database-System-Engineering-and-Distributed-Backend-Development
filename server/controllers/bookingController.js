/**
 * Amenity booking controller.
 * @module controllers/bookingController
 */
const asyncHandler = require('express-async-handler');
const AmenityBooking = require('../models/AmenityBooking');
const { Roles } = require('../utils/roles');

/**
 * GET /api/bookings
 * Admin/security: all bookings. Resident: their own bookings.
 * @access Private
 */
const getBookings = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === Roles.RESIDENT) {
    filter.resident = req.user._id;
  }

  const bookings = await AmenityBooking.find(filter)
    .populate('resident', 'name flatNumber block')
    .sort({ createdAt: -1 });

  res.json(bookings);
});

/**
 * POST /api/bookings
 * Create a new amenity booking (resident).
 * @access Private/Resident
 */
const createBooking = asyncHandler(async (req, res) => {
  const { amenity, date, time } = req.body;

  if (!amenity || !date || !time) {
    res.status(400);
    throw new Error('amenity, date, and time are required');
  }

  const booking = await AmenityBooking.create({
    resident: req.user._id,
    amenity,
    date,
    time,
    status: 'Confirmed',
  });

  res.status(201).json(booking);
});

/**
 * PUT /api/bookings/:id
 * Cancel or confirm a booking.
 * @access Private
 */
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await AmenityBooking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (req.user.role === Roles.RESIDENT && booking.resident.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only manage your own bookings');
  }

  booking.status = req.body.status || booking.status;
  const updated = await booking.save();
  res.json(updated);
});

/**
 * DELETE /api/bookings/:id
 * Remove a booking.
 * @access Private/Admin
 */
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await AmenityBooking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await booking.deleteOne();
  res.json({ message: 'Booking removed' });
});

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
};