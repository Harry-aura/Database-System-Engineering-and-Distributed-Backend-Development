/**
 * Notice model.
 * Society notices / circulars published by the admin to all residents.
 * @module models/Notice
 */
const mongoose = require('mongoose');

/**
 * Defines the notice schema.
 * @type {mongoose.Schema}
 */
const noticeSchema = mongoose.Schema(
  {
    /** Admin user who published the notice. */
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;