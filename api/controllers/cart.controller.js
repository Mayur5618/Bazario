import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const buyerId = req.user._id;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is B2C
        if (!product.platformType.includes('b2c')) {
            return res.status(400).json({
                success: false,
                message: 'This product is not available for retail purchase'
            });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ buyer: buyerId });
        if (!cart) {
            cart = new Cart({
                buyer: buyerId,
                items: []
            });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            // Update quantity
            existingItem.quantity = quantity;
            existingItem.subtotal = quantity * product.price;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                seller: product.seller,
                quantity,
                unitSize: product.unitSize,
                unitType: product.unitType,
                price: product.price,
                subtotal: quantity * product.price
            });
        }

        await cart.save();

        // Populate product details
        await cart.populate('items.product', 'name images');
        await cart.populate('items.seller', 'firstname lastname');

        res.json({
            success: true,
            cart
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ buyer: req.user._id })
            .populate('items.product', 'name images price stock')
            .populate('items.seller', 'firstname lastname');

        res.json({
            success: true,
            cart: cart || { items: [], subtotal: 0, total: 0 }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update cart item
export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const cart = await Cart.findOne({ buyer: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Remove item if quantity is 0
        if (quantity === 0) {
            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        } else {
            // Update quantity
            item.quantity = quantity;
            item.subtotal = quantity * item.price;
        }

        await cart.save();
        await cart.populate('items.product', 'name images');

        res.json({
            success: true,
            cart
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const cart = await Cart.findOne({ buyer: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        res.json({
            success: true,
            cart
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 