/**
 * Visitor controller: gate logging, resident approval, and check-in/out.
 * @module controllers/visitorController
 */
const asyncHandler = require('express-async-handler');
const Visitor = require('../models/Visitor');
const { Roles } = require('../utils/roles');

/**
 * Public relative URL for a stored photo file.
 * @param {string} filename - Stored filename under /uploads.
 * @returns {string} URL path (/uploads/<filename>).
 */
const photoUrl = (filename) =>
  filename ? `/uploads/${filename}` : '';

/**
 * GET /api/visitors
 * Security/admin: full persistent log. Resident: visitors for their own flat.
 * @access Private
 */
const getVisitors = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.flatNumber) {
    filter.flatNumber = req.query.flatNumber;
  } else if (req.user.role === Roles.RESIDENT) {
    filter.flatNumber = req.user.flatNumber;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const visitors = await Visitor.find(filter)
    .populate('guardId', 'name')
    .sort({ createdAt: -1 });

  res.json(visitors);
});

/**
 * GET /api/visitors/pending?flatNumber=X
 * Returns pending visitor approvals for the resident's flat.
 * @access Private/Resident
 */
const getPendingVisitors = asyncHandler(async (req, res) => {
  const flatNumber = req.query.flatNumber || req.user.flatNumber;

  if (!flatNumber) {
    res.status(400);
    throw new Error('flatNumber query parameter is required');
  }

  const visitors = await Visitor.find({
    flatNumber,
    status: 'pending',
  })
    .populate('guardId', 'name gate')
    .sort({ createdAt: -1 });

  res.json(visitors);
});

/**
 * POST /api/visitors
 * Security uploads a visitor photo + details; record is created as 'pending'.
 * Expects multipart/form-data with `photo` and text fields.
 * @access Private/Admin+Security
 */
const createVisitor = asyncHandler(async (req, res) => {
  const { name, phone, flatNumber, purpose } = req.body;

  if (!name || !phone || !flatNumber || !purpose) {
    res.status(400);
    throw new Error('name, phone, flatNumber, and purpose are required');
  }

  const visitor = await Visitor.create({
    guardId: req.user._id,
    name,
    phone,
    flatNumber,
    purpose,
    photoUrl: photoUrl(req.file ? req.file.filename : null),
    status: 'pending',
  });

  res.status(201).json(visitor);
});

/**
 * PATCH /api/visitors/:id/status
 * Resident approves or rejects a pending visitor request for their flat.
 * @access Private/Resident
 */
const updateVisitorStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error("status must be one of: 'approved', 'rejected'");
  }

  const visitor = await Visitor.findById(req.params.id);

  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }

  if (req.user.role === Roles.RESIDENT && visitor.flatNumber !== req.user.flatNumber) {
    res.status(403);
    throw new Error('You can only review visitors for your own flat');
  }

  if (visitor.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending visitor requests can be approved or rejected');
  }

  visitor.status = status;
  await visitor.save();

  res.json(visitor);
});

/**
 * PATCH /api/visitors/:id/checkin
 * Security allows entry only after the resident has approved the request.
 * @access Private/Admin+Security
 */
const checkInVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);

  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }

  if (visitor.status !== 'approved') {
    res.status(400);
    throw new Error(
      'Visitor must be approved by the resident before check-in is allowed'
    );
  }

  visitor.status = 'checked-in';
  visitor.checkedInAt = new Date();
  await visitor.save();

  res.json(visitor);
});

/**
 * PATCH /api/visitors/:id/checkout
 * Security marks the visitor as having left the premises.
 * @access Private/Admin+Security
 */
const checkOutVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);

  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }

  if (visitor.status !== 'checked-in') {
    res.status(400);
    throw new Error('Visitor must be checked-in before check-out');
  }

  visitor.status = 'checked-out';
  visitor.checkedOutAt = new Date();
  await visitor.save();

  res.json(visitor);
});

/**
 * DELETE /api/visitors/:id
 * Remove a visitor log entry.
 * @access Private/Admin
 */
const deleteVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);

  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }

  await visitor.deleteOne();
  res.json({ message: 'Visitor entry removed' });
});

module.exports = {
  getVisitors,
  getPendingVisitors,
  createVisitor,
  updateVisitorStatus,
  checkInVisitor,
  checkOutVisitor,
  deleteVisitor,
};