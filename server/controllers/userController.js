/**
 * User management controller (admin only).
 * @module controllers/userController
 */
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Register a new user (resident, security, or admin).
 * @route POST /api/users
 * @access Private/Admin
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, flatNumber, block, gate } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'resident',
    flatNumber: role === 'resident' ? flatNumber : undefined,
    block: role === 'resident' ? block : undefined,
    gate: role === 'security' ? gate : undefined,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    flatNumber: user.flatNumber,
    block: user.block,
    gate: user.gate,
  });
});

/**
 * List all users (without passwords).
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

/**
 * Get a single user by ID.
 * @route GET /api/users/:id
 * @access Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

/**
 * Update a user's profile fields.
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.flatNumber = req.body.role === 'resident' ? req.body.flatNumber : undefined;
  user.block = req.body.role === 'resident' ? req.body.block : undefined;
  user.gate = req.body.role === 'security' ? req.body.gate : undefined;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    flatNumber: updatedUser.flatNumber,
    block: updatedUser.block,
    gate: updatedUser.gate,
  });
});

/**
 * Delete a user.
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ message: 'User removed' });
});

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};