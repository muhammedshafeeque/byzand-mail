import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_CONFIG } from '../configs/index.js';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_CONFIG.PATH)) {
  fs.mkdirSync(UPLOAD_CONFIG.PATH, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_CONFIG.PATH);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_SIZE,
    files: UPLOAD_CONFIG.MAX_FILES
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.mimetype as any)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`));
    }

    // Check file size
    if (file.size > UPLOAD_CONFIG.MAX_SIZE) {
      return cb(new Error('File too large'));
    }

    cb(null, true);
  }
});

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field'
      });
    }
  }

  if (error.message === 'File type not allowed') {
    return res.status(400).json({
      success: false,
      error: 'File type not allowed'
    });
  }

  if (error.message === 'File too large') {
    return res.status(400).json({
      success: false,
      error: 'File too large'
    });
  }

  next(error);
};
