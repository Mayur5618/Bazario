import express from 'express';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';
import { uploadToFirebase } from '../utilities/firebase.js';
import Seller from '../models/seller.model.js';
import asyncHandler from 'express-async-handler';
import Bid from '../models/bid.model.js';
import Agency from '../models/agency.model.js';
import User from '../models/baseUser.model.js';

const router = express.Router();

//POST /api/products
export const createProduct = async (req, res) => {
    try {
        console.log('Create Product Request Body:', req.body);
        console.log('Authenticated User:', req.user);

        const {
            name,
            description,
            price,
            category,
            subcategory,
            stock,
            images,
            tags,
            youtubeLink,
            platformType,
            unitSize,
            unitType,
            subUnitPrices,
            availableLocations,
            minOrderQuantity,
            maxOrderQuantity
        } = req.body;

        // Validate required fields
        if (!name || !price || !category || !subcategory || !stock || !unitType || !availableLocations) {
            console.log('Missing required fields:', { name, price, category, stock, unitType, availableLocations });
            return res.status(400).json({ success: false, message: "All fields including available locations are required." });
        }

        // Set default platform type to b2c if not provided
        const productPlatformType = platformType || ['b2c'];
        console.log('Platform Type:', productPlatformType);

        const validPlatformTypes = ['b2b', 'b2c'];
        if (!productPlatformType.every(type => validPlatformTypes.includes(type))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid platform type. Must be "b2b" or "b2c"'
            });
        }

        // Check if user exists and get their city
        if (!req.user) {
            console.log('No authenticated user found');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // If user's platformType is not set, default to b2c
        if (!req.user.platformType) {
            console.log('Setting default platform type for user');
            req.user.platformType = ['b2c'];
        }

        if (productPlatformType.includes('b2b')) {
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

        if (productPlatformType.includes('b2c')) {
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
            platformType: { $all: productPlatformType }
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
            description: description || '',
            price: Number(price),
            category,
            subcategory,
            stock: Number(stock),
            images: images || [],
            tags: tags || [],
            youtubeLink: youtubeLink || '',
            platformType: productPlatformType,
            seller: req.user._id,
            availableLocations,
            primaryLocation: req.user.city,
            ...(productPlatformType.includes('b2c') && {
                unitSize: Number(unitSize) || 1,
                unitType
            }),
            subUnitPrices: subUnitPrices || {}
        };

        // Only add B2B fields if it's a B2B product
        if (productPlatformType.includes('b2b')) {
            Object.assign(productData, {
                minOrderQuantity,
                maxOrderQuantity: maxOrderQuantity || null,
                negotiationEnabled: true,
                currentHighestBid: 0,
                auctionStatus: 'active',
                auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                minPrice: Number(price),
                maxPrice: Number(price) * 1.5,
                unitPrice: Number(price)
            });
        }

        console.log('Final Product Data:', productData);

        const product = new Product(productData);
        const createdProduct = await product.save();
        
        console.log('Product created successfully:', createdProduct);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: createdProduct
        });

    } catch (error) {
        console.error('Create product detailed error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

//POST /api/b2b/products/create
export const createB2BProduct = async (req, res) => {
    try {
        console.log('Create B2B Product Request Body:', req.body);
        console.log('Authenticated User:', req.user);

        const {
            name,
            description = '',
            category,
            subcategory,
            minPrice,
            maxPrice,
            unitType,
            Price,  // Frontend field
            Stock,  // Frontend field
            auctionEndDate,
            negotiationEnabled = true,
            images = []
        } = req.body;

        // Map frontend fields to backend fields
        const unitPrice = Price || minPrice;
        const totalStock = Stock || 1000; // Default stock if not provided

        // Validate required fields
        if (!name || !category || !subcategory || !minPrice || !maxPrice || !unitType) {
            console.log('Missing required fields:', { name, category, subcategory, minPrice, maxPrice, unitType });
            return res.status(400).json({ 
                success: false, 
                message: "सभी आवश्यक फील्ड भरें। नाम, श्रेणी, उपश्रेणी, न्यूनतम मूल्य, अधिकतम मूल्य, इकाई प्रकार आवश्यक हैं।" 
            });
        }

        // Validate price range
        if (Number(minPrice) >= Number(maxPrice)) {
            return res.status(400).json({
                success: false,
                message: 'न्यूनतम मूल्य अधिकतम मूल्य से कम होना चाहिए।'
            });
        }

        // Validate unit type
        const validUnitTypes = ['kg', 'g', 'piece', 'thali', 'pack', 'ton', 'quintal'];
        if (!validUnitTypes.includes(unitType)) {
            return res.status(400).json({
                success: false,
                message: 'अमान्य इकाई प्रकार। मान्य प्रकार हैं: kg, g, piece, thali, pack, ton, quintal'
            });
        }

        // Check if user exists and is authorized for B2B
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'उपयोगकर्ता प्रमाणित नहीं है'
            });
        }

        // Check for existing product with same name
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            seller: req.user._id,
            platformType: 'b2b'
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'इस नाम का B2B प्रोडक्ट पहले से मौजूद है। कृपया दूसरा नाम चुनें या मौजूदा प्रोडक्ट को अपडेट करें।',
                existingProduct: {
                    id: existingProduct._id,
                    name: existingProduct.name,
                    minPrice: existingProduct.minPrice,
                    maxPrice: existingProduct.maxPrice,
                    totalStock: existingProduct.totalStock
                }
            });
        }

        // Set default auction end date to 7 days from now if not provided
        const defaultAuctionEndDate = new Date();
        defaultAuctionEndDate.setDate(defaultAuctionEndDate.getDate() + 7);

        // Prepare product data with all required fields
        const productData = {
            name,
            description,
            category,
            subcategory,
            minPrice: Number(minPrice),
            maxPrice: Number(maxPrice),
            unitType,
            unitPrice: Number(unitPrice),
            totalStock: Number(totalStock),
            price: Number(minPrice), // Use minPrice as base price
            stock: Number(totalStock),
            images,
            youtubeLink: '',
            platformType: ['b2b'],
            seller: req.user._id,
            availableLocations: [req.user.city],
            primaryLocation: req.user.city,
            minOrderQuantity: 1,
            maxOrderQuantity: totalStock,
            tags: [],
            // B2B specific fields
            auctionEndDate: auctionEndDate || defaultAuctionEndDate,
            negotiationEnabled: negotiationEnabled,
            auctionStatus: 'active',
            currentHighestBid: 0,
            currentHighestBidder: null,
            rating: 0,
            numReviews: 0
        };

        console.log('Final B2B Product Data:', productData);

        const product = new Product(productData);
        const createdProduct = await product.save();
        
        console.log('B2B Product created successfully:', createdProduct);

        res.status(201).json({
            success: true,
            message: 'B2B प्रोडक्ट सफलतापूर्वक बनाया गया',
            product: createdProduct
        });

    } catch (error) {
        console.error('Create B2B product error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: 'आंतरिक सर्वर त्रुटि'
        });
    }
};

//PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find product
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own products'
            });
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Update product error:', error);
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
        const { 
            page = 1, 
            limit = 10,
            query,  // search query
            city,   // buyer's city
            category, 
            subcategory, 
            minPrice, 
            maxPrice, 
            sortBy = 'createdAt',
            sortOrder = 'desc',
            platformType = 'b2c'
        } = req.query;

        console.log('Search Query:', query);
        console.log('Buyer City:', city);

        // Base query object
        const searchQuery = {
            platformType: { $in: [platformType] },
            stock: { $gt: 0 }  // Only show products with stock > 0
        };

        // Add name search if query exists
        if (query && query.trim()) {
            searchQuery.name = { 
                $regex: new RegExp(query.trim(), 'i')
            };
        }

        // Add city-based filtering if buyer's city is provided
        if (city && city.trim()) {
            searchQuery.availableLocations = {
                $regex: new RegExp(city.trim(), 'i')
            };
        }

        // Add category filter if provided
        if (category && category !== 'undefined' && category !== 'null') {
            searchQuery.category = { 
                $regex: new RegExp(`^${category}$`, 'i')
            };
        }

        // Add subcategory filter if provided
        if (subcategory && subcategory !== 'undefined' && subcategory !== 'null') {
            searchQuery.subcategory = { 
                $regex: new RegExp(`^${subcategory}$`, 'i')
            };
        }

        // Add price range filter
        if ((minPrice && minPrice !== 'undefined') || (maxPrice && maxPrice !== 'undefined')) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = Number(minPrice);
            if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
        }

        console.log('Final search query:', JSON.stringify(searchQuery, null, 2));

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        
        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        const products = await Product.find(searchQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('seller', 'name email city userType')
            .lean();

        // Get total count for pagination
        const total = await Product.countDocuments(searchQuery);

        console.log(`Found ${products.length} products matching criteria`);

        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { city: buyerCity } = req.query; // Get buyer's city from query params
        
        const product = await Product.findById(id)
            .populate({
                path: 'seller',
                select: 'firstname lastname shopName profileImage businessType city state createdAt',
                model: 'User'  // Explicitly specify the model
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get seller's total products count
        const productsCount = await Product.countDocuments({ seller: product.seller._id });

        // Fetch related products from same category and available in buyer's city
        const relatedProductsQuery = {
            category: product.category,
            _id: { $ne: product._id } // Exclude current product
        };

        // Only add city filter if buyerCity is provided
        if (buyerCity) {
            relatedProductsQuery.availableLocations = {
                $elemMatch: { 
                    $regex: new RegExp(buyerCity, 'i')
                }
            };
        }

        const relatedProducts = await Product.find(relatedProductsQuery)
            .limit(10) // Changed from 5 to 10 related products
            .select('name images price stock rating reviews availableLocations'); // Added availableLocations

        // Add productsCount to seller object
        const productWithSellerInfo = {
            ...product.toObject(),
            seller: {
                ...product.seller.toObject(),
                productsCount
            },
            relatedProducts
        };

        res.status(200).json({
            success: true,
            product: productWithSellerInfo
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

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
            minRating,
            sortBy,
            search,
            category,
            page = 1,
            limit = 12,
            platformType = 'b2c',
            city
        } = req.query;

        console.log('Received Query Params:', req.query);

        // Build base filter
        let filter = {
            platformType: { $in: [platformType] },
            stock: { $gt: 0 }
        };

        // Add location filter if city is provided
        if (city) {
            filter.availableLocations = { 
                $elemMatch: { 
                    $regex: new RegExp(city, 'i')
                }
            };
        }

        // Category filter
        if (category) {
            filter.category = { $regex: new RegExp(category, 'i') };
        }

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
        if (minRating && !isNaN(Number(minRating))) {
            filter.rating = { 
                $gte: Number(minRating),
                $gt: 0
            };
        }

        // Determine sort options with focus on price sorting
        let sortOption = {};
        
        if (minRating && !isNaN(Number(minRating))) {
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
                minRating,
                sortBy,
                search,
                category,
                platformType,
                city
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
        const { city } = req.query;

        if (!category || !city) {
            return res.status(400).json({
                success: false,
                message: "Category and city are required"
            });
        }

        // First get all subcategories for this category where at least one product has the buyer's city
        const subcategoriesWithProducts = await Product.aggregate([
            {
                $match: {
                    category: category,
                    availableLocations: { $regex: new RegExp(city, 'i') }
                }
            },
            {
                $group: {
                    _id: "$subcategory",
                    products: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            description: "$description",
                            price: "$price",
                            images: "$images",
                            stock: "$stock",
                            rating: "$rating",
                            numReviews: "$numReviews",
                            unitSize: "$unitSize",
                            unitType: "$unitType",
                            availableLocations: "$availableLocations"
                        }
                    },
                    totalProducts: { $sum: 1 }
                }
            },
            {
                $match: {
                    _id: { $ne: null } // Filter out null subcategories
                }
            }
        ]);

        const response = {
            success: true,
            category,
            city,
            totalSubcategories: subcategoriesWithProducts.length,
            totalProducts: subcategoriesWithProducts.reduce((acc, sub) => acc + sub.totalProducts, 0),
            subcategories: subcategoriesWithProducts.map(sub => ({
                subcategory: sub._id,
                products: sub.products,
                totalProducts: sub.totalProducts
            }))
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error in getProductsByCategory:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching products by category",
            error: error.message
        });
    }
};

