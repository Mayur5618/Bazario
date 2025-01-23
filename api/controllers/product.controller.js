import express from 'express';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';

const router = express.Router();

//POST /api/products
export const createProduct = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            price, 
            category, 
            stock, 
            images,
            platformType,
            minOrderQuantity,
            maxOrderQuantity,
            unitSize,
            unitType
        } = req.body;

        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, price, category, stock'
            });
        }

        if (!platformType || !Array.isArray(platformType) || platformType.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Platform type must be provided as an array ["b2b"], ["b2c"], or ["b2b", "b2c"]'
            });
        }

        const validPlatformTypes = ['b2b', 'b2c'];
        if (!platformType.every(type => validPlatformTypes.includes(type))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid platform type. Must be "b2b" or "b2c"'
            });
        }

        if (!req.user || !req.user.platformType) {
            return res.status(401).json({
                success: false,
                message: 'User platform type not found. Please update your profile.'
            });
        }

        if (!platformType.every(type => req.user.platformType.includes(type))) {
            return res.status(400).json({
                success: false,
                message: `Platform type must match your registered platform types. Your platforms: ${req.user.platformType.join(', ')}`
            });
        }

        if (platformType.includes('b2b')) {
            if (!minOrderQuantity || minOrderQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum order quantity is required and must be at least 1 for B2B products'
                });
            }
            if (maxOrderQuantity && maxOrderQuantity < minOrderQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum order quantity must be greater than minimum order quantity'
                });
            }
        }

        if (platformType.includes('b2c')) {
            if (!unitSize || unitSize <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Unit size is required and must be greater than 0 for B2C products'
                });
            }
            if (!unitType || !['kg', 'g', 'piece','thali','pack'].includes(unitType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Unit type must be kg, g, piece ,thali or pack'
                });
            }
        }

        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            seller: req.user._id,
            platformType: { $all: platformType }
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'You already have a product with this name for these platforms. Please use a different name or update the existing product.',
                existingProduct: {
                    id: existingProduct._id,
                    name: existingProduct.name,
                    price: existingProduct.price,
                    stock: existingProduct.stock,
                    platformType: existingProduct.platformType
                }
            });
        }

        const productData = {
            name,
            description,
            price,
            category,
            stock,
            images: images || [],
            platformType,
            seller: req.user._id,
            ...(platformType.includes('b2b') && {
                minOrderQuantity,
                maxOrderQuantity: maxOrderQuantity || null
            }),
            ...(platformType.includes('b2c') && {
                unitSize,
                unitType
            })
        };

        const product = new Product(productData);
        const createdProduct = await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: createdProduct
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

//PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide data to update'
            });
        }

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own products'
            });
        }

        if (req.body.platformType && req.body.platformType !== product.platformType) {
            return res.status(400).json({
                success: false,
                message: 'Platform type cannot be changed after creation'
            });
        }

        let hasChanges = false;
        const updates = { ...req.body };
        
        for (const [key, value] of Object.entries(updates)) {
            const currentValue = product[key]?.toString();
            const newValue = value?.toString();
            
            if (currentValue !== newValue) {
                hasChanges = true;
                console.log(`Change detected in ${key}: ${currentValue} -> ${newValue}`);
                break;
            }
        }

        if (!hasChanges) {
            return res.status(400).json({
                success: false,
                message: 'No changes detected. The data you provided is the same as existing data.'
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Update product error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

//DELETE /api/products/:id
export const deleteProduct =  async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own products'
            });
        }

        await Product.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Product removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//GET /api/products
export const getProducts = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, sortBy } = req.query;
        
        const filter = {};
        
        // Text search
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Sort options
        let sort = {};
        switch (sortBy) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        const products = await Product.find(filter)
            .sort(sort)
            .populate('seller', 'firstname lastname');

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'firstname lastname')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'firstname lastname'
                }
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// // GET /api/search
// export const searchProducts = async (req, res) => {
//     try {
//         const { query, category, sortBy } = req.query;
        
//         // Build search filter
//         const filter = {};
        
//         // Text search if query exists
//         if (query) {
//             filter.$or = [
//                 { name: { $regex: query, $options: 'i' } },
//                 { description: { $regex: query, $options: 'i' } },
//                 { category: { $regex: query, $options: 'i' } }
//             ];
//         }

//         // Category filter
//         if (category && category !== 'all') {
//             filter.category = category;
//         }

//         // Build sort object
//         let sort = {};
//         switch (sortBy) {
//             case 'price_asc':
//                 sort = { price: 1 };
//                 break;
//             case 'price_desc':
//                 sort = { price: -1 };
//                 break;
//             case 'newest':
//                 sort = { createdAt: -1 };
//                 break;
//             default:
//                 // For 'relevance' or default sorting
//                 if (query) {
//                     // If there's a search query, prioritize exact matches
//                     sort = { score: { $meta: "textScore" } };
//                 } else {
//                     // Default sort by newest
//                     sort = { createdAt: -1 };
//                 }
//         }

//         // Execute search query
//         const products = await Product.find(filter)
//             .sort(sort)
//             .populate('seller', 'firstname lastname')
//             .select('name description price category stock images platformType unitSize unitType createdAt');

//         // Return results
//         res.json({
//             success: true,
//             count: products.length,
//             products
//         });

//     } catch (error) {
//         console.error('Search error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error searching products',
//             error: error.message
//         });
//     }
// };

// // GET /api/search/suggestions
// export const getSearchSuggestions = async (req, res) => {
//     try {
//         const { query } = req.query;

//         if (!query || query.length < 2) {
//             return res.json({
//                 success: true,
//                 suggestions: []
//             });
//         }

//         // Find products matching the query
//         const suggestions = await Product.find({
//             $or: [
//                 { name: { $regex: query, $options: 'i' } },
//                 { category: { $regex: query, $options: 'i' } }
//             ]
//         })
//         .select('name category')
//         .limit(5);

//         // Extract unique categories and product names
//         const uniqueSuggestions = Array.from(new Set([
//             ...suggestions.map(p => p.name),
//             ...suggestions.map(p => p.category)
//         ])).slice(0, 5);

//         res.json({
//             success: true,
//             suggestions: uniqueSuggestions
//         });

//     } catch (error) {
//         console.error('Search suggestions error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error getting search suggestions',
//             error: error.message
//         });
//     }
// };

// // GET /api/search/trending
// export const getTrendingSearches = async (req, res) => {
//     try {
//         // Get most viewed or most ordered products
//         const trendingProducts = await Product.find({})
//             .sort({ numReviews: -1 }) // You can change this to any trending metric
//             .limit(5)
//             .select('name category');

//         const trending = Array.from(new Set([
//             ...trendingProducts.map(p => p.name),
//             ...trendingProducts.map(p => p.category)
//         ])).slice(0, 5);

//         res.json({
//             success: true,
//             trending
//         });

//     } catch (error) {
//         console.error('Trending searches error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error getting trending searches',
//             error: error.message
//         });
//     }
// };

// Add this new controller function
export const getBulkProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs must be provided as an array'
      });
    }

    const products = await Product.find({
      '_id': { $in: productIds }
    }).populate('seller', 'firstname lastname');

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Bulk products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Add this new controller function for filtered products
export const getFilteredProducts = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            maxRating,
            sortBy,
            search,
            page = 1,
            limit = 12,
            platformType = 'b2c'
        } = req.query;

        console.log('Received Query Params:', req.query);

        // Build base filter
        let filter = {
            platformType: { $in: [platformType] },
            stock: { $gt: 0 }
        };

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Rating filter
        if (maxRating && !isNaN(Number(maxRating))) {
            filter.rating = { 
                $lte: Number(maxRating),
                $gt: 0
            };
        }

        // Determine sort options with focus on price sorting
        let sortOption = {};
        
        if (maxRating && !isNaN(Number(maxRating))) {
            sortOption = { rating: -1 };
        } else {
            switch(sortBy) {
                case 'price_low':
                    // Explicit price ascending sort
                    sortOption = { 
                        price: 1,  // 1 for ascending order
                        _id: 1     // Secondary sort by _id for consistent ordering
                    };
                    break;
                case 'price_high':
                    sortOption = { price: -1, _id: 1 };
                    break;
                case 'rating_high':
                    sortOption = { rating: -1, numReviews: -1 };
                    break;
                case 'most_sold':
                    sortOption = { numSold: -1, rating: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }
        }

        console.log('Applied Sort Option:', sortOption);

        // Execute query with aggregation pipeline for better sorting
        const products = await Product.aggregate([
            { $match: filter },
            { 
                $addFields: {
                    numericPrice: { $toDouble: "$price" }  // Convert price to number
                }
            },
            { 
                $sort: sortBy === 'price_low' 
                    ? { numericPrice: 1 }  // Sort by converted numeric price
                    : sortOption 
            },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { 
                $unwind: {
                    path: '$seller',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    category: 1,
                    stock: 1,
                    platformType: 1,
                    images: 1,
                    unitSize: 1,
                    unitType: 1,
                    reviews: 1,
                    rating: 1,
                    numReviews: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'seller._id': 1,
                    'seller.firstname': 1,
                    'seller.lastname': 1
                }
            }
        ]);

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        // Log sorted products for verification
        console.log('Sorted Products:', products.map(p => ({
            name: p.name,
            price: p.price,
            numericPrice: p.numericPrice
        })));

        res.status(200).json({
            success: true,
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total,
            filters: {
                minPrice,
                maxPrice,
                maxRating,
                sortBy,
                search,
                platformType
            }
        });

    } catch (error) {
        console.error('Filter products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error filtering products',
            error: error.message
        });
    }
};

// Add a new function to get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { platformType = 'b2c', limit = 8 } = req.query;

        const products = await Product.find({
            category: { $regex: new RegExp(category, 'i') },
            platformType: { $in: [platformType] }
        })
        .limit(parseInt(limit))
        .populate('seller', 'firstname lastname')
        .populate('reviews');

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category'
        });
    }
};

// Add this new controller function
export const getCategories = async (req, res) => {
    try {
        const { platformType } = req.query;
        
        // Build query for platform type
        const query = platformType ? { platformType: { $in: [platformType] } } : {};
        
        // Get distinct categories
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
};

export default router;