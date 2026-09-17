/**
 * Authentication & role authorization middleware.
 * @module middleware/authMiddleware
 */
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { adminOrSecurity, Roles } = require('../utils/roles');

/**
 * Guards private routes by verifying the Bearer token in the Authorization header.
 * Attaches the authenticated user (without password) to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

/**
 * Restricts a route to the given roles.
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'security').
 * @returns {import('express').RequestHandler}
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

/**
 * Restricts a route to admin or security staff.
 * @type {import('express').RequestHandler}
 */
const protectAdminSecurity = authorizeRoles(...adminOrSecurity);

module.exports = { protect, authorizeRoles, protectAdminSecurity, Roles };