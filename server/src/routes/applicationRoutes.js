import { Router } from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResume,
} from '../controllers/applicationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = Router();

// Job Seeker endpoints
router.post(
  '/:jobId',
  verifyToken,
  requireRole('JOB_SEEKER'),
  uploadResume.single('resume'),
  applyForJob
);

router.get(
  '/my-applications',
  verifyToken,
  requireRole('JOB_SEEKER'),
  getMyApplications
);

// Employer endpoints
router.get(
  '/employer/job/:jobId',
  verifyToken,
  requireRole('EMPLOYER'),
  getJobApplicants
);

router.patch(
  '/:applicationId/status',
  verifyToken,
  requireRole('EMPLOYER'),
  updateApplicationStatus
);

// Secure Resume Download (Seeker who applied OR Employer of the job OR Admin)
router.get(
  '/:applicationId/resume',
  verifyToken,
  downloadResume
);

export default router;
