import Product from '../models/product.model.js';
import SearchHistory from '../models/Mobile_searchHistory.model.js';
import Order from '../models/order.model.js';

// GET /api/search
export const searchProducts = async (req, res) => {
    try {
        const { query, category, sortBy, city } = req.query;
        
        // Build search filter
        const filter = {};
        
        if (city) {
            filter.availableLocations = city;
        }
        
        // Text search if query exists
        if (query) {
            filter.$and = [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { category: { $regex: query, $options: 'i' } }
                    ]
                }
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
        const { query, city } = req.query;

        if (!query || query.length < 2 || !city) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        // Find products that match the search query AND are available in user's city
        const products = await Product.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { category: { $regex: query, $options: 'i' } }
                    ]
                },
                { availableLocations: city } // Check if product is available in user's city
            ]
        })
        .select('name')
        .limit(10);

        // Get unique suggestions from product names only
        const uniqueSuggestions = Array.from(new Set(
            products.map(p => p.name)
        )).slice(0, 5);

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

// GET /api/search/popular-by-city
export const getPopularProductsByCity = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City parameter is required'
            });
        }

        console.log('Searching for popular products in city:', city);

        // Aggregate pipeline to get popular products by city
        const popularProducts = await Order.aggregate([
            // Match orders from the specified city
            { 
                $match: { 
                    'shippingAddress.city': city
                } 
            },
            // Unwind the items array to get individual products
            { $unwind: '$items' },
            // Group by product ID and count orders
            {
                $group: {
                    _id: '$items.product',
                    totalOrders: { $sum: '$items.quantity' },
                    totalAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            // Sort by total orders in descending order
            { $sort: { totalOrders: -1 } },
            // Limit to top 10 products
            { $limit: 10 },
            // Lookup product details
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            // Unwind product details
            { $unwind: '$productDetails' },
            // Project final fields
            {
                $project: {
                    _id: '$productDetails._id',
                    name: '$productDetails.name',
                    price: '$productDetails.price',
                    images: '$productDetails.images',
                    category: '$productDetails.category',
                    totalOrders: 1,
                    totalAmount: 1,
                    rating: '$productDetails.rating',
                    numReviews: '$productDetails.numReviews'
                }
            }
        ]);

        console.log('Found popular products:', popularProducts);

        res.json({
            success: true,
            products: popularProducts
        });

    } catch (error) {
        console.error('Error getting popular products by city:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting popular products',
            error: error.message
        });
    }
}; 