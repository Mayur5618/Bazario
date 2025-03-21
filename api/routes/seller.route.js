import express from 'express';
import { getDashboardStats, getPendingOrders, getSellerProducts } from '../controllers/seller.controller.js';
import { getSellerReviews } from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import Product from '../models/product.model.js';
// import { signup } from '../controllers/seller.controller.js';
import { sellerSignup } from '../controllers/user.controller.js';
import { getSellerProfile, verifySeller } from '../controllers/seller.controller.js';

const router = express.Router();

// Seller Registration
router.post('/signup', sellerSignup);


// Dashboard stats
router.get('/dashboard-stats', verifyToken, getDashboardStats);

// Pending orders
router.get('/pending-orders', verifyToken, getPendingOrders);

// Reviews
router.get('/reviews', verifyToken, getSellerReviews);

// Get seller's products
router.get('/products', verifyToken, getSellerProducts);
router.get('/:sellerId/products', getSellerProducts);

// Get product details
router.get('/products/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if the product belongs to the seller
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this product'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details'
        });
    }
});

// Update product
router.put('/products/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if the product belongs to the seller
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this product'
            });
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    stock: req.body.stock,
                    category: req.body.category,
                    tags: req.body.tags,
                    images: req.body.images,
                    subUnitPrices: req.body.subUnitPrices,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
});

router.get('/verify/:sellerId', verifySeller);
router.get('/profile/:sellerId', getSellerProfile);

export default router;