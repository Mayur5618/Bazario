import React, { useState, useEffect } from 'react';
import Temp from './temp';
import ProductCatalog from './ProductCatalog';
import RecentlyViewed from './RecentlyViewed';
import { FaShieldAlt, FaTruck, FaUndo, FaHeadset, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const featuredCategories = [
    {
      title: "Fresh Vegetables",
      description: "Farm-fresh vegetables delivered daily",
      image: "https://i.pinimg.com/736x/1f/8d/cd/1f8dcd9fad685de5025213d4b846848b.jpg",
      color: "from-green-500 to-emerald-700",
      slug: 'vegetable'
    },
    {
      title: "Home-Cooked Meals",
      description: "Authentic homemade delicacies",
      image: "https://i.pinimg.com/736x/87/55/50/8755508c64ce14492a4f622ed29762a2.jpg",
      color: "from-orange-500 to-red-700",
      slug: 'home-cooked'
    },
    {
      title: "Traditional Pickles",
      description: "Handcrafted with love and tradition",
      image: "https://i.pinimg.com/736x/4c/6c/ba/4c6cbae47f19fb1a628624afc83d4406.jpg",
      color: "from-yellow-500 to-amber-700",
      slug: 'pickles'
    },
    {
      title: "Seasonal Specials",
      description: "Limited time seasonal offerings",
      image: "https://i.pinimg.com/736x/8b/62/58/8b62584beeeb75fe5db7efc1d3dd2545.jpg",
      color: "from-purple-500 to-indigo-700",
      slug: 'seasonal'
    }
  ];

  useEffect(() => {
    if (!isHovering) {
      const timer = setInterval(() => {
        setActiveCategory((prev) => (prev + 1) % featuredCategories.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovering]);

  const handleViewProduct = (product) => {
    const viewedProducts = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const currentTime = new Date().getTime();
    const timeLimit = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
    // Remove products older than 7 days
    const filteredProducts = viewedProducts.filter(p => (currentTime - p.timestamp) < timeLimit);
  
    // Check if the product is already in the recently viewed list
    const existingProductIndex = filteredProducts.findIndex(p => p._id === product._id);
  
    if (existingProductIndex !== -1) {
      // If it exists, remove it and add it to the front
      filteredProducts.splice(existingProductIndex, 1);
    }
  
    // Add the new product with a timestamp
    filteredProducts.unshift({
      ...product,
      timestamp: currentTime // Store the current timestamp
    });
  
    // Limit the number of products to a maximum of 5
    if (filteredProducts.length > 5) {
      filteredProducts.pop(); // Remove the oldest product
    }
  
    localStorage.setItem('recentlyViewed', JSON.stringify(filteredProducts));
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
    console.log('Navigating to:', `/products/${slug}`);
    navigate(`/products/${slug}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Modern Category Showcase - Reduced height */}
      <div className="relative h-[50vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className={`relative h-full bg-gradient-to-r ${featuredCategories[activeCategory].color}`}>
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(${featuredCategories[activeCategory].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Content - Adjusted spacing */}
              <div className="relative h-full max-w-7xl mx-auto px-4 py-8 flex items-center">
                <div className="w-1/2">
                  <motion.h2
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                  >
                    {featuredCategories[activeCategory].title}
                  </motion.h2>
                  <motion.p
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/90 mb-6"
                  >
                    {featuredCategories[activeCategory].description}
                  </motion.p>
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all"
                    onClick={() => handleCategoryClick(featuredCategories[activeCategory].slug)}
                  >
                    Explore Collection
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Category Navigation - Adjusted position */}
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {featuredCategories.map((_, index) => (
            <button
              key={index}
              
              onClick={() => setActiveCategory(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeCategory 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              
            />
          ))}
        </div>

        {/* Navigation Arrows - Adjusted size */}
        <button
          onClick={() => setActiveCategory((prev) => (prev - 1 + featuredCategories.length) % featuredCategories.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all"
        >
          <FaArrowLeft size={20} />
        </button>
        <button
          onClick={() => setActiveCategory((prev) => (prev + 1) % featuredCategories.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all"
        >
          <FaArrowRight size={20} />
        </button>
      </div>

      {/* Recently Viewed Section - Moved here */}
      <div className="bg-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <RecentlyViewed handleViewProduct={handleViewProduct} />
        </div>
      </div>

      {/* Featured Products Grid - Adjusted spacing */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category, index) => (
            <motion.div
              key={index}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Features Section */}
      <div className="bg-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {feature.icon}
                <h3 className="mt-4 text-lg font-semibold text-purple-800">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">
            Featured Products
          </h2>
          <ProductCatalog />
        </div>
      </div>

      {/* Recently Viewed Section with updated styling */}
     

     
    </div>
  );
};

export default Home;