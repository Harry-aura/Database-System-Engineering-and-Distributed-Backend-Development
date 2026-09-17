/**
 * Visitor model.
 * Tracks society gate visitors through the approval and check-in workflow.
 * @module models/Visitor
 */
const mongoose = require('mongoose');

/**
 * Lifecycle statuses for a visitor entry.
 * @type {readonly string[]}
 */
const VISITOR_STATUS = ['pending', 'approved', 'rejected', 'checked-in', 'checked-out'];

/**
 * Defines the visitor schema.
 * @type {mongoose.Schema}
 */
const visitorSchema = mongoose.Schema(
  {
    /** Security guard (or admin) who logged the entry. */
    guardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    /** Flat the visitor intends to visit. */
    flatNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    /** Uploaded photo URL served from /uploads. */
    photoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: VISITOR_STATUS,
      default: 'pending',
    },
    checkedInAt: {
      type: Date,
    },
    checkedOutAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
module.exports.VISITOR_STATUS = VISITOR_STATUS;