/**
 * User model.
 * Represents admin, resident, or security staff accounts.
 * @module models/User
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Defines the user schema.
 * @type {mongoose.Schema}
 */
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'resident', 'security'],
      default: 'resident',
    },
    /** Flat number for residents (e.g. "402"). */
    flatNumber: {
      type: String,
      trim: true,
    },
    /** Block / wing for residents (e.g. "B"). */
    block: {
      type: String,
      trim: true,
    },
    /** Assigned gate for security staff. */
    gate: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compares a plain-text password against the stored bcrypt hash.
 * @param {string} enteredPassword - The password to verify.
 * @returns {Promise<boolean>} True when the passwords match.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Hashes the password before saving when it has been modified.
 * This hook uses nested function scope so `this` refers to the document.
 * @returns {Promise<void>}
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;