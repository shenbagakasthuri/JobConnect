import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Secure private directory for resumes (outside of client public/static reach)
const uploadDirectory = path.resolve('uploads/resumes');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Storage engine with cryptographic filename generation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

// File filter: strict extension & mime-type validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
    const err = new Error('Invalid file type. Only PDF, DOC, and DOCX documents are accepted.');
    err.statusCode = 400;
    return cb(err, false);
  }

  cb(null, true);
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max limit
  },
});

export const UPLOAD_DIR = uploadDirectory;
