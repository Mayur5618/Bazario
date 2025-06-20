import Bid from '../models/bid.model.js';
import Product from '../models/product.model.js';

// Place a new bid
export const placeBid = async (req, res) => {
    try {
        const { productId, amount, agencyId } = req.body;

        // Validate bid amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'बोली की राशि मान्य नहीं है'
            });
        }

        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'प्रोडक्ट नहीं मिला'
            });
        }

        // Check if auction is still active
        if (new Date() > new Date(product.auctionEndDate)) {
            return res.status(400).json({
                success: false,
                message: 'नीलामी समाप्त हो चुकी है'
            });
        }

        // Check if bid amount is higher than current highest bid
        if (amount <= product.currentHighestBid) {
            return res.status(400).json({
                success: false,
                message: `बोली वर्तमान उच्चतम बोली (₹${product.currentHighestBid}) से अधिक होनी चाहिए`
            });
        }

        // If this is the first bid, check against minPrice
        if (product.currentHighestBid === 0 && amount < product.minPrice) {
            return res.status(400).json({
                success: false,
                message: `बोली न्यूनतम मूल्य (₹${product.minPrice}) से अधिक होनी चाहिए`
            });
        }

        // Create new bid
        const newBid = new Bid({
            product: productId,
            bidder: agencyId,
            amount: amount
        });

        // Save bid and update product
        await newBid.save();
        
        // Update product's current highest bid
        await Product.findByIdAndUpdate(productId, {
            currentHighestBid: amount,
            currentHighestBidder: agencyId
        });

        // Get bid history for the product
        const bidHistory = await Bid.find({ product: productId })
            .sort({ bidTime: -1 })
            .limit(5);

        // Get total bids count
        const totalBids = await Bid.countDocuments({ product: productId });

        res.status(201).json({
            success: true,
            message: 'बोली सफलतापूर्वक लगाई गई',
            bids: [newBid, ...bidHistory],
            pagination: {
                currentPage: 1,
                totalPages: Math.ceil(totalBids / 5),
                totalBids
            }
        });

    } catch (error) {
        console.error('Error in placeBid:', error);
        res.status(500).json({
            success: false,
            message: 'बोली लगाने में त्रुटि हुई',
            error: error.message
        });
    }
};

// Get bid history for a product
export const getBidHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit = 10, page = 1 } = req.query;

        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'प्रोडक्ट नहीं मिला'
            });
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bid history
        const bidHistory = await Bid.find({ product: productId })
            .sort({ bidTime: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('bidder', 'agencyName');

        // Get total bids count
        const totalBids = await Bid.countDocuments({ product: productId });

        // Calculate bid statistics
        const stats = await Bid.aggregate([
            { $match: { product: product._id } },
            {
                $group: {
                    _id: null,
                    avgBid: { $avg: '$amount' },
                    maxBid: { $max: '$amount' },
                    minBid: { $min: '$amount' },
                    totalBids: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            bidHistory,
            currentHighestBid: product.currentHighestBid,
            currentHighestBidder: product.currentHighestBidder,
            stats: stats[0] || {
                avgBid: 0,
                maxBid: 0,
                minBid: 0,
                totalBids: 0
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalBids / parseInt(limit)),
                totalBids
            }
        });

    } catch (error) {
        console.error('Error in getBidHistory:', error);
        res.status(500).json({
            success: false,
            message: 'बोली इतिहास प्राप्त करने में त्रुटि हुई',
            error: error.message
        });
    }
};

// Get my bids (for agency)
export const getMyBids = async (req, res) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;
        const bidderId = req.user._id;

        // Build query
        const query = { bidder: bidderId };
        if (status) {
            query.status = status;
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bids
        const bids = await Bid.find(query)
            .sort({ bidTime: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'product',
                select: 'name images minPrice maxPrice auctionEndDate currentHighestBid'
            });

        // Get total bids count
        const totalBids = await Bid.countDocuments(query);

        res.status(200).json({
            success: true,
            bids,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalBids / parseInt(limit)),
                totalBids
            }
        });

    } catch (error) {
        console.error('Error in getMyBids:', error);
        res.status(500).json({
            success: false,
            message: 'बोलियां प्राप्त करने में त्रुटि हुई',
            error: error.message
        });
    }
};

// Get highest bidder for a product
export const getHighestBidder = async (req, res) => {
    try {
        const { productId } = req.params;

        // Get product details with highest bidder info
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'प्रोडक्ट नहीं मिला'
            });
        }

        // Get the latest bid for this product
        const latestBid = await Bid.findOne({ product: productId })
            .sort({ bidTime: -1 })
            .populate('bidder', '_id agencyName email phone address city state');

        // If no bids yet
        if (!latestBid) {
            return res.status(200).json({
                success: true,
                message: 'अभी तक कोई बोली नहीं लगी है',
                data: {
                    currentHighestBid: 0,
                    currentHighestBidder: null,
                    currentHighestBidderId: null
                }
            });
        }

        // Return highest bidder info
        res.status(200).json({
            success: true,
            data: {
                currentHighestBid: latestBid.amount,
                currentHighestBidder: {
                    _id: latestBid.bidder._id,
                    agencyName: latestBid.bidder.agencyName,
                    email: latestBid.bidder.email,
                    phone: latestBid.bidder.phone,
                    address: latestBid.bidder.address,
                    city: latestBid.bidder.city,
                    state: latestBid.bidder.state
                },
                bidTime: latestBid.bidTime
            }
        });

    } catch (error) {
        console.error('Error in getHighestBidder:', error);
        res.status(500).json({
            success: false,
            message: 'उच्चतम बोलीदाता की जानकारी प्राप्त करने में त्रुटि हुई',
            error: error.message
        });
    }
};

// Get agency's active bid products
export const getAgencyActiveBids = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Get all bids by this agency
    const bids = await Bid.find({ bidder: agencyId })
      .populate({
        path: 'product',
        select: 'name images currentPrice currentHighestBidder auctionEndDate auctionStatus stock unitType currentHighestBid quantity'
      })
      .sort({ createdAt: -1 });

    // Filter and format the response
    const currentTime = new Date();
    const activeBidProducts = bids
      .filter(bid => {
        const product = bid.product;
        // Add null check for product
        return product && product.auctionStatus === 'active' && new Date(product.auctionEndDate) > currentTime;
      })
      .reduce((acc, bid) => {
        // Only add product if not already added (get unique products)
        if (!bid.product) return acc; // Skip if product is null
        
        const existingProduct = acc.find(p => p.productId.toString() === bid.product._id.toString());
        if (!existingProduct) {
          acc.push({
            productId: bid.product._id,
            name: bid.product.name,
            image: bid.product.images?.[0] || '', // Add optional chaining
            currentHighestBid: bid.product.currentHighestBid || 0,
            isHighestBidder: bid.product.currentHighestBidder?.toString() === agencyId,
            myLastBid: bid.amount,
            auctionEndDate: bid.product.auctionEndDate,
            stock: bid.product.quantity || bid.product.stock || 0, // Try both quantity and stock fields
            unitType: bid.product.unitType || 'kg'
          });
        }
        return acc;
      }, []);

    res.status(200).json({
      success: true,
      message: 'Successfully retrieved active bid products',
      products: activeBidProducts
    });

  } catch (error) {
    console.error('Error in getAgencyActiveBids:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active bid products',
      error: error.message
    });
  }
};

// Get active auctions count and details (public)
export const getActiveAuctions = async (req, res) => {
    try {
        const { agencyId } = req.query;

        // Get all active auctions
        const currentDate = new Date();
        const activeAuctions = await Product.find({
            auctionEndDate: { $gt: currentDate },
            auctionStatus: 'active'
        }).select('name images currentHighestBid currentHighestBidder auctionEndDate stock unitType');

        // If agencyId is provided, get their last bids
        if (agencyId) {
            const auctionsWithBids = await Promise.all(activeAuctions.map(async (auction) => {
                // Get agency's last bid for this auction
                const lastBid = await Bid.findOne({
                    product: auction._id,
                    bidder: agencyId
                }).sort({ bidTime: -1 });

                // Check if this agency is the highest bidder
                const isHighestBidder = auction.currentHighestBidder && 
                    auction.currentHighestBidder.toString() === agencyId.toString();

                return {
                    _id: auction._id,
                    name: auction.name,
                    image: auction.images[0],
                    stock: auction.stock || 0,
                    unitType: auction.unitType || 'kg',
                    currentHighestBid: auction.currentHighestBid || 0,
                    auctionEndDate: auction.auctionEndDate,
                    myLastBid: lastBid ? lastBid.amount : 0,
                    isHighestBidder: isHighestBidder
                };
            }));

            return res.status(200).json({
                success: true,
                auctions: auctionsWithBids
            });
        }

        // If no agencyId, return auctions without bid info
        res.status(200).json({
            success: true,
            auctions: activeAuctions.map(auction => ({
                _id: auction._id,
                name: auction.name,
                image: auction.images[0],
                stock: auction.stock || 0,
                unitType: auction.unitType || 'kg',
                currentHighestBid: auction.currentHighestBid || 0,
                auctionEndDate: auction.auctionEndDate
            }))
        });

    } catch (error) {
        console.error('Error in getActiveAuctions:', error);
        res.status(500).json({
            success: false,
            message: 'सक्रिय नीलामियां प्राप्त करने में त्रुटि हुई',
            error: error.message
        });
    }
};

export const getActiveAuctionsProducts = async (req, res) => {
    try {
        const currentTime = new Date();
        const { agencyId } = req.params; // Get agencyId from URL params

        // Find all products with active auctions
        const activeProducts = await Product.find({
            auctionStatus: 'active',
            auctionEndDate: { $gt: currentTime }
        }).select('name category subcategory images currentHighestBid currentHighestBidder auctionEndDate seller');

        // Get total bids and bid changes for each active auction
        const productsWithDetails = await Promise.all(
            activeProducts.map(async (product) => {
                // Get total bids for this product
                const totalBids = await Bid.countDocuments({ product: product._id });

                // Get the last two bids to calculate bid change
                const lastTwoBids = await Bid.find({ product: product._id })
                    .sort({ bidTime: -1 })
                    .limit(2);

                // Get agency's last bid for this product
                const agencyLastBid = await Bid.findOne({
                    product: product._id,
                    bidder: agencyId
                }).sort({ bidTime: -1 });

                // Calculate bid change
                let bidChange = 0;
                if (lastTwoBids.length >= 2) {
                    bidChange = lastTwoBids[0].amount - lastTwoBids[1].amount;
                }

                return {
                    _id: product._id,
                    name: product.name,
                    category: product.category,
                    subcategory: product.subcategory,
                    images: product.images,
                    seller: product.seller,
                    auctionEndDate: product.auctionEndDate,
                    currentHighestBid: product.currentHighestBid,
                    totalBids: totalBids,
                    isCurrentAgencyHighestBidder: product.currentHighestBidder && 
                        product.currentHighestBidder.toString() === agencyId.toString(),
                    bidChange: bidChange,
                    yourLastBid: agencyLastBid ? agencyLastBid.amount : 0
                };
            })
        );

        // Sort products:
        // 1. Products where agency is highest bidder first
        // 2. Products where agency has placed bids
        // 3. Products with no bids from agency
        const sortedProducts = productsWithDetails.sort((a, b) => {
            // First priority: Agency is highest bidder
            if (a.isCurrentAgencyHighestBidder && !b.isCurrentAgencyHighestBidder) return -1;
            if (!a.isCurrentAgencyHighestBidder && b.isCurrentAgencyHighestBidder) return 1;
            
            // Second priority: Agency has placed bids
            if (a.yourLastBid > 0 && b.yourLastBid === 0) return -1;
            if (a.yourLastBid === 0 && b.yourLastBid > 0) return 1;
            
            // Third priority: Sort by highest bid amount for products with agency bids
            if (a.yourLastBid > 0 && b.yourLastBid > 0) {
                return b.yourLastBid - a.yourLastBid;
            }
            
            // Finally, sort remaining products by current highest bid
            return b.currentHighestBid - a.currentHighestBid;
        });

        res.status(200).json({
            success: true,
            totalActiveAuctions: activeProducts.length,
            activeAuctions: sortedProducts,
            message: 'सक्रिय नीलामियां सफलतापूर्वक प्राप्त हुईं'
        });

    } catch (error) {
        console.error('Error in getActiveAuctions:', error);
        res.status(500).json({
            success: false,
            message: 'नीलामियां प्राप्त करने में त्रुटि हुई',
            error: error.message
        });
    }
};

export const getCategoryWiseAuctions = async (req, res) => {
    try {
        const { agencyId } = req.params;
        
        // Calculate date 1 month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Get all B2B products from last month
        const products = await Product.find({
            platformType: 'b2b',
            createdAt: { $gte: oneMonthAgo }
        }).populate('seller', 'name');

        // Get all bids by this agency
        const agencyBids = await Bid.find({
            bidder: agencyId,
            bidTime: { $gte: oneMonthAgo }
        });

        // Create a map of product IDs to agency's bids
        const agencyBidsMap = new Map();
        agencyBids.forEach(bid => {
            agencyBidsMap.set(bid.product.toString(), bid);
        });

        // Calculate total auctions count
        const totalAuctions = await Product.countDocuments({
            platformType: 'b2b'
        });

        // Process and categorize products
        const categorizedProducts = {
            won: [],
            closed: [],
            active: [],
            totalAuctions: totalAuctions
        };

        // Group products by category
        const categoryGroups = {};

        for (const product of products) {
            const currentTime = new Date();
            const isActive = product.auctionStatus === 'active' && new Date(product.auctionEndDate) > currentTime;
            const isWon = !isActive && product.currentHighestBidder?.toString() === agencyId;
            const hasAgencyBid = agencyBidsMap.has(product._id.toString());

            // Create category if it doesn't exist
            if (!categoryGroups[product.category]) {
                categoryGroups[product.category] = {
                    won: [],
                    closed: [],
                    active: []
                };
            }

            const productData = {
                _id: product._id,
                name: product.name,
                category: product.category,
                subcategory: product.subcategory,
                images: product.images,
                currentHighestBid: product.currentHighestBid || 0,
                stock: product.stock || 0,
                unitType: product.unitType || 'kg',
                auctionEndDate: product.auctionEndDate,
                seller: product.seller,
                yourLastBid: hasAgencyBid ? agencyBidsMap.get(product._id.toString()).amount : 0
            };

            // Categorize the product
            if (isWon) {
                categorizedProducts.won.push(productData);
                categoryGroups[product.category].won.push(productData);
            } else if (!isActive) {
                categorizedProducts.closed.push(productData);
                categoryGroups[product.category].closed.push(productData);
            } else {
                categorizedProducts.active.push(productData);
                categoryGroups[product.category].active.push(productData);
            }
        }

        // Sort products within each category
        Object.values(categoryGroups).forEach(category => {
            // Sort won products by auction end date
            category.won.sort((a, b) => new Date(b.auctionEndDate) - new Date(a.auctionEndDate));
            
            // Sort closed products - prioritize those with agency bids
            category.closed.sort((a, b) => {
                if (a.yourLastBid && !b.yourLastBid) return -1;
                if (!a.yourLastBid && b.yourLastBid) return 1;
                return new Date(b.auctionEndDate) - new Date(a.auctionEndDate);
            });
            
            // Sort active products - prioritize those with agency bids
            category.active.sort((a, b) => {
                if (a.yourLastBid && !b.yourLastBid) return -1;
                if (!a.yourLastBid && b.yourLastBid) return 1;
                return new Date(a.auctionEndDate) - new Date(b.auctionEndDate);
            });
        });

        res.status(200).json({
            success: true,
            message: 'Category-wise auctions retrieved successfully',
            data: {
                totalAuctions: totalAuctions,
                categorySummary: {
                    won: categorizedProducts.won.length,
                    closed: categorizedProducts.closed.length,
                    active: categorizedProducts.active.length
                },
                categoryGroups: categoryGroups
            }
        });

    } catch (error) {
        console.error('Error in getCategoryWiseAuctions:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving category-wise auctions',
            error: error.message
        });
    }
};



