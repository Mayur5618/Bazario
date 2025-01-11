import express from 'express';
import { protect, verifyToken } from '../middleware/authMiddleware.js';
import {
    createOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getSellerOrders,
    updateOrderStatus,
    getBuyerOrdersWithDetails
} from '../controllers/order.controller.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';


const router = express.Router();

router.use(protect);

// Buyer routes
router.post('/create', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderDetails);
router.put('/cancel/:id', cancelOrder);
// Get all orders with details for buyer
router.get('/my-orders-details', getBuyerOrdersWithDetails);

// Seller routes
router.get('/seller-orders', getSellerOrders);
router.put('/update-status/:id', updateOrderStatus);
// router.get('/check-purchase/:productId', auth, async (req, res) => {
//     try {
//       const orders = await Order.find({
//         user: req.user._id,
//         'items.product': req.params.productId,
//         status: { 
//           $in: ['delivered', 'completed'] 
//         }
//       });
  
//       res.json({
//         hasPurchased: orders.length > 0
//       });
//     } catch (error) {
//       res.status(500).json({
//         message: 'Error checking purchase history',
//         error: error.message
//       });
//     }
//   });
  router.get('/check-purchase/:productId', protect, async (req, res) => {
    try {
      const validOrderStatuses = ['delivered', 'completed','Delivered','Completed'];
      
      const order = await Order.findOne({
        buyer: req.user._id,
        'items.product': req.params.productId,
        status: { $in: validOrderStatuses },
        // Optionally add a date restriction
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Within last 30 days
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
  
      // Check if user has already reviewed
      const existingReview = await Review.findOne({
        user: req.user._id,
        product: req.params.productId
      });
  
      res.json({
        hasPurchased: true,
        hasReviewed: !!existingReview,
        orderDate: order.createdAt,
        orderStatus: order.status
      });
  
    } catch (error) {
      res.status(500).json({
        message: 'Error checking purchase history',
        error: error.message
      });
    }
  });

export default router; 