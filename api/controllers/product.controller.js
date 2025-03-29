import express from 'express';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';
import { uploadToFirebase } from '../utilities/firebase.js';
import Seller from '../models/seller.model.js';

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
            availableLocations
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
            ...(productPlatformType.includes('b2b') && {
                minOrderQuantity,
                maxOrderQuantity: maxOrderQuantity || null
            }),
            ...(productPlatformType.includes('b2c') && {
                unitSize: Number(unitSize) || 1,
                unitType
            }),
            subUnitPrices: subUnitPrices || {}
        };

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
            category, 
            subcategory, 
            minPrice, 
            maxPrice, 
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            platformType,
            buyerCity
        } = req.query;

        console.log('Received query params:', { category, buyerCity }); // Debug log

        const query = {};

        // Add category filter if provided (case-insensitive)
        if (category && category !== 'undefined' && category !== 'null') {
            query.category = { 
                $regex: new RegExp(`^${category}$`, 'i')
            };
            console.log('Added category filter:', query.category);
        }

        // Add subcategory filter if provided (case-insensitive)
        if (subcategory && subcategory !== 'undefined' && subcategory !== 'null') {
            query.subcategory = { 
                $regex: new RegExp(`^${subcategory}$`, 'i')
            };
        }

        // Add price range filter if provided
        if ((minPrice && minPrice !== 'undefined') || (maxPrice && maxPrice !== 'undefined')) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Add platform type filter if provided
        if (platformType && platformType !== 'undefined' && platformType !== 'null') {
            query.platformType = platformType;
        }

        // Add search filter if provided (case-insensitive)
        if (search && search !== 'undefined' && search !== 'null') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Add city-based filtering if buyer's city is provided (case-insensitive)
        if (buyerCity && buyerCity !== 'undefined' && buyerCity !== 'null') {
            query.availableLocations = { 
                $elemMatch: { 
                    $regex: new RegExp(buyerCity, 'i') 
                }
            };
            console.log('Added city filter:', query.availableLocations);
        }

        console.log('Final query:', JSON.stringify(query, null, 2));

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('seller', 'name email city userType');

        console.log(`Found ${products.length} products`);

        // Get total count for pagination
        const total = await Product.countDocuments(query);

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
        const categories = await Product.distinct('category');
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

        // Get city from user's address
        const city = req.user?.address?.city || '';

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

export default router;