import React, { useState, useEffect } from 'react';
import Temp from './temp';
import ProductCatalog from './ProductCatalog';
import RecentlyViewed from './RecentlyViewed';
import { FaShieldAlt, FaTruck, FaUndo, FaHeadset, FaArrowRight, FaArrowLeft, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import CategoryProducts from './CategoryProducts';
import { useDispatch, useSelector } from 'react-redux';
import { setCartItems, clearCart } from '../store/cartSlice';
import axios from 'axios';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  // Fetch categories and their best rated product
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        if (response.data.success) {
          const uniqueCategories = response.data.categories;
          
          // For each category, fetch best rated product
          const categoriesWithData = await Promise.all(
            uniqueCategories.map(async (category) => {
              try {
                // First try to get best rated product
                const productsResponse = await axios.get('/api/products', {
                  params: {
                    category,
                    sort: 'rating',
                    limit: 1
                  }
                });

                if (productsResponse.data.success && productsResponse.data.products.length > 0) {
                  const product = productsResponse.data.products[0];
                  return {
                    id: category.toLowerCase().replace(/\s+/g, '-'),
                    title: category,
                    description: `Explore our ${category} collection`,
                    image: product.images[0] || '/placeholder-image.jpg',
                    color: getRandomGradient(),
                    slug: category.toLowerCase().replace(/\s+/g, '-'),
                    totalProducts: productsResponse.data.total,
                    featuredProduct: {
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      rating: product.rating,
                      reviews: product.reviews?.length || 0,
                      images: product.images
                    }
                  };
                }
                return null;
              } catch (err) {
                console.error(`Error fetching products for ${category}:`, err);
                return null;
              }
            })
          );

          // Filter out any null values and set categories
          setCategories(categoriesWithData.filter(cat => cat !== null));
        }
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Get random gradient for category backgrounds
  const getRandomGradient = () => {
    const gradients = [
      'from-blue-600 to-violet-600',
      'from-emerald-500 to-teal-700',
      'from-rose-500 to-pink-700',
      'from-amber-500 to-orange-700',
      'from-indigo-500 to-purple-700',
      'from-cyan-500 to-blue-700'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Add high quality background images for categories
  const getCategoryImage = (category) => {
    const placeholderImages = {
      'Home Made Food': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop',
      'Arts & Crafts': 'https://images.unsplash.com/photo-1629196911514-f5934acc6b21?q=80&w=2070&auto=format&fit=crop',
      'Cakes': 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=2070&auto=format&fit=crop',
      'Handicrafts': 'https://images.unsplash.com/photo-1528805639423-c9818ad54888?q=80&w=2070&auto=format&fit=crop',
      'Paintings': 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=2070&auto=format&fit=crop',
    };
    return placeholderImages[category] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop';
  };

  useEffect(() => {
    if (!isHovering && categories.length > 0) {
      const timer = setInterval(() => {
        setActiveCategory((prev) => (prev + 1) % categories.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovering, categories.length]);

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      try {
        dispatch(clearCart());
        
        if (userData) {
          const response = await axios.get("/api/cart/getCartItems", {
            withCredentials: true
          });
          
          if (response.data.success) {
            dispatch(setCartItems(response.data.cart.items));
          }
        }
      } catch (error) {
        console.error("Error initializing cart:", error);
        dispatch(clearCart());
      }
    };

    initializeCart();
  }, [userData, dispatch]);

  const handleViewProduct = (product) => {
    if (!userData) return; // Don't store if user is not logged in

    const viewedProducts = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const currentTime = new Date().getTime();
    const timeLimit = 7 * 24 * 60 * 60 * 1000;
  
    // Store or update user ID
    localStorage.setItem('recentlyViewedUserId', userData._id);

    const filteredProducts = viewedProducts.filter(p => (currentTime - p.timestamp) < timeLimit);
    const existingProductIndex = filteredProducts.findIndex(p => p._id === product._id);
  
    if (existingProductIndex !== -1) {
      filteredProducts.splice(existingProductIndex, 1);
    }
  
    filteredProducts.unshift({
      ...product,
      timestamp: currentTime
    });
  
    if (filteredProducts.length > 5) {
      filteredProducts.pop();
    }
  
    localStorage.setItem('recentlyViewed', JSON.stringify(filteredProducts));
    
    // Dispatch event to update RecentlyViewed component
    window.dispatchEvent(new Event('recentlyViewedUpdated'));

    // Navigate to product page
    window.location.href = `/product/${product._id}`;
  };

  const trustFeatures = [
    {
      icon: <FaShieldAlt className="text-4xl text-purple-600" />,
      title: "Secure Shopping",
      description: "100% secure payment processing"
    },
    {
      icon: <FaTruck className="text-4xl text-purple-600" />,
      title: "Fast Delivery",
      description: "Quick delivery to your doorstep"
    },
    {
      icon: <FaUndo className="text-4xl text-purple-600" />,
      title: "Easy Returns",
      description: "Hassle-free return policy"
    },
    {
      icon: <FaHeadset className="text-4xl text-purple-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    }
  ];

  const handleCategoryClick = (slug) => {
    // Convert slug to proper format
    const formattedSlug = slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/&/g, 'and');
    navigate(`/products/category/${formattedSlug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Dynamic Category Showcase */}
      {categories.length > 0 && (
        <div className="relative h-[30vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className={`relative h-full bg-gradient-to-r ${categories[activeCategory].color}`}>
                <div 
                  className="absolute inset-0 opacity-60 bg-center bg-cover transition-opacity duration-500"
                  style={{
                    backgroundImage: `url(${getCategoryImage(categories[activeCategory].title)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.7)'
                  }}
                />

                <div className="relative h-full max-w-7xl mx-auto px-4 py-2 sm:py-6 md:py-8 flex flex-row items-center justify-between">
                  <div className="w-1/2 text-left z-10">
                    <motion.h2
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4"
                    >
                      {categories[activeCategory].title}
                    </motion.h2>
                    <motion.p
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="hidden sm:block text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 md:px-0"
                    >
                      {categories[activeCategory].description}
                    </motion.p>
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-1.5 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2"
                      onClick={() => handleCategoryClick(categories[activeCategory].slug)}
                    >
                      Explore
                      <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>

                  {/* Featured Product Preview */}
                  {categories[activeCategory].featuredProduct && (
                    <motion.div 
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-1/2 flex justify-end z-10"
                    >
                      <Link 
                        to={`/product/${categories[activeCategory].featuredProduct._id}`}
                        className="w-[100px] h-[100px] sm:w-[220px] sm:h-[220px] md:w-[280px] md:h-[280px] lg:w-[300px] lg:h-[300px] rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow"
                      >
                        <img 
                          src={categories[activeCategory].featuredProduct.images[0]}
                          alt={categories[activeCategory].featuredProduct.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div 
            className="absolute bottom-1 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 md:space-x-3 bg-white/20 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full z-20"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  index === activeCategory 
                    ? 'bg-white w-4 sm:w-8' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setActiveCategory((prev) => (prev - 1 + categories.length) % categories.length)}
            className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1 sm:p-2 md:p-3 rounded-full text-white transition-all backdrop-blur-sm z-20"
          >
            <FaArrowLeft className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setActiveCategory((prev) => (prev + 1) % categories.length)}
            className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1 sm:p-2 md:p-3 rounded-full text-white transition-all backdrop-blur-sm z-20"
          >
            <FaArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}

      {/* Recently Viewed Section */}
      <div className="bg-purple-50 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <RecentlyViewed handleViewProduct={handleViewProduct} />
        </div>
      </div>

      {/* Dynamic Categories Grid */}
      {categories.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {categories.map((category, index) => (
            <motion.div
                key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
              onClick={() => handleCategoryClick(category.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCategoryClick(category.slug);
                }
              }}
            >
              <div className="aspect-w-3 aspect-h-4">
                <img
                  src={category.image}
                  alt={category.title}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 sm:p-6">
                <div className="w-full">
                  <h3 className="text-base sm:text-xl font-semibold text-white text-center">{category.title}</h3>
                </div>
              </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Category-wise Products Sections */}
      {categories.map((category) => (
        <div key={category.id} className="py-1">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-row justify-between items-center mb-2">
              <div>
                <h2 className="text-base font-semibold sm:text-2xl sm:font-bold text-gray-900">{category.title}</h2>
              </div>
              <Link 
                to={`/products/category/${category.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap flex items-center"
              >
                See All <FaArrowRight className="ml-1 w-3 h-3 sm:ml-2 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm mb-2">
              <CategoryProducts
                key={`${category.title}-${userData?.city}`}
                category={category.title}
                title=""
                description={category.description}
                city={userData?.city}
                hideViewAll={true}
                showFilters={false}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Featured Products Section */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm">
            <ProductCatalog />
          </div>
        </div>
      </div>

      {/* Trust Features Section */}
      <div className="bg-purple-50 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {trustFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-3 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl sm:text-4xl text-purple-600">
                  {feature.icon}
                </div>
                <h3 className="mt-2 sm:mt-4 text-sm sm:text-lg font-semibold text-purple-800">
                  {feature.title}
                </h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Guarantee Section */}
      <div className="bg-[#3B82F6] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Our Quality Guarantee</h2>
          <p className="text-base sm:text-lg">
            We ensure that every product meets the highest standards of quality. Your satisfaction is our top priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;