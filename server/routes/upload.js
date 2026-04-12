const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFromBuffer } = require('../services/cloudinary');
const { authenticateToken } = require('../middleware/auth');

// Multer configuration: store file in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/**
 * @route POST /api/upload
 * @desc  Upload a single image to Cloudinary
 * @access Private
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadFromBuffer(req.file.buffer);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ message: 'Error uploading to Cloudinary', error: err.message });
  }
});

module.exports = router;
