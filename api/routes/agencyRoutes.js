import express from 'express';
import { signin, agencySignup } from '../controllers/agencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', signin);
router.post('/signup', agencySignup);

// Protected routes that need authentication
router.use(protect);
// Add protected routes here if needed

export default router;