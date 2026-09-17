/**
 * Authentication controller: login and profile retrieval.
 * @module controllers/authController
 */
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

/**
 * Authenticate a user and return a signed JWT token.
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      flatNumber: user.flatNumber,
      block: user.block,
      gate: user.gate,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * Return the currently authenticated user's profile.
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    flatNumber: req.user.flatNumber,
    block: req.user.block,
    gate: req.user.gate,
  });
});

module.exports = { loginUser, getMe };