import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);
router.get('/stats', authenticateToken, AuthController.getUserStats);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, AuthController.getAllUsers);
router.put('/users/quota', authenticateToken, requireAdmin, AuthController.updateUserQuota);
router.put('/users/:userId/deactivate', authenticateToken, requireAdmin, AuthController.deactivateUser);
router.put('/users/:userId/activate', authenticateToken, requireAdmin, AuthController.activateUser);

export default router;
