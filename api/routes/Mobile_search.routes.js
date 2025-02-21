import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getSearchSuggestions,
  saveSearchHistory,
  getRecentSearches,
  deleteSearchHistory,
  clearSearchHistory
} from '../controllers/search.controller.js';

const router = express.Router();

// Public route
router.get('/suggestions', getSearchSuggestions);

// Protected routes
router.use(protect);
router.post('/history', saveSearchHistory);
router.get('/recent', getRecentSearches);
router.delete('/history/:searchId', deleteSearchHistory);
router.delete('/history', clearSearchHistory);

export default router; 