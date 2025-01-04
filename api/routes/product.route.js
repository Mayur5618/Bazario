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
} from "../controllers/product.controller.js";

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

export default router;
