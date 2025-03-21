// const express = require('express');
import express from 'express';
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
import { protect } from '../middleware/authMiddleware.js';

// const {
//     addToRecentlyViewed,
//     getRecentlyViewed,
//     clearRecentlyViewed
// } = require('../controllers/recentlyViewedController');
import {
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed
} from '../controllers/recentlyViewedController.js';

// All routes are protected
router.use(protect);

router.post('/add', addToRecentlyViewed);
router.get('/get', getRecentlyViewed);
router.delete('/clear', clearRecentlyViewed);

export default router;