import express from "express";
import {
  protect,
  seller,
  sellerOrAgency,
} from "../middleware/authMiddleware.js";
import { checkPlatformAccess } from "../middleware/platformAccess.middleware.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  getBulkProducts,
} from "../controllers/product.controller.js";
import { createReview } from "../controllers/review.controller.js";
import Product from "../models/product.model.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected routes with platform access check
router.post(
  "/create",
  protect,
  sellerOrAgency, // Allow both sellers and agencies
  checkPlatformAccess((req) => req.body.platformType), // Check based on request body
  createProduct
);

router.put(
  "/:id",
  protect,
  sellerOrAgency,
  checkPlatformAccess((req) => req.body.platformType),
  updateProduct
);

router.delete("/:id", protect, sellerOrAgency, deleteProduct);

// Platform specific routes (optional)
router.get("/b2b/products", protect, checkPlatformAccess("b2b"), getProducts);

router.get("/b2c/products", protect, checkPlatformAccess("b2c"), getProducts);

router.post('/:productId/reviews', protect, createReview);

router.post('/bulk', getBulkProducts);

router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ 
      category: { $regex: new RegExp(category, 'i') } // Case-insensitive search
    }).populate('seller', 'name email');

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

export default router;
