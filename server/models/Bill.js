/**
 * Bill model.
 * Monthly maintenance / society dues assigned to a flat with soft-delete support.
 * @module models/Bill
 */
const mongoose = require('mongoose');

/**
 * Defines the bill schema.
 * @type {mongoose.Schema}
 */
const billSchema = mongoose.Schema(
  {
    /** Resident the bill is issued to (optional, filters by flatNumber too). */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    flatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'Maintenance',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    proofUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;