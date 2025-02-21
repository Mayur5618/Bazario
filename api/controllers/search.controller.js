import Product from '../models/product.model.js';
import SearchHistory from '../models/Mobile_searchHistory.model.js';

// GET /api/search
export const searchProducts = async (req, res) => {
    try {
        const { query, category, sortBy } = req.query;
        
        // Build search filter
        const filter = {};
        
        // Text search if query exists
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        const products = await Product.find(filter)
            .sort(sort)
            .populate('seller', 'firstname lastname');

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};

// GET /api/search/suggestions
export const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        const suggestions = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        })
        .select('name category')
        .limit(5);

        const uniqueSuggestions = Array.from(new Set([
            ...suggestions.map(p => p.name),
            ...suggestions.map(p => p.category)
        ])).slice(0, 5);

        res.json({
            success: true,
            suggestions: uniqueSuggestions
        });

    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting search suggestions',
            error: error.message
        });
    }
};

// GET /api/search/trending
export const getTrendingSearches = async (req, res) => {
    try {
        const trendingProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category');

        const trending = Array.from(new Set([
            ...trendingProducts.map(p => p.name),
            ...trendingProducts.map(p => p.category)
        ])).slice(0, 5);

        res.json({
            success: true,
            trending
        });

    } catch (error) {
        console.error('Trending searches error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting trending searches'
        });
    }
};

// Save search query to history
export const saveSearchHistory = async (req, res) => {
    try {
        const { query } = req.body;
        const userId = req.user._id;
        
        console.log('Saving search history:', { userId, query });

        const savedSearch = await SearchHistory.findOneAndUpdate(
            { user: userId, query },
            { timestamp: new Date() },
            { upsert: true, new: true }
        );

        console.log('Saved search:', savedSearch);

        res.json({
            success: true,
            message: 'Search history saved'
        });
    } catch (error) {
        console.error('Save search history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving search history'
        });
    }
};

// Get user's recent searches
export const getRecentSearches = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Fetching recent searches for user:', userId);

        const recentSearches = await SearchHistory.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .select('query timestamp');

        console.log('Found recent searches:', recentSearches);

        res.json({
            success: true,
            searches: recentSearches
        });
    } catch (error) {
        console.error('Recent searches error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting recent searches'
        });
    }
};

// Delete a search history item
export const deleteSearchHistory = async (req, res) => {
    try {
        const { searchId } = req.params;
        const userId = req.user._id;

        await SearchHistory.findOneAndDelete({
            _id: searchId,
            user: userId
        });

        res.json({
            success: true,
            message: 'Search history deleted'
        });
    } catch (error) {
        console.error('Delete search history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting search history'
        });
    }
};

// Clear all search history
export const clearSearchHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        await SearchHistory.deleteMany({ user: userId });

        res.json({
            success: true,
            message: 'Search history cleared'
        });
    } catch (error) {
        console.error('Clear search history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing search history'
        });
    }
}; 