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
  getProductsBySubcategory
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
    const { platformType } = req.query;
    const query = platformType ? { platformType: { $in: [platformType] } } : {};
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

// router.get('/category/:category', async (req, res) => {
//   try {
//     const { category } = req.params;
//     const products = await Product.find({ 
//       category: { $regex: new RegExp(category, 'i') }
//     }).populate('seller', 'name email');

//     res.status(200).json({
//       success: true,
//       products
//     });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching products'
//     });
//   }
// });

router.post(
  "/upload",  
  verifyToken,
  uploadProductImages
);

// Get products by category with subcategories
router.get('/category/:category', getProductsByCategoryAndSubcategory);

// Get products by subcategory
router.get('/category/:category/subcategory/:subcategory', getProductsBySubcategory);

export default router;
