import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    sendRequest, 
    acceptRequest, 
    rejectRequest, 
    getRequests 
} from '../controllers/request.controller.js';

const router = express.Router();

// Middleware to check if user is authenticated
router.use(protect);

// Routes
router.post('/send', protect, sendRequest);      // Send new request
router.get('/', protect, getRequests);           // Get all requests (filtered by user type)
router.patch('/accept/:id', protect, acceptRequest);  // Accept a request
router.patch('/reject/:id', protect, rejectRequest);  // Reject a request

export default router; 