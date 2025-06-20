import express from 'express';
import { 
    searchProducts, 
    getSearchSuggestions, 
    getTrendingSearches 
} from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/trending', getTrendingSearches);

export default router; 