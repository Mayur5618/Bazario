import Product from '../models/product.model.js';

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