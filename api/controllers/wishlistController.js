import Wishlist from '../models/Wishlist.js';
import Product from '../models/product.model.js';
import { createError } from '../utils/createError.js';

export const wishlistController = {
  // Get user's wishlist
  getWishlist: async (req, res, next) => {
    try {
      const wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return res.status(200).json({ success: true, wishlist: [] });
      }
      res.status(200).json({ success: true, wishlist: wishlist.products });
    } catch (err) {
      next(createError(500, err.message || "Error fetching wishlist"));
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

      // Add to wishlist
      const wishlist = await Wishlist.createOrUpdateWishlist(req.user._id, productId);
      
      res.status(200).json({ 
        success: true, 
        message: "Product added to wishlist",
        wishlist: wishlist.products 
      });
    } catch (err) {
      next(createError(500, err.message || "Error adding to wishlist"));
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (req, res, next) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return next(createError(400, "Product ID is required"));
      }

      const wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return next(createError(404, "Wishlist not found"));
      }

      wishlist.products = wishlist.products.filter(
        id => id.toString() !== productId
      );
      await wishlist.save();

      res.status(200).json({ 
        success: true, 
        message: "Product removed from wishlist",
        wishlist: wishlist.products 
      });
    } catch (err) {
      next(createError(500, err.message || "Error removing from wishlist"));
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
      next(createError(500, err.message || "Error clearing wishlist"));
    }
  }
}; 