import Request from '../models/request.model.js';
import Product from '../models/product.model.js';

// Send Request
export const sendRequest = async (req, res) => {
    try {
        const { productId, pricePerKg, quantity, acceptOriginalPrice = false } = req.body;
        const agencyId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!quantity || quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Invalid quantity. Available: ${product.stock}kg`
            });
        }

        // If agency accepts original price, use farmer's price
        const finalPricePerKg = acceptOriginalPrice ? product.price : pricePerKg;

        // If agency is negotiating, validate their price
        if (!acceptOriginalPrice && !pricePerKg) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your price per kg for negotiation'
            });
        }

        // Calculate total value
        const totalValue = finalPricePerKg * quantity;

        const newRequest = new Request({
            productId,
            agencyId,
            sellerId: product.seller,
            pricePerKg: finalPricePerKg,
            quantity,
            totalValue,
            originalPricePerKg: product.price,
            acceptOriginalPrice, // Flag to show if agency accepted original price
            status: 'pending'
        });

        await newRequest.save();

        const populatedRequest = await Request.findById(newRequest._id)
            .populate('productId', 'name price stock')
            .populate('agencyId', 'firstname lastname mobileno')
            .populate('sellerId', 'firstname lastname mobileno');

        res.status(201).json({
            success: true,
            message: acceptOriginalPrice 
                ? 'Request sent with farmer\'s original price' 
                : 'Negotiation request sent successfully',
            request: populatedRequest
        });

    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept Request
export const acceptRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user._id;  

        const request = await Request.findById(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Verify seller owns this request
        if (request.sellerId.toString() !== sellerId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only accept requests for your products'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Request cannot be accepted as it is already ${request.status}`
            });
        }

        // Update request status
        request.status = 'accepted';
        request.acceptedAt = Date.now();
        await request.save();

        const populatedRequest = await Request.findById(id)
            .populate('productId', 'name price')
            .populate('agencyId', 'firstname lastname')
            .populate('sellerId', 'firstname lastname');

        res.status(200).json({
            success: true,
            message: 'Request accepted successfully',
            request: populatedRequest
        });

    } catch (error) {
        console.error('Accept request error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject Request
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user._id;
        const { reason } = req.body;  // Optional rejection reason

        const request = await Request.findById(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Verify seller owns this request
        if (request.sellerId.toString() !== sellerId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only reject requests for your products'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Request cannot be rejected as it is already ${request.status}`
            });
        }

        // Update request status
        request.status = 'rejected';
        request.rejectedAt = Date.now();
        request.rejectionReason = reason;
        await request.save();

        const populatedRequest = await Request.findById(id)
            .populate('productId', 'name price')
            .populate('agencyId', 'firstname lastname')
            .populate('sellerId', 'firstname lastname');

        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            request: populatedRequest
        });

    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Requests (with filters)
export const getRequests = async (req, res) => {
    try {
        const { status, productId, sellerId } = req.query;  
        const userId = req.user._id;
        const userType = req.user.userType;

        const filter = {};
        
        if (status) {
            filter.status = status;
        }

        if (productId) {
            filter.productId = productId;
        }

        if (sellerId) {
            filter.sellerId = sellerId;
        } else {
            // Default behavior: show requests based on user type
            if (userType === 'seller') {
                filter.sellerId = userId;
            } else if (userType === 'agency') {
                filter.agencyId = userId;
            }
        }

        const requests = await Request.find(filter)
            .populate('productId', 'name price stock')
            .populate('agencyId', 'firstname lastname mobileno')
            .populate('sellerId', 'firstname lastname mobileno')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};