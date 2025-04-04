import express from 'express';
import { protect, verifyToken } from '../middleware/authMiddleware.js';
import {
    createOrder,
    createDirectOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getSellerOrders,
    updateOrderStatus,
    getBuyerOrdersWithDetails,
    getCustomerOrderHistory,
    getSellerOrderStats
} from '../controllers/order.controller.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';

const router = express.Router();

router.use(protect);

// Buyer routes
router.post('/create', createOrder);
router.post('/create-direct', createDirectOrder);
router.get('/my-orders', getMyOrders);
router.get('/my-orders-details', getBuyerOrdersWithDetails);

// Seller routes - Move this BEFORE the :id route
router.get('/seller-orders', getSellerOrders);
router.get('/seller-stats', getSellerOrderStats);
router.put('/update-status/:id', updateOrderStatus);

// Customer history route
router.get('/customer/:id/history', getCustomerOrderHistory);

// Generic routes with :id parameter - Keep these AFTER specific routes
router.get('/:id', getOrderDetails);
router.put('/cancel/:id', cancelOrder);

// Check purchase route
router.get('/check-purchase/:productId', protect, async (req, res) => {
    try {
      const validOrderStatuses = ['delivered', 'completed','Delivered','Completed'];
      
      const order = await Order.findOne({
        buyer: req.user._id,
        'items.product': req.params.productId,
        status: { $in: validOrderStatuses },
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      });

      console.log(order);
      console.log(req.user._id);
      console.log(req.params.productId);
  
      if (!order) {
        return res.json({
          hasPurchased: false,
          message: 'No eligible orders found for review'
        });
      }
  
      const existingReview = await Review.findOne({
        buyer: req.user._id,
        product: req.params.productId
      });
  
      res.json({
        hasPurchased: true,
        hasReviewed: !!existingReview,
        orderDate: order.createdAt,
        orderStatus: order.status,
        orderId: order._id
      });
  
    } catch (error) {
      res.status(500).json({
        message: 'Error checking purchase history',
        error: error.message
      });
    }
});

export default router; 