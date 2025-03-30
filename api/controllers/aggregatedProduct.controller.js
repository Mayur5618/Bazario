import AggregatedProduct from '../models/aggregatedProduct.model.js';
import { getDistance } from 'geolib';

// Create or update an aggregated product
export const createOrUpdateProduct = async (req, res) => {
    try {
        const {
            name, description, category, subcategory,
            images, unitType, price, stock
        } = req.body;

        // Find existing product or create new one
        let product = await AggregatedProduct.findOne({ name });

        if (!product) {
            // Create new product
            product = new AggregatedProduct({
                name,
                description,
                category,
                subcategory,
                images,
                unitType,
                basePrice: price,
                sellers: [{
                    seller: req.user._id,
                    price,
                    stock,
                    location: req.user.location
                }]
            });
        } else {
            // Update existing product
            const sellerIndex = product.sellers.findIndex(
                s => s.seller.toString() === req.user._id.toString()
            );

            if (sellerIndex === -1) {
                // Add new seller
                product.sellers.push({
                    seller: req.user._id,
                    price,
                    stock,
                    location: req.user.location
                });
            } else {
                // Update existing seller
                product.sellers[sellerIndex].price = price;
                product.sellers[sellerIndex].stock = stock;
                product.sellers[sellerIndex].location = req.user.location;
            }
        }

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product added/updated successfully',
            product
        });

    } catch (error) {
        console.error('Error in createOrUpdateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating/updating product',
            error: error.message
        });
    }
};

// Get all aggregated products
export const getAggregatedProducts = async (req, res) => {
    try {
        const products = await AggregatedProduct.find()
            .populate('sellers.seller', 'firstname lastname shopName');

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.error('Error in getAggregatedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get single aggregated product with nearest sellers
export const getAggregatedProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { latitude, longitude } = req.query;

        const product = await AggregatedProduct.findById(productId)
            .populate('sellers.seller', 'firstname lastname shopName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // If buyer's location is provided, sort sellers by distance
        if (latitude && longitude) {
            product.sellers.sort((a, b) => {
                const distanceA = getDistance(
                    { latitude, longitude },
                    { latitude: a.location.latitude, longitude: a.location.longitude }
                );
                const distanceB = getDistance(
                    { latitude, longitude },
                    { latitude: b.location.latitude, longitude: b.location.longitude }
                );
                return distanceA - distanceB;
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error in getAggregatedProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Update product stock
export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;

        const product = await AggregatedProduct.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const sellerIndex = product.sellers.findIndex(
            s => s.seller.toString() === req.user._id.toString()
        );

        if (sellerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found for this product'
            });
        }

        product.sellers[sellerIndex].stock = stock;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            product
        });

    } catch (error) {
        console.error('Error in updateStock:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock',
            error: error.message
        });
    }
};

// Search aggregated products
export const searchAggregatedProducts = async (req, res) => {
    try {
        const { query, latitude, longitude } = req.query;

        const products = await AggregatedProduct.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { subcategory: { $regex: query, $options: 'i' } }
            ]
        }).populate('sellers.seller', 'firstname lastname shopName');

        // If buyer's location is provided, sort sellers in each product by distance
        if (latitude && longitude) {
            products.forEach(product => {
                product.sellers.sort((a, b) => {
                    const distanceA = getDistance(
                        { latitude, longitude },
                        { latitude: a.location.latitude, longitude: a.location.longitude }
                    );
                    const distanceB = getDistance(
                        { latitude, longitude },
                        { latitude: b.location.latitude, longitude: b.location.longitude }
                    );
                    return distanceA - distanceB;
                });
            });
        }

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.error('Error in searchAggregatedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
}; 