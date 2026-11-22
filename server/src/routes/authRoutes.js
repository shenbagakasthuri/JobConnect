import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../middleware/validators.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);

// Authenticated current user endpoint
router.get('/me', verifyToken, getMe);

// Role-protected test routes for Phase 2 verification
router.get('/protected-seeker', verifyToken, requireRole('JOB_SEEKER'), (req, res) => {
  res.json({ success: true, message: 'Welcome Job Seeker', user: req.user });
});

router.get('/protected-employer', verifyToken, requireRole('EMPLOYER'), (req, res) => {
  res.json({ success: true, message: 'Welcome Employer', user: req.user });
});

router.get('/protected-admin', verifyToken, requireRole('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin', user: req.user });
});

export default router;
