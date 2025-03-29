import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getSearchSuggestions,
  saveSearchHistory,
  getRecentSearches,
  deleteSearchHistory,
  clearSearchHistory,
  getPopularProductsByCity
} from '../controllers/search.controller.js';

const router = express.Router();

// Public routes
router.get('/suggestions', getSearchSuggestions);
router.get('/popular-by-city', getPopularProductsByCity);

// Protected routes
router.use(protect);
router.post('/history', saveSearchHistory);
router.get('/recent', getRecentSearches);
router.delete('/history/:searchId', deleteSearchHistory);
router.delete('/history', clearSearchHistory);

export default router; 