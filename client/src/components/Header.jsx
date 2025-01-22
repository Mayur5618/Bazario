import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInSetUp, SignInFailure } from "../store/userSlice";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaUserCircle, FaHeart, FaSignOutAlt, FaUserEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
// import './styles/header.css';
import '../styles/header.css';

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

  // Click outside handler for search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      navigate(`/all-products?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    dispatch(SignInSetUp());
    toast.success('Logged out successfully');
    navigate('/login');
    setIsMenuOpen(false);
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

  return (
    <header className="bg-[#3861fb] shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-white text-xl font-bold">
          Bazario
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Explore seasonal foods..."
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
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
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
                </Link>
              ))}
              <Link
                to={`/all-products?query=${encodeURIComponent(searchTerm)}`}
                className="block px-4 py-2 text-center text-blue-500 hover:bg-gray-50 border-t"
                onClick={() => {
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

        {/* Cart & Profile */}
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="text-white hover:text-blue-200 relative">
            <FaShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
              >
                {userData ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => handleMenuClick(() => navigate('/login'))}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => handleMenuClick(() => navigate('/register'))}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;