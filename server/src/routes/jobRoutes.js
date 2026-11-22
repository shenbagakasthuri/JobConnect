import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  getMyJobs,
  deleteJob,
} from '../controllers/jobController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getJobs);

// Employer-only routes (must precede /:id to avoid matching 'employer' as an ID)
router.get('/employer/my-jobs', verifyToken, requireRole('EMPLOYER'), getMyJobs);
router.post('/', verifyToken, requireRole('EMPLOYER'), createJob);
router.delete('/:id', verifyToken, requireRole('EMPLOYER'), deleteJob);

// Public single job details route
router.get('/:id', getJobById);

export default router;
