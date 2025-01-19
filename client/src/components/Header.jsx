import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInSetUp, SignInFailure } from "../store/userSlice";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaUserCircle, FaHeart } from "react-icons/fa";
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  const showMenu = () => {
    clearTimeout(timeoutRef.current);
    setIsProfileMenuOpen(true);
  };

  const hideMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 300); // Reduced to 300ms for better responsiveness
  };

  const handleMenuItemClick = () => {
    setIsProfileMenuOpen(false);
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

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/users/sign-out", {
        method: "POST",
      });

      if (res.ok) {
        localStorage.removeItem("token");
        dispatch(SignInSetUp());
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        const errorMessage = "Logout failed";
        dispatch(SignInFailure(errorMessage));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Signout error:", error);
      toast.error("An error occurred during logout");
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

  return (
    <header className="bg-[#3861fb] shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-white text-xl font-bold">
          Bazario
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Explore seasonal foods..."
              className="w-full px-4 py-2 rounded-full bg-white"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Cart & Profile */}
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="text-white hover:text-blue-200 relative group transition-all duration-300">
            <FaShoppingCart className="w-6 h-6 transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                               rounded-full w-5 h-5 flex items-center justify-center
                               font-medium shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="relative" 
               onMouseEnter={showMenu} 
               onMouseLeave={hideMenu}>
            <FaUserCircle className="w-8 h-8 text-white hover:text-blue-200 cursor-pointer 
                                   transition-colors duration-300 transform hover:scale-110" />
            {isProfileMenuOpen && (
              <div ref={menuRef}
                   className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl z-10
                            transform transition-all duration-200 origin-top-right
                            border border-gray-200 overflow-hidden">
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 
                             transition-colors duration-200 ease-in-out border-b border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  <FaUser className="w-4 h-4 mr-3 text-blue-500" />
                  <span>Profile</span>
                </Link>
                
                <Link 
                  to="/orders" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 
                             transition-colors duration-200 ease-in-out border-b border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Orders</span>
                </Link>
                
                <Link 
                  to="/wishlist" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 
                             transition-colors duration-200 ease-in-out border-b border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  <FaHeart className="w-4 h-4 mr-3 text-blue-500" />
                  <span>My Wishlist</span>
                </Link>
                
                <button 
                  onClick={() => {
                    handleMenuItemClick();
                    handleSignout();
                  }}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 
                             transition-colors duration-200 ease-in-out"
                >
                  <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-red-500">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
