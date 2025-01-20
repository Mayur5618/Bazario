import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/recentlyViewed.css';

const RecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

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

  const handleScroll = (direction) => {
    const container = document.getElementById('recently-viewed-container');
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Don't show section if no recently viewed products
  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="recently-viewed max-w-7xl mx-auto relative px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Recently Viewed Products</h2>
      
      <div className="relative">
        <div 
          id="recently-viewed-container"
          className="flex gap-6 overflow-x-hidden scroll-smooth"
        >
          {recentlyViewed.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="flex-none w-[220px] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-[180px] w-full overflow-hidden rounded-t-lg">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">₹{product.price}</p>
                    <p className="text-sm text-gray-500">per {product.unit}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="text-sm text-yellow-500">★ {product.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({product.reviews?.length || 0})</span>
                    </div>
                    <p className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentlyViewed.length > 3 && (
          <>
            <button
              onClick={() => handleScroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-md text-gray-600 z-10 transition-all"
            >
              <FaArrowLeft size={20} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-md text-gray-600 z-10 transition-all"
            >
              <FaArrowRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;
