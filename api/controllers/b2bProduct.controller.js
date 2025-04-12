import Product from '../models/product.model.js';
import { storage } from '../config/firebase.config.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to upload to Firebase
const uploadToFirebase = async (file) => {
    try {
        const storageRef = ref(storage, `b2b-products/${Date.now()}-${file.originalname}`);
        const snapshot = await uploadBytes(storageRef, file.buffer);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        throw new Error('Failed to upload to Firebase: ' + error.message);
    }
};

// Create a new B2B product with auction
export const createB2BProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            subcategory,
            minPrice,
            maxPrice,
            unitPrice,
            totalStock,
            auctionEndDate,
            negotiationEnabled = false,
            images
        } = req.body;

        const seller = req.user._id;

        // Validate auction end date
        const endDate = new Date(auctionEndDate);
        if (endDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Auction end date must be in the future'
            });
        }

        const product = new Product({
            name,
            category,
            subcategory,
            minPrice,
            maxPrice,
            unitPrice,
            stock: totalStock,
            images,
            seller,
            platformType: ['b2b'],
            minOrderQuantity: 1,
            maxOrderQuantity: totalStock,
            auctionEndDate: endDate,
            negotiationEnabled
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'B2B product created successfully',
            data: product
        });

    } catch (error) {
        console.error('Error creating B2B product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating B2B product',
            error: error.message
        });
    }
};

// Get all active B2B auctions
export const getActiveB2BAuctions = async (req, res) => {
    try {
        const auctions = await Product.find({
            platformType: 'b2b',
            auctionStatus: 'active',
            auctionEndDate: { $gt: new Date() }
        }).populate('seller', 'name');

        res.status(200).json({
            success: true,
            data: auctions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active auctions',
            error: error.message
        });
    }
};

// Get seller's B2B products
export const getSellerB2BProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const products = await Product.find({
            seller: sellerId,
            platformType: 'b2b'
        });

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching seller products',
            error: error.message
        });
    }
};

// Update B2B product
export const updateB2BProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body;

        // Check if product exists and belongs to seller
        const product = await Product.findOne({
            _id: productId,
            seller: req.user._id,
            platformType: 'b2b'
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Don't allow updating if auction has ended
        if (product.auctionStatus === 'ended') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update ended auction'
            });
        }

        // Handle image uploads if new images are provided
        if (req.files && req.files.length > 0) {
            const images = [];
            for (const file of req.files) {
                const imageUrl = await uploadToFirebase(file);
                images.push(imageUrl);
            }
            updates.images = images;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Cancel B2B auction
export const cancelB2BAuction = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            seller: req.user._id,
            platformType: 'b2b'
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.auctionStatus === 'ended') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel ended auction'
            });
        }

        product.auctionStatus = 'cancelled';
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Auction cancelled successfully',
            data: product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling auction',
            error: error.message
        });
    }
};

// Get won auctions for an agency
export const getWonAuctions = async (req, res) => {
    try {
        const { agencyId } = req.params;

        // Find all closed B2B auctions where the agency is the highest bidder
        const wonAuctions = await Product.find({
            platformType: 'b2b',
            auctionStatus: 'closed',
            currentHighestBidder: agencyId
        }).populate('seller', 'name');

        // Get total count of won auctions
        const totalWonAuctions = wonAuctions.length;

        res.status(200).json({
            success: true,
            totalWonAuctions,
            wonAuctions: wonAuctions.map(auction => ({
                _id: auction._id,
                name: auction.name,
                category: auction.category,
                subcategory: auction.subcategory,
                images: auction.images,
                seller: auction.seller,
                finalPrice: auction.currentHighestBid,
                auctionEndDate: auction.auctionEndDate,
                stock: auction.stock || 0,
                unitType: auction.unitType || 'kg'
            })),
            message: 'Successfully retrieved won auctions'
        });
    } catch (error) {
        console.error('Error in getWonAuctions:', error);
        res.status(500).json({
            success: false,
            message: 'नीलामी जीतने वाले उत्पाद प्राप्त करने में त्रुटि हुई',
            error: error.message
        });
    }
}; 