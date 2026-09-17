/**
 * Signed JWT token helper.
 * @module utils/generateToken
 */
const jwt = require('jsonwebtoken');

/**
 * Creates a short-lived JWT for a user.
 * @param {string|ObjectId} id - Mongo document id to embed in the token.
 * @returns {string} Signed JWT.
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = generateToken;