// Get all unique categories
export const getCategories = async (req, res) => {
    try {
        // Only get categories from products that have platformType b2c
        const categories = await Product.distinct('category', { platformType: 'b2c' });
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Add this new function for handling product image uploads
export const uploadProductImages = async (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({
                success: false,
                message: 'No image data provided'
            });
        }

        // Get base64 image data
        const base64Image = req.body.image;
        
        // Upload to Firebase
        const imageUrl = await uploadToFirebase(base64Image);
        
        return res.status(200).json({
            success: true,
            url: imageUrl
        });
    } catch (error) {
        console.error('Error uploading product image:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
};

// Get products by category with subcategory grouping
export const getProductsByCategoryAndSubcategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { city } = req.query;

        console.log('Fetching products for category:', category, 'city:', city);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // Base query
        let query = {
            category: { $regex: new RegExp(category, 'i') },
            stock: { $gt: 0 } // Only show products with stock > 0
        };

        // Add city filter if provided
        if (city) {
            query.availableLocations = {
                $elemMatch: {
                    $regex: new RegExp(city, 'i')
                }
            };
        }

        // Fetch products and group by subcategory
        const products = await Product.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'sellers',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'sellerInfo'
                }
            },
            {
                $unwind: '$sellerInfo'
            },
            {
                $group: {
                    _id: '$subcategory',
                    products: {
                        $push: {
                            _id: '$_id',
                            name: '$name',
                            description: '$description',
                            price: '$price',
                            images: '$images',
                            stock: '$stock',
                            rating: '$rating',
                            numReviews: '$numReviews',
                            unitSize: '$unitSize',
                            unitType: '$unitType',
                            availableLocations: '$availableLocations',
                            seller: {
                                _id: '$sellerInfo._id',
                                name: '$sellerInfo.name',
                                city: '$sellerInfo.city'
                            },
                            tags: '$tags',
                            youtubeLink: '$youtubeLink'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    subcategory: '$_id',
                    products: 1,
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { subcategory: 1 } }
        ]);

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No products found for category: ${category}${city ? ` in ${city}` : ''}`
            });
        }

        console.log(`Found ${products.length} subcategories for category: ${category}`);

        res.status(200).json({
            success: true,
            category,
            city: city || null,
            totalSubcategories: products.length,
            totalProducts: products.reduce((acc, curr) => acc + curr.count, 0),
            subcategories: products
        });

    } catch (error) {
        console.error('Error in getProductsByCategoryAndSubcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category and subcategory',
            error: error.message
        });
    }
};

// Get buyer's city from auth token
export const getBuyerCity = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get city from user's address or directly from user object
        const city = req.user?.address?.city || req.user?.city || '';

        console.log('Returning buyer city:', city);

        res.json({
            success: true,
            city
        });

    } catch (error) {
        console.error('Get buyer city error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching buyer city',
            error: error.message
        });
    }
};

export const getProductsBySubcategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const { city, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    if (!category || !subcategory || !city) {
      return res.status(400).json({
        success: false,
        message: "Category, subcategory and city are required"
      });
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'desc' ? -1 : 1;

    // Find products matching criteria
    const products = await Product.find({
      category: category,
      subcategory: subcategory,
      availableLocations: { $regex: new RegExp(city, 'i') }
    })
    .sort(sortObject)
    .skip(skip)
    .limit(parseInt(limit))
    .select('name description price images stock rating numReviews unitSize unitType availableLocations');

    // Get total count for pagination
    const total = await Product.countDocuments({
      category: category,
      subcategory: subcategory,
      availableLocations: { $regex: new RegExp(city, 'i') }
    });

    const response = {
      success: true,
      category,
      subcategory,
      city,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        stock: product.stock,
        rating: product.rating,
        numReviews: product.numReviews,
        unitSize: product.unitSize,
        unitType: product.unitType,
        availableLocations: product.availableLocations
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getProductsBySubcategory:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching products by subcategory",
      error: error.message
    });
  }
};

// Get seller's B2B products
export const getSellerB2BProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log('Searching for seller ID:', sellerId);

    const query = {
      seller: sellerId,
      platformType: 'b2b',
    };
    console.log('Query:', JSON.stringify(query));

    const b2bProducts = await Product.find(query)
      .select('name description price stock category subcategory images platformType minPrice maxPrice unitType unitPrice totalStock minOrderQuantity maxOrderQuantity auctionEndDate availableLocations negotiationEnabled tags createdAt auctionStatus currentHighestBid currentHighestBidder')
      .populate('currentHighestBidder', 'agencyName')
      .sort({ createdAt: -1 });

    console.log('Found products:', b2bProducts.length);

    if (!b2bProducts || b2bProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "कोई B2B प्रोडक्ट्स नहीं मिले"
      });
    }

    // Format the response data
    const formattedProducts = b2bProducts.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory,
      images: product.images,
      platformType: product.platformType,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      unitType: product.unitType,
      unitPrice: product.unitPrice,
      totalStock: product.totalStock,
      minOrderQuantity: product.minOrderQuantity,
      maxOrderQuantity: product.maxOrderQuantity,
      auctionEndDate: product.auctionEndDate,
      availableLocations: product.availableLocations,
      negotiationEnabled: product.negotiationEnabled,
      tags: product.tags,
      createdAt: product.createdAt,
      // Add auction fields
      auctionStatus: product.auctionStatus,
      currentHighestBid: product.currentHighestBid,
      currentHighestBidder: product.currentHighestBidder ? {
        _id: product.currentHighestBidder._id,
        agencyName: product.currentHighestBidder.agencyName
      } : null
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      totalProducts: formattedProducts.length,
      message: "B2B प्रोडक्ट्स सफलतापूर्वक प्राप्त किए गए"
    });
  } catch (error) {
    console.error("Error in getSellerB2BProducts:", error);
    res.status(500).json({
      success: false,
      message: "B2B प्रोडक्ट्स प्राप्त करने में त्रुटि हुई",
      error: error.message
    });
  }
};

// Get B2B product categories
export const getB2BCategories = async (req, res) => {
  try {
    // Find unique categories where platformType includes 'b2b'
    const categories = await Product.distinct('category', {
      platformType: 'b2b'
    });

    // Get detailed category information with subcategories
    const categoryDetails = await Product.aggregate([
      {
        $match: {
          platformType: 'b2b'
        }
      },
      {
        $group: {
          _id: '$category',
          subcategories: { $addToSet: '$subcategory' },
          totalProducts: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          subcategories: 1,
          totalProducts: 1,
          _id: 0
        }
      },
      {
        $sort: { category: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'B2B श्रेणियां सफलतापूर्वक प्राप्त की गईं',
      categories: categoryDetails
    });

  } catch (error) {
    console.error('Error in getB2BCategories:', error);
    res.status(500).json({
      success: false,
      message: 'B2B श्रेणियां प्राप्त करने में त्रुटि हुई',
      error: error.message
    });
  }
};

// Get B2B products by category with subcategories
export const getB2BProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'श्रेणी आवश्यक है'
      });
    }

    // Find all B2B products in this category and group by subcategory
    const productsGroupedBySubcategory = await Product.aggregate([
      {
        $match: {
          category: { $regex: new RegExp(`^${category}$`, 'i') },
          platformType: 'b2b'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },
      {
        $unwind: '$sellerInfo'
      },
      {
        $group: {
          _id: '$subcategory',
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              description: '$description',
              minPrice: '$minPrice',
              maxPrice: '$maxPrice',
              currentHighestBid: '$currentHighestBid',
              images: '$images',
              auctionEndDate: '$auctionEndDate',
              unitType: '$unitType',
              totalStock: '$stock',
              seller: {
                _id: '$sellerInfo._id',
                name: '$sellerInfo.firstname',
                city: '$sellerInfo.city'
              }
            }
          },
          totalProducts: { $sum: 1 },
          averageMinPrice: { $avg: '$minPrice' },
          averageMaxPrice: { $avg: '$maxPrice' }
        }
      },
      {
        $project: {
          subcategory: '$_id',
          products: 1,
          totalProducts: 1,
          priceRange: {
            min: { $round: ['$averageMinPrice', 2] },
            max: { $round: ['$averageMaxPrice', 2] }
          },
          _id: 0
        }
      },
      {
        $sort: { subcategory: 1 }
      }
    ]);

    if (!productsGroupedBySubcategory || productsGroupedBySubcategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: `इस श्रेणी में कोई B2B प्रोडक्ट नहीं मिला: ${category}`
      });
    }

    res.status(200).json({
      success: true,
      category,
      totalSubcategories: productsGroupedBySubcategory.length,
      totalProducts: productsGroupedBySubcategory.reduce((acc, curr) => acc + curr.totalProducts, 0),
      subcategories: productsGroupedBySubcategory
    });

  } catch (error) {
    console.error('Error in getB2BProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'श्रेणी के अनुसार B2B प्रोडक्ट प्राप्त करने में त्रुटि हुई',
      error: error.message
    });
  }
};

// Get B2B product by ID with detailed information
export const getB2BProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the B2B product and populate seller details
    const product = await Product.findOne({
      _id: id,
      platformType: 'b2b'
    }).populate('seller', 'firstname lastname shopName city state businessType profileImage createdAt');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2B प्रोडक्ट नहीं मिला'
      });
    }

    // Get current highest bidder details if exists
    let currentHighestBidder = null;
    if (product.currentHighestBidder) {
      const bidder = await Agency.findOne({
        _id: product.currentHighestBidder,
        userType: 'agency'
      }).select('agencyName city');
      
      if (bidder) {
        currentHighestBidder = {
          _id: bidder._id,
          agencyName: bidder.agencyName,
          city: bidder.city
        };
      }
    }

    // Get bid history with bidder details
    const bidHistory = await Bid.find({ product: id })
      .sort({ bidTime: -1 })
      .limit(5)
      .populate({
        path: 'bidder',
        model: 'agency',
        select: 'agencyName city'
      });

    // Get bid statistics
    const bidStats = await Bid.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          totalBids: { $sum: 1 },
          avgBid: { $avg: '$amount' },
          maxBid: { $max: '$amount' },
          minBid: { $min: '$amount' }
        }
      }
    ]);

    // Get similar products from same category
    const similarProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      platformType: 'b2b',
      auctionStatus: 'active'
    })
    .limit(5)
    .select('name images minPrice maxPrice currentHighestBid auctionEndDate');

    // Format the response
    const response = {
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        images: product.images,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
        currentHighestBid: product.currentHighestBid,
        auctionEndDate: product.auctionEndDate,
        auctionStatus: product.auctionStatus,
        unitType: product.unitType,
        totalStock: product.stock,
        negotiationEnabled: product.negotiationEnabled,
        createdAt: product.createdAt,
        unitPrice: product.unitPrice,
        seller: product.seller ? {
          _id: product.seller._id,
          name: `${product.seller.firstname} ${product.seller.lastname}`,
          shopName: product.seller.shopName,
          city: product.seller.city,
          state: product.seller.state,
          businessType: product.seller.businessType,
          profileImage: product.seller.profileImage,
          sellerSince: product.seller.createdAt
        } : null,
        currentHighestBidder
      },
      bidding: {
        bidHistory: bidHistory.map(bid => ({
          _id: bid._id,
          amount: bid.amount,
          bidTime: bid.bidTime,
          bidder: bid.bidder ? {
            _id: bid.bidder._id,
            agencyName: bid.bidder.agencyName,
            city: bid.bidder.city
          } : null
        })),
        stats: bidStats[0] || {
          totalBids: 0,
          avgBid: 0,
          maxBid: 0,
          minBid: 0
        }
      },
      similarProducts: similarProducts.map(prod => ({
        _id: prod._id,
        name: prod.name,
        images: prod.images,
        minPrice: prod.minPrice,
        maxPrice: prod.maxPrice,
        currentHighestBid: prod.currentHighestBid,
        auctionEndDate: prod.auctionEndDate
      }))
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in getB2BProductById:', error);
    res.status(500).json({
      success: false,
      message: 'प्रोडक्ट की जानकारी प्राप्त करने में त्रुटि हुई',
      error: error.message
    });
  }
};

// Get products by formatted category URL
export const getProductsByFormattedCategory = async (req, res) => {
    try {
        const { formattedCategory } = req.params;
        const { city } = req.query;

        console.log('Received request for:', { formattedCategory, city });

        if (!formattedCategory) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        // Convert formatted URL back to category name
        let category = formattedCategory
            .split('-')
            .map((word, index, array) => {
                // Special handling for 'and'
                if (word.toLowerCase() === 'and') return '&';
                
                // Capitalize first letter of each word
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');

        // Special handling for "Home-Made" category
        if (category.toLowerCase() === 'home made') {
            category = 'Home-Made';
        }

        console.log('Converted category name:', category);

        // Base query with case-insensitive regex for category
        let query = {
            $or: [
                // Exact match (case-insensitive)
                { category: { $regex: new RegExp(`^${category}$`, 'i') } },
                // Match with hyphen variation for "Home-Made"
                { category: { $regex: new RegExp(`^${category.replace(' ', '-')}$`, 'i') } },
                // Match with space variation for "Organic Vegetables & Fruits"
                { category: { $regex: new RegExp(`^${category.replace('&', ' & ')}$`, 'i') } }
            ],
            platformType: 'b2c',
            stock: { $gt: 0 }
        };

        // Add strict city filter if provided (case-insensitive)
        if (city) {
            const cityRegex = new RegExp(city, 'i');
            query.availableLocations = { $regex: cityRegex };
        }

        console.log('MongoDB Query:', JSON.stringify(query, null, 2));

        // First check if any products exist
        const productCount = await Product.countDocuments(query);
        console.log('Found products count:', productCount);

        if (productCount === 0) {
            // Try to find what categories and cities actually exist
            const existingCategories = await Product.distinct('category');
            const existingCities = await Product.distinct('availableLocations');
            console.log('Existing categories in DB:', existingCategories);
            console.log('Existing cities in DB:', existingCities);
            
            return res.status(404).json({
                success: false,
                message: `No products found for category: ${category}${city ? ` in ${city}` : ''}`,
                debug: {
                    searchedCategory: category,
                    searchedCity: city,
                    existingCategories: existingCategories,
                    existingCities: existingCities
                }
            });
        }

        // Fetch products and group by subcategory
        const products = await Product.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'sellerInfo'
                }
            },
            {
                $unwind: {
                    path: '$sellerInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$subcategory',
                    products: {
                        $push: {
                            _id: '$_id',
                            name: '$name',
                            description: '$description',
                            price: '$price',
                            images: '$images',
                            stock: '$stock',
                            rating: '$rating',
                            numReviews: '$numReviews',
                            unitSize: '$unitSize',
                            unitType: '$unitType',
                            availableLocations: '$availableLocations',
                            primaryLocation: '$primaryLocation',
                            seller: {
                                _id: '$sellerInfo._id',
                                firstname: '$sellerInfo.firstname',
                                lastname: '$sellerInfo.lastname',
                                city: '$sellerInfo.city'
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    subcategory: '$_id',
                    products: 1,
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { subcategory: 1 } }
        ]);

        console.log('Aggregation results:', JSON.stringify(products, null, 2));

        res.status(200).json({
            success: true,
            category,
            city: city || null,
            totalSubcategories: products.length,
            totalProducts: products.reduce((acc, curr) => acc + curr.count, 0),
            subcategories: products
        });

    } catch (error) {
        console.error('Error in getProductsByFormattedCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by formatted category',
            error: error.message
        });
    }
};

// Get most ordered products by category
export const getMostOrderedProductsByCategory = async (req, res) => {
  try {
    // First get all unique categories
    const categories = await Product.distinct('category');
    
    // For each category, find the product with most orders
    const mostOrderedProducts = await Promise.all(
      categories.map(async (category) => {
        const product = await Product.aggregate([
          // Match products in this category
          { $match: { category: category } },
          
          // Lookup orders for each product
          {
            $lookup: {
              from: 'orders',
              localField: '_id',
              foreignField: 'items.product',
              as: 'orders'
            }
          },
          
          // Calculate total orders for each product
          {
            $addFields: {
              totalOrders: { $size: '$orders' }
            }
          },
          
          // Sort by total orders (descending)
          { $sort: { totalOrders: -1 } },
          
          // Take only the first product (most ordered)
          { $limit: 1 },
          
          // Project only needed fields
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              price: 1,
              images: 1,
              category: 1,
              subcategory: 1,
              rating: 1,
              totalOrders: 1,
              seller: 1,
              stock: 1
            }
          }
        ]);

        return product[0] || null;
      })
    );

    // Filter out any null values and categories with no products
    const validProducts = mostOrderedProducts.filter(product => product !== null);

    res.status(200).json({
      success: true,
      products: validProducts
    });

  } catch (error) {
    console.error('Error in getMostOrderedProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching most ordered products',
      error: error.message
    });
  }
};

// Get most ordered product by specific category
export const getMostOrderedProductByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Find the most ordered product in this category
    const product = await Product.aggregate([
      // Match products in this specific category
      { 
        $match: { 
          category: { 
            $regex: new RegExp(`^${categoryName}$`, 'i') 
          } 
        } 
      },
      
      // Lookup orders for each product
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orders'
        }
      },
      
      // Lookup seller information
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },

      // Unwind seller array to object
      {
        $unwind: {
          path: '$sellerInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Calculate total orders for each product
      {
        $addFields: {
          totalOrders: { $size: '$orders' }
        }
      },
      
      // Sort by total orders (descending)
      { $sort: { totalOrders: -1 } },
      
      // Take only the first product (most ordered)
      { $limit: 1 },
      
      // Project only needed fields
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          images: 1,
          category: 1,
          subcategory: 1,
          rating: 1,
          totalOrders: 1,
          stock: 1,
          unitSize: 1,
          unitType: 1,
          seller: {
            _id: '$sellerInfo._id',
            name: {
              $concat: ['$sellerInfo.firstname', ' ', '$sellerInfo.lastname']
            },
            city: '$sellerInfo.city'
          }
        }
      }
    ]);

    if (!product || product.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found in category: ${categoryName}`
      });
    }

    res.status(200).json({
      success: true,
      product: product[0]
    });

  } catch (error) {
    console.error('Error in getMostOrderedProductByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching most ordered product',
      error: error.message
    });
  }
};

