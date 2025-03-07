import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';
import { createError } from '../utils/createError.js';

export const wishlistController = {
  // Get user's wishlist
  getWishlist: async (req, res, next) => {
    try {
      let wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate('products', 'name price images stock'); // Populate product details

      if (!wishlist) {
        wishlist = await Wishlist.create({
          user: req.user._id,
          products: []
        });
      }

      res.status(200).json({ 
        success: true, 
        wishlist: wishlist.products 
      });
    } catch (err) {
      next(createError(500, "Error fetching wishlist"));
    }
  },

  // Add product to wishlist
  addToWishlist: async (req, res, next) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return next(createError(400, "Product ID is required"));
      }

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        return next(createError(404, "Product not found"));
      }

      // Find or create wishlist
      let wishlist = await Wishlist.findOne({ user: req.user._id });
      
      if (!wishlist) {
        wishlist = await Wishlist.create({
          user: req.user._id,
          products: [productId]
        });
      } else {
        // Check if product is already in wishlist
        if (!wishlist.products.includes(productId)) {
          wishlist.products.push(productId);
          await wishlist.save();
        }
      }

      // Populate product details before sending response
      wishlist = await Wishlist.findById(wishlist._id)
        .populate('products', 'name price images stock');

      res.status(200).json({ 
        success: true, 
        message: "Product added to wishlist",
        wishlist: wishlist.products 
      });
    } catch (err) {
      console.error('Add to wishlist error:', err);
      next(createError(500, "Error adding product to wishlist"));
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (req, res, next) => {
    try {
      const { productId } = req.params; // Changed from req.body to req.params
      
      if (!productId) {
        return next(createError(400, "Product ID is required"));
      }

      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return next(createError(404, "Wishlist not found"));
      }

      // Remove product from wishlist
      wishlist.products = wishlist.products.filter(
        id => id.toString() !== productId
      );
      await wishlist.save();

      // Populate product details before sending response
      wishlist = await Wishlist.findById(wishlist._id)
        .populate('products', 'name price images stock');

      res.status(200).json({ 
        success: true, 
        message: "Product removed from wishlist",
        wishlist: wishlist.products 
      });
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      next(createError(500, "Error removing product from wishlist"));
    }
  },

  // Clear wishlist
  clearWishlist: async (req, res, next) => {
    try {
      const wishlist = await Wishlist.findOne({ user: req.user._id });
      if (wishlist) {
        wishlist.products = [];
        await wishlist.save();
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Wishlist cleared",
        wishlist: [] 
      });
    } catch (err) {
      next(createError(500, "Error clearing wishlist"));
    }
  }
}; 