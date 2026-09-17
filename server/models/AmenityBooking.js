/**
 * AmenityBooking model.
 * Represents a resident's booking of a society amenity (clubhouse, pool, etc.).
 * @module models/AmenityBooking
 */
const mongoose = require('mongoose');

/**
 * Defines the amenity booking schema.
 * @type {mongoose.Schema}
 */
const amenityBookingSchema = mongoose.Schema(
  {
    /** Resident who made the booking. */
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amenity: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  {
    timestamps: true,
  }
);

const AmenityBooking = mongoose.model('AmenityBooking', amenityBookingSchema);

module.exports = AmenityBooking;