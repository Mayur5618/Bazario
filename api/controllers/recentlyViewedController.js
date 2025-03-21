import RecentlyViewed from '../models/RecentlyViewed.js';
import Product from '../models/product.model.js';

// Get best rated product for a category
export const getBestRatedProduct = async (category) => {
    try {
        // Find products in the category, sort by rating (highest first)
        const products = await Product.find({ category })
            .sort({ rating: -1 })
            .limit(1)
            .populate('seller', 'shopName rating');

        // If no products found or no product with rating, get the first product
        if (!products.length) {
            const firstProduct = await Product.findOne({ category })
                .populate('seller', 'shopName rating');
            return firstProduct;
        }

        return products[0];
    } catch (error) {
        console.error('Error getting best rated product:', error);
        return null;
    }
};

// Add product to recently viewed
export const addToRecentlyViewed = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        let recentlyViewed = await RecentlyViewed.findOne({ user: userId });

        if (!recentlyViewed) {
            recentlyViewed = new RecentlyViewed({
                user: userId,
                products: []
            });
        }

        // Remove if product already exists
        recentlyViewed.products = recentlyViewed.products.filter(
            item => item.product.toString() !== productId
        );

        // Add to beginning of array
        recentlyViewed.products.unshift({
            product: productId,
            viewedAt: new Date()
        });

        await recentlyViewed.save();

        res.status(200).json({
            success: true,
            message: 'Product added to recently viewed'
        });
    } catch (error) {
        console.error('Error in addToRecentlyViewed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to recently viewed'
        });
    }
};

// Get recently viewed products
export const getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user._id;

        const recentlyViewed = await RecentlyViewed.findOne({ user: userId })
            .populate({
                path: 'products.product',
                select: 'name images price unitType rating reviews stock category',
                populate: {
                    path: 'seller',
                    select: 'shopName rating'
                }
            });

        if (!recentlyViewed) {
            return res.status(200).json({
                success: true,
                products: []
            });
        }

        // Filter out any products that might have been deleted
        const validProducts = recentlyViewed.products.filter(item => item.product != null);

        res.status(200).json({
            success: true,
            products: validProducts
        });
    } catch (error) {
        console.error('Error in getRecentlyViewed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recently viewed products'
        });
    }
};

// Clear recently viewed products
export const clearRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user._id;

        await RecentlyViewed.findOneAndUpdate(
            { user: userId },
            { $set: { products: [] } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Recently viewed products cleared'
        });
    } catch (error) {
        console.error('Error in clearRecentlyViewed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear recently viewed products'
        });
    }
};