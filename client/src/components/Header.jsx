import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInSetUp, SignInFailure, logout } from "../store/userSlice";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaUserCircle, FaHeart, FaSignOutAlt, FaUserEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
// import './styles/header.css';
import '../styles/header.css';
import { addToRecentSearches } from '../store/searchSlice';
import { AnimatePresence, motion } from "framer-motion";

const Header = () => {
  const { userData } = useSelector((state) => state.user);
  const { cart: cartCount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
  const recentSearches = useSelector((state) => state.search.recentSearches);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const showMenu = () => {
    clearTimeout(timeoutRef.current);
    setIsMenuOpen(true);
  };

  const hideMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 300); // Reduced to 300ms for better responsiveness
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Array of placeholder texts
  const placeholders = [
    "Search for vegetables...",
    "Find home-cooked meals...",
    "Discover traditional pickles...",
    "Explore seasonal foods...",
    "Search for organic products...",
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholders[0]);

  // Effect to rotate placeholders
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPlaceholder((current) => {
        const currentIndex = placeholders.indexOf(current);
        return placeholders[(currentIndex + 1) % placeholders.length];
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          setIsSearching(true);
          const response = await axios.get(`/api/products?query=${searchTerm}`);
          setSearchResults(response.data.products.slice(0, 5));
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(addToRecentSearches(searchTerm));
      navigate(`/all-products?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setSearchResults([]);
      setShowRecentSearches(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  // Inside your Header component, update the profile menu items:
  const menuItems = [
    // ... existing menu items ...
    {
      label: 'My Wishlist',
      icon: <FaHeart className="w-5 h-5" />,
      href: '/wishlist'
    },
    // ... rest of the menu items ...
  ];

  // Handle clicks outside of menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) && 
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (action) => {
    // Keep menu open for a short duration to allow for clicking
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 100);
    action();
  };

  // When clicking on a search suggestion
  const handleSuggestionClick = (product) => {
    dispatch(addToRecentSearches(product.name)); // Add to recent searches
    setSearchTerm("");
    setSearchResults([]);
    navigate(`/product/${product._id}`);
  };

  // Modified function to handle recent search item click
  const handleRecentSearchClick = async (term) => {
    try {
      setIsSearching(true);
      // First fetch the product that matches the search term
      const response = await axios.get(`/api/products?query=${term}`);
      
      if (response.data.products && response.data.products.length > 0) {
        // If product found, navigate directly to the first matching product
        const product = response.data.products[0];
        setSearchTerm("");
        setShowRecentSearches(false);
        navigate(`/product/${product._id}`);
      } else {
        // If no exact match, navigate to search results page
        navigate(`/all-products?query=${encodeURIComponent(term)}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to find product");
      navigate(`/all-products?query=${encodeURIComponent(term)}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="bg-[#3861fb] shadow-md">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Mobile Header */}
        <div className="flex flex-col sm:hidden w-full space-y-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-white text-lg font-bold">
              Bazario
            </Link>

            {/* Cart & Profile for Mobile */}
            <div className="flex items-center space-x-3">
              {userData && (
                <Link to="/cart" className="text-white hover:text-blue-200 relative">
                  <FaShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile Button */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative focus:outline-none profile-button"
                >
                  {userData ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                      {userData?.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            const fallback = e.target.parentNode.querySelector('.fallback-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center fallback-icon">
                          <FaUser className="text-gray-400 text-sm" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <FaUser className="text-white w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar for Mobile */}
          {userData && (
            <div className="w-full relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      setShowRecentSearches(false);
                    } else {
                      setShowRecentSearches(true);
                    }
                  }}
                  onFocus={() => {
                    if (!searchTerm) {
                      setShowRecentSearches(true);
                    }
                  }}
                  placeholder={currentPlaceholder}
                  className="w-full px-3 py-1.5 rounded-full bg-white text-sm"
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleSearch}
                >
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Search Results for Mobile */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleSuggestionClick(product)}
                    >
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded-md mr-2"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-500">₹{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-white text-xl font-bold">
            Bazario
          </Link>

          {/* Search Bar - Only show if user is logged in */}
          {userData && (
            <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      setShowRecentSearches(false);
                    } else {
                      setShowRecentSearches(true);
                    }
                  }}
                  onFocus={() => {
                    if (!searchTerm) {
                      setShowRecentSearches(true);
                    }
                  }}
                  placeholder={currentPlaceholder}
                  className="w-full px-4 py-2 rounded-full bg-white"
                />
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={handleSearch}
                >
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleSuggestionClick(product)}
                    >
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-sm text-gray-500">₹{product.price}</div>
                      </div>
                    </div>
                  ))}
                  <Link
                    to={`/all-products?query=${encodeURIComponent(searchTerm)}`}
                    className="block px-4 py-2 text-center text-blue-500 hover:bg-gray-50 border-t"
                    onClick={() => {
                      dispatch(addToRecentSearches(searchTerm)); // Add to recent searches
                      setSearchTerm("");
                      setSearchResults([]);
                    }}
                  >
                    See all results
                  </Link>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              )}
            </div>
          )}

          {/* Cart & Profile */}
          <div className="flex items-center space-x-4">
            {/* Only show cart if user is logged in */}
            {userData && (
              <Link to="/cart" className="text-white hover:text-blue-200 relative">
                <FaShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Section */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative focus:outline-none profile-button"
              >
                {userData ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    {userData?.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          const fallback = e.target.parentNode.querySelector('.fallback-icon');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center fallback-icon">
                        <FaUser className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link 
                      to="/login" 
                      className="text-white hover:text-blue-200 text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && userData && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={menuRef}
            className="absolute right-2 sm:right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {userData.firstname} {userData.lastname}
              </p>
            </div>

            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => handleMenuClick(() => navigate('/profile'))}
            >
              <FaUserEdit className="text-gray-500" />
              <span>Profile</span>
            </Link>

            <Link 
              to="/wishlist" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => handleMenuClick(() => navigate('/wishlist'))}
            >
              <FaHeart className="text-gray-500" />
              <span>Wishlist</span>
            </Link>

            <button 
              onClick={() => handleMenuClick(handleLogout)}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50"
            >
              <FaSignOutAlt className="text-red-500" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;