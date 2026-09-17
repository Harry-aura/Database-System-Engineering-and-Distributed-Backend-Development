/**
 * Notice controller: publish and manage society notices.
 * @module controllers/noticeController
 */
const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');

/**
 * GET /api/notices
 * Returns the latest notices for everyone.
 * @access Private
 */
const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({})
    .populate('author', 'name')
    .sort({ createdAt: -1 });
  res.json(notices);
});

/**
 * GET /api/notices/:id
 * @access Private
 */
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('author', 'name');

  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }

  res.json(notice);
});

/**
 * POST /api/notices
 * Publish a new society notice (admin only).
 * @access Private/Admin
 */
const createNotice = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Notice title and content are required');
  }

  const notice = await Notice.create({
    author: req.user._id,
    title,
    content,
  });

  res.status(201).json(await notice.populate('author', 'name'));
});

/**
 * PUT /api/notices/:id
 * Edit an existing notice (admin only).
 * @access Private/Admin
 */
const updateNotice = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }

  notice.title = title || notice.title;
  notice.content = content || notice.content;

  const updatedNotice = await notice.save();
  res.json(updatedNotice);
});

/**
 * DELETE /api/notices/:id
 * Remove a notice (admin only).
 * @access Private/Admin
 */
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }

  await notice.deleteOne();
  res.json({ message: 'Notice removed' });
});

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};