import express from "express";
import {
  verifyToken,
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
  getFilteredProducts,
  getCategories,
  uploadProductImages,
  getProductsByCategoryAndSubcategory,
  getProductsByCategory,
  getProductsBySubcategory,
  createB2BProduct,
  getSellerB2BProducts,
  getB2BCategories,
  getB2BProductsByCategory,
  getB2BProductById,
  getProductsByFormattedCategory,
  getBuyerCity,
  getMostOrderedProductsByCategory,
  getMostOrderedProductByCategory,
  getLimitedProductsByCategory,
  getSellerB2BProductsByStatus
} from "../controllers/product.controller.js";
import { 
  createReview, 
  getProductReviews,
  updateReview,
  deleteReview,
  toggleLike,
  checkUserReview
} from "../controllers/review.controller.js";
import Product from "../models/product.model.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/filtered", getFilteredProducts);
router.get("/categories", getCategories);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProduct);

// Review routes
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', verifyToken, createReview);
router.put('/:productId/reviews/:reviewId', verifyToken, updateReview);
router.delete('/:productId/reviews/:reviewId', verifyToken, deleteReview);
router.post('/:productId/reviews/:reviewId/like', verifyToken, toggleLike);
router.get('/:productId/user-review', verifyToken, checkUserReview);

// Protected routes with platform access check
router.post(
  "/create",
  verifyToken,
  sellerOrAgency,
  createProduct
);

router.put(
  "/:id",
  verifyToken,
  sellerOrAgency,
  updateProduct
);

router.delete("/:id", verifyToken, sellerOrAgency, deleteProduct);

// Platform specific routes
router.get("/b2b/products", verifyToken, checkPlatformAccess("b2b"), getProducts);
router.get("/b2c/products", verifyToken, checkPlatformAccess("b2c"), getProducts);

router.post('/bulk', getBulkProducts);

// Categories routes
router.get('/categories', async (req, res) => {
  try {
    // Always filter for b2c platform type
    const query = { platformType: { $in: ['b2c'] } };
    const categories = await Product.distinct('category', query);
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

// B2B Product Routes
router.post(
  "/b2b/products/create",
  verifyToken,
  sellerOrAgency,
  checkPlatformAccess("b2b"),
  createB2BProduct
);

// Get B2B product by ID
router.get('/b2b/products/:id', getB2BProductById);

// Get seller's B2B products
router.get(
  "/seller/b2b-products",
  verifyToken,
  sellerOrAgency,
  checkPlatformAccess("b2b"),
  getSellerB2BProducts
);

// Get seller's B2B products by status
router.get(
  "/seller/b2b-products/status",
  verifyToken,
  sellerOrAgency,
  checkPlatformAccess("b2b"),
  getSellerB2BProductsByStatus
);

// Get B2B categories
router.get('/b2b/categories', getB2BCategories);

// Get B2B products by category
router.get('/b2b/category/:category', getB2BProductsByCategory);

router.post(
  "/upload",  
  verifyToken,
  uploadProductImages
);

// Get products by category with subcategories
router.get('/category/:category', getProductsByCategoryAndSubcategory);

// Get products by subcategory
router.get('/category/:category/subcategory/:subcategory', getProductsBySubcategory);

// Web App specific route for formatted category names
router.get('/web/category/:formattedCategory', getProductsByFormattedCategory);

// Get buyer's city
router.get('/buyer-city', verifyToken, getBuyerCity);

// Get most ordered products by category
router.get('/most-ordered-by-category', getMostOrderedProductsByCategory);

// Get most ordered product by specific category
router.get('/most-ordered-by-category/:categoryName', getMostOrderedProductByCategory);

// Get limited products by category
router.get('/limited-by-category/:category', getLimitedProductsByCategory);

export default router;
