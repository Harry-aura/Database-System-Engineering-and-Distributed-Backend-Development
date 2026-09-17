/**
 * File upload middleware built on multer.
 * Stores visitor ID photos on disk under /uploads and serves them statically.
 * @module middleware/uploadMiddleware
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');

/** Absolute path to the uploads directory. */
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer disk storage config.
 * Generates a timestamped, unique filename to avoid collisions.
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `visitor-${uniqueSuffix}${ext}`);
  },
});

/**
 * Filters out non-image uploads (e.g. executables).
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'), false);
  }
};

/** Single image upload named `photo` in multipart/form-data. */
const uploadVisitorPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');

module.exports = { uploadVisitorPhoto, uploadDir };