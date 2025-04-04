import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaStar, FaBox, FaShoppingBag, FaStore } from "react-icons/fa";
import { motion } from "framer-motion";

// Add animation variants
const productCardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const SellerAccount = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/users/sellers/${sellerId}`);
        if (response.data.success) {
          const { seller, categorizedProducts } = response.data;
          setSeller(seller);
          setCategorizedProducts(categorizedProducts);

          // Generate tabs from categories
          const generatedTabs = ["all"];
          
          // Add category tabs
          if (categorizedProducts.byCategory) {
            Object.keys(categorizedProducts.byCategory).forEach(category => {
              if (categorizedProducts.byCategory[category].length > 0) {
                generatedTabs.push(`category_${category}`);
              }
            });
          }

          // Add subcategory tabs
          if (categorizedProducts.bySubCategory) {
            Object.keys(categorizedProducts.bySubCategory).forEach(subCategory => {
              if (categorizedProducts.bySubCategory[subCategory].length > 0) {
                generatedTabs.push(`subcategory_${subCategory}`);
              }
            });
          }

          setTabs(generatedTabs);
          setActiveTab("all");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch seller data");
        toast.error("Failed to load seller profile");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  // Function to get products based on active tab
  const getFilteredProducts = () => {
    if (!categorizedProducts) return [];

    if (activeTab === "all") {
      return categorizedProducts.all || [];
    }

    const [type, category] = activeTab.split('_');
    
    if (type === "category" && categorizedProducts.byCategory) {
      return categorizedProducts.byCategory[category] || [];
    }

    if (type === "subcategory" && categorizedProducts.bySubCategory) {
      return categorizedProducts.bySubCategory[category] || [];
    }

    return [];
  };

  // Function to format tab label
  const getTabLabel = (tabId) => {
    if (tabId === "all") return "All Products";

    const [type, category] = tabId.split('_');
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Error: {error}
    </div>
  );

  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center">
      Seller not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seller Header */}
      <div className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img
                src={seller.profileImage}
            alt={`${seller.firstname} ${seller.lastname}`}
                className="w-full h-full object-cover"
          />
        </div>

            {/* Seller Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {seller.shopName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
            {seller.firstname} {seller.lastname}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-4 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <FaStore className="text-blue-500" />
                  <span>{seller.businessType === 'other' ? 'Business' : seller.businessType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBox className="text-green-500" />
                  <span>{seller.stats.totalProducts} Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span>{seller.stats.averageRating} ({seller.stats.totalReviews} reviews)</span>
                </div>
              </div>

              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Mobile:</span> {seller.mobileno}</p>
                <p><span className="font-medium">Address:</span> {seller.address}</p>
                <p><span className="font-medium">Location:</span> {seller.city}, {seller.state} - {seller.pincode}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

      {/* Navigation Tabs */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 relative whitespace-nowrap ${
                  activeTab === tab
                    ? "text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {getTabLabel(tab)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {getFilteredProducts().map((product) => (
            <motion.div
              key={product._id}
              variants={productCardVariants}
              whileHover="hover"
              className="cursor-pointer w-full"
            >
              <Link 
                to={`/product/${product._id}`}
                className="block h-full"
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                  <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
              <img
                src={product.images[0]}
                alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 sm:p-3 flex flex-col flex-grow">
                    <h3 className="text-[11px] sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <div className="flex items-baseline gap-0.5 sm:gap-1">
                        <span className="text-xs sm:text-base font-bold">₹{product.price}</span>
                        <span className="text-[8px] sm:text-xs text-gray-500">per {product.unitType || 'piece'}</span>
              </div>
            </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            className={`w-2 h-2 sm:w-3 sm:h-3 ${
                              index < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] sm:text-xs text-gray-600">
                        ({product.numReviews || 0})
                  </span>
                </div>
                    <div className="flex items-center justify-between text-[8px] sm:text-xs">
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="text-gray-500">Stock: {product.stock}</span>
                    </div>
              </div>
    </div>
    </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SellerAccount;