// Add this new controller function at the end before export default
export const getLimitedProductsByCategory = async (req, res) => {
  try {
    const { city } = req.query;
    const { category } = req.params;
    const PRODUCTS_PER_CATEGORY = 10;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }

    // Build query
    let query = {
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      platformType: 'b2c',
      stock: { $gt: 0 }
    };

    // Add city filter if provided
    if (city) {
      query.availableLocations = {
        $regex: new RegExp(city, 'i')
      };
    }

    // Get products for this category
    const products = await Product.aggregate([
      { $match: query },
      // Lookup seller information
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },
      // Unwind seller array
      {
        $unwind: {
          path: '$sellerInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      // Sort by rating and creation date
      {
        $sort: {
          rating: -1,
          createdAt: -1
        }
      },
      // Limit to 8 products
      { $limit: PRODUCTS_PER_CATEGORY },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          images: 1,
          stock: 1,
          rating: 1,
          numReviews: 1,
          unitSize: 1,
          unitType: 1,
          seller: {
            _id: '$sellerInfo._id',
            name: {
              $concat: ['$sellerInfo.firstname', ' ', '$sellerInfo.lastname']
            },
            city: '$sellerInfo.city'
          }
        }
      }
    ]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found for category: ${category}`
      });
    }

    res.status(200).json({
      success: true,
      category,
      totalProducts: products.length,
      products
    });

  } catch (error) {
    console.error('Error in getLimitedProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching limited products by category',
      error: error.message
    });
  }
};

// Get seller's B2B products filtered by status
export const getSellerB2BProductsByStatus = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { status } = req.query; // 'all', 'active', or 'closed'
    
    let query = {
      seller: sellerId,
      platformType: 'b2b'
    };

    // Add status filter if not 'all'
    if (status && status !== 'all') {
      query.auctionStatus = status;
    }

    const products = await Product.find(query)
      .select('name description minPrice maxPrice totalStock stock images auctionEndDate auctionStatus currentHighestBid currentHighestBidder createdAt')
      .populate('currentHighestBidder', 'agencyName email mobileno address city state pincode businessType')
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        message: status === 'active' 
          ? "कोई सक्रिय नीलामी नहीं मिली" 
          : status === 'closed' 
          ? "कोई बंद नीलामी नहीं मिली" 
          : "कोई उत्पाद नहीं मिला",
        data: []
      });
    }

    // Format the response data
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      totalStock: product.totalStock,
      stock: product.stock || product.totalStock,
      images: product.images,
      auctionEndDate: product.auctionEndDate,
      auctionStatus: product.auctionStatus,
      currentHighestBid: product.currentHighestBid,
      currentHighestBidder: product.currentHighestBidder ? {
        _id: product.currentHighestBidder._id,
        agencyName: product.currentHighestBidder.agencyName,
        email: product.currentHighestBidder.email,
        phone: product.currentHighestBidder.mobileno,
        address: product.currentHighestBidder.address,
        city: product.currentHighestBidder.city,
        state: product.currentHighestBidder.state,
        pincode: product.currentHighestBidder.pincode,
        businessType: product.currentHighestBidder.businessType
      } : null,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      success: true,
      message: "उत्पाद सफलतापूर्वक प्राप्त किए गए",
      data: formattedProducts,
      totalProducts: formattedProducts.length
    });

  } catch (error) {
    console.error('Error in getSellerB2BProductsByStatus:', error);
    res.status(500).json({
      success: false,
      message: "उत्पाद प्राप्त करने में त्रुटि हुई",
      error: error.message
    });
  }
};