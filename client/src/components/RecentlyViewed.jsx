import React, { useEffect, useState, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/recentlyViewed.css';

const RecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const loadRecentlyViewed = () => {
    try {
      const currentTime = Date.now();
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      // Get and parse stored products
      const storedProducts = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

      // Filter out products older than a week
      const recentProducts = storedProducts.filter(product => {
        return (currentTime - product.timestamp) < ONE_WEEK;
      });

      // Update localStorage with filtered list
      if (recentProducts.length !== storedProducts.length) {
        localStorage.setItem('recentlyViewed', JSON.stringify(recentProducts));
      }

      setRecentlyViewed(recentProducts);
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
      setRecentlyViewed([]);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();

    // Listen for updates to recently viewed products
    window.addEventListener('recentlyViewedUpdated', loadRecentlyViewed);

    return () => {
      window.removeEventListener('recentlyViewedUpdated', loadRecentlyViewed);
    };
  }, []);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -1200 : 1200;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleProductClick = (product) => {
    // Updated navigation path to match your route structure
    navigate(`/product/${product._id}`);
    // If you need to refresh the page after navigation
    // window.location.href = `/product/${product._id}`;
  };

  // Don't show section if no recently viewed products
  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="py-4 bg-gradient-to-b from-purple-100/50 to-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="px-6">
          <h2 className="text-xl font-bold mb-3">Recently Viewed Products</h2>
        </div>
        
        <div className="relative px-2">
          {/* Navigation Buttons */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              scroll('left');
            }}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg transition-all"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* Products Slider */}
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-6"
          >
            {recentlyViewed.map((product) => (
              <div 
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="flex-none w-[220px] cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold">₹{product.price}</span>
                        <span className="text-xs text-gray-500">per {product.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            className={`w-3 h-3 ${
                              index < product.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({product.reviews?.length || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-auto">
                      <span className="text-green-600 font-medium">In Stock</span>
                      <span className="text-gray-500">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              scroll('right');
            }}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg transition-all"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;
