import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInSetUp, SignInFailure } from "../store/userSlice";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaUserCircle, FaHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";

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
    clearTimeout(timeoutRef.current); // Clear any existing timeout
    setIsProfileMenuOpen(true);
  };

  const hideMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 500); // Hide after 3 seconds
  };

  const handleMouseEnterMenu = () => {
    clearTimeout(timeoutRef.current); // Clear timeout when hovering over the menu
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current); // Clean up timeout on unmount
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
    <header className="bg-white shadow-md sticky top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            FreshMart
          </Link>

          {/* Search Bar with Dropdown */}
          <div
            className="hidden md:flex items-center flex-1 max-w-md mx-6 relative"
            ref={searchRef}
          >
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={currentPlaceholder}
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                >
                  <FaSearch className="w-4 h-4" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
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
                        <div className="font-medium text-gray-800">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{product.price}
                        </div>
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
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600"
          >
            <FaBars className="w-6 h-6" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {userData ? (
              <>
                <Link
                  to="/cart"
                  className="text-gray-600 hover:text-blue-600 relative"
                >
                  <FaShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div 
                  className="relative"
                  onMouseEnter={showMenu}
                  onMouseLeave={hideMenu}
                >
                  <FaUserCircle className="w-8 h-8 text-gray-600 cursor-pointer" />
                  {isProfileMenuOpen && (
                    <div 
                      ref={menuRef} 
                      className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10"
                      onMouseEnter={handleMouseEnterMenu}
                      onMouseLeave={hideMenu}
                    >
                      <Link to="/profile"  className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">My Wishlist</Link>
                      <button 
                        onClick={handleSignout} 
                        className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <FaSearch className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {userData ? (
                <>
                  <Link
                    to="/cart"
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    <FaShoppingCart className="w-5 h-5 mr-2" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    <FaUser className="w-5 h-5 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    My Wishlist
                  </Link>
                  <button
                    onClick={handleSignout}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-blue-500 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
