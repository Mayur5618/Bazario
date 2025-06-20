import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInSetUp, SignInFailure, logout } from "../store/userSlice";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaUserCircle, FaHeart, FaSignOutAlt, FaUserEdit, FaHistory } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import '../styles/header.css';
import { addToRecentSearches, clearRecentSearches } from '../store/searchSlice';
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showRecentSearchesDropdown, setShowRecentSearchesDropdown] = useState(false);

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

  // Modify the useEffect for search
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          setIsSearching(true);
          setShowRecentSearchesDropdown(false); // Hide recent searches when typing
          const response = await axios.get(`/api/products?query=${searchTerm}`);
          setSearchResults(response.data.products.slice(0, 5));
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Add click outside handler for recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowRecentSearchesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation(); // Stop event propagation
    setIsMenuOpen(prevState => !prevState);
  };

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);
    if (action) {
      action();
    }
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
          {/* Top Row with Logo and Icons */}
          <div className="flex items-center justify-between">
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

              {/* Profile Button or Sign In/Up Buttons */}
              {userData ? (
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={toggleMenu}
                    className="relative focus:outline-none profile-button"
                  >
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
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="text-white hover:text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/30"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-50"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar for Mobile - Only show if user is logged in */}
          {userData && (
            <div className="w-full relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (!searchTerm.trim()) {
                      setShowRecentSearchesDropdown(true);
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full px-3 py-1.5 rounded-full bg-white text-sm"
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleSearch}
                >
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Recent Searches Dropdown - Mobile */}
              {showRecentSearchesDropdown && !searchTerm && recentSearches.length > 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">Recent Searches</div>
                  {recentSearches.map((term, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchTerm(term);
                        handleRecentSearchClick(term);
                        setShowRecentSearchesDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    >
                      <FaHistory className="h-3 w-3 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{term}</span>
                    </div>
                  ))}
                  <div 
                    className="px-4 py-2 text-xs text-red-500 hover:bg-gray-50 cursor-pointer border-t"
                    onClick={() => {
                      dispatch(clearRecentSearches());
                      setShowRecentSearchesDropdown(false);
                    }}
                  >
                    Clear Recent Searches
                  </div>
                </div>
              )}

              {/* Product Search Results - Mobile */}
              {searchTerm && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result._id}
                        onClick={() => handleSuggestionClick(result)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                      >
                        {/* Product Image */}
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={result.images[0]} 
                            alt={result.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                        </div>
                        {/* Product Details */}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium">{result.name}</p>
                          <p className="text-xs text-gray-500">₹{result.price}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
                  )}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (!searchTerm.trim()) {
                      setShowRecentSearchesDropdown(true);
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 rounded-full bg-white"
                />
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={handleSearch}
                >
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Recent Searches Dropdown - Desktop */}
              {showRecentSearchesDropdown && !searchTerm && recentSearches.length > 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div className="px-4 py-3 text-xs text-gray-500 border-b">Recent Searches</div>
                  {recentSearches.map((term, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchTerm(term);
                        handleRecentSearchClick(term);
                        setShowRecentSearchesDropdown(false);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                    >
                      <FaHistory className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{term}</span>
                    </div>
                  ))}
                  <div 
                    className="px-4 py-3 text-xs text-red-500 hover:bg-gray-50 cursor-pointer border-t"
                    onClick={() => {
                      dispatch(clearRecentSearches());
                      setShowRecentSearchesDropdown(false);
                    }}
                  >
                    Clear Recent Searches
                  </div>
                </div>
              )}

              {/* Product Search Results - Desktop */}
              {searchTerm && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result._id}
                        onClick={() => handleSuggestionClick(result)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-4"
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={result.images[0]} 
                            alt={result.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                        </div>
                        {/* Product Details */}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium">{result.name}</p>
                          <p className="text-sm text-gray-500">₹{result.price}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
                  )}
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
              {userData ? (
                <button
                  ref={buttonRef}
                  onClick={toggleMenu}
                  className="relative focus:outline-none profile-button"
                >
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
                </button>
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
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Profile Menu */}
      <AnimatePresence>
        {isMenuOpen && userData && window.innerWidth >= 640 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={menuRef}
            className="absolute right-44 top-20 w-48 bg-white rounded-lg shadow-lg py-2 z-50 hidden sm:block"
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

      {/* Mobile Profile Menu */}
      <AnimatePresence>
        {isMenuOpen && userData && window.innerWidth < 640 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={menuRef}
            className="fixed top-[6.1rem] right-2 w-40 bg-white rounded-lg shadow-lg py-1 z-[60] block sm:hidden"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-600">Signed in as</p>
              <p className="text-xs font-medium text-gray-800 truncate">
                {userData.firstname}
              </p>
            </div>

            <Link 
              to="/profile" 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => handleMenuClick(() => navigate('/profile'))}
            >
              <FaUserEdit className="text-gray-500 w-3 h-3" />
              <span>Profile</span>
            </Link>

            <Link 
              to="/wishlist" 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => handleMenuClick(() => navigate('/wishlist'))}
            >
              <FaHeart className="text-gray-500 w-3 h-3" />
              <span>Wishlist</span>
            </Link>

            <button 
              onClick={() => handleMenuClick(handleLogout)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-gray-50"
            >
              <FaSignOutAlt className="text-red-500 w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Menu Dropdown */}
      {isProfileMenuOpen && (
        <div 
          className="absolute right-2 sm:right-4 top-14 sm:top-12 w-64 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Signed in as</p>
            <p className="text-sm text-gray-600 truncate">{userData?.name || 'User'}</p>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;