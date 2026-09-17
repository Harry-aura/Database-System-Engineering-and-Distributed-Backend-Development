/**
 * Bill routes with image proof upload support.
 * @module routes/billRoutes
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getBills,
  createBill,
  updateBill,
  deleteBill,
} = require('../controllers/billController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure storage for bill attachments/proofs
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `bill-proof-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for bill proof!'), false);
    }
  },
});

router
  .route('/')
  .get(protect, getBills)
  .post(protect, authorizeRoles('admin'), upload.single('proof'), createBill);

router
  .route('/:id')
  .put(protect, updateBill)
  .delete(protect, deleteBill); // Role check handled in billController.js

module.exports = router;