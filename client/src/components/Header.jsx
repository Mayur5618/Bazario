// // components/layout/Header.jsx
// import React, { useRef, useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// // import React, { useEffect, useState } from 'react';
// // import { Link, useLocation } from 'react-router-dom';
// // import { motion } from 'framer-motion';
// import { useDispatch, useSelector } from "react-redux";
// import { SignOut } from "../store/userSlice";
// import { FaSearch, FaShoppingCart } from "react-icons/fa";
// // // import { themeToggle } from '../redux/theme/themeSlice';
// // // import { cartSetUp } from '../redux/cart/cartSlice';
// // import { FaMoon, FaShoppingCart, FaSun } from "react-icons/fa";
// // import { SignOut } from "../store/user/userSlice.js";
// import { AiOutlineSearch } from "react-icons/ai";
// import { TextInput, Button } from "flowbite-react";
// // import { useCart } from "../context/CartContext";
// import { useCart } from './context/CartContext';
// import { useAuth } from './context/AuthContext';

// const Header = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const location = useLocation();
//   const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
//   const userProfilePhoto = useSelector((state) => state.user.profilePhoto);
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const menuRef = useRef(null); // Create a ref for the menu
//   const dispatch = useDispatch();
//   const isActive = (path) => location.pathname === path;
//   const { getCartCount } = useCart();
//   const { user ,logout} = useAuth();
//   const { cart } = useCart();
//   const navigate = useNavigate();

//   const handleSignOut = () => {
//     dispatch(SignOut());
//     localStorage.removeItem("token");
//   };

//   const NavLink = ({ to, children }) => (
//     <Link
//       to={to}
//       className="relative text-gray-600 hover:text-primary-600 px-3 py-2 text-base font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary-600 after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-left hover:after:scale-x-100"
//     >
//       {children}
//     </Link>
//   );

//   const AuthButton = ({ to, children }) => (
//     <Link
//       to={to}
//       className="px-5 py-2.5 relative rounded group overflow-hidden font-medium bg-gray-50 text-gray-800 inline-block"
//     >
//       <span className="absolute bottom-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-full bg-gray-900 group-hover:h-full opacity-90"></span>
//       <span className="relative group-hover:text-white">{children}</span>
//     </Link>
//   );

//   // Add this function to handle link clicks
//   const handleLinkClick = () => {
//     setIsOpen(false); // Close the menu when a link is clicked
//   };

//   const handleProfileMenuToggle = () => {
//     setIsProfileMenuOpen((prev) => !prev); // Toggle menu on click
//   };

//   const handleMenuOptionClick = () => {
//     setIsProfileMenuOpen(false); // Close menu after selecting an option
//   };

//   // Effect to handle clicks outside the menu
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setIsProfileMenuOpen(false); // Close menu if clicked outside
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     setIsProfileMenuOpen(false);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     setIsProfileMenuOpen(false); // Close profile menu on route change
//   }, [location]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//   };

//   const [headerSearch, setHeaderSearch] = useState("");

//   return (
//     <header className="bg-white sticky shadow-sm w-full top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-20">
//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <Link to="/" className="flex items-center">
//               <span className="text-2xl font-bold text-gray-900">Bazario</span>
//             </Link>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <TextInput
//               type="text"
//               placeholder="Search.."
//               onChange={(e) => setHeaderSearch(e.target.value)}
//               value={headerSearch}
//               rightIcon={AiOutlineSearch}
//               className="hidden lg:block"
//             />
//           </form>
//           <Button
//             className="w-12 h-10 lg:hidden d-flex justify-center items-center cursor-pointer"
//             color="gray"
//             pill
//             type="submit"
//           >
//             {window.innerWidth < 1024 ? (
//               <Link to="/search">
//                 <AiOutlineSearch />
//               </Link>
//             ) : (
//               <AiOutlineSearch />
//             )}
//           </Button>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex space-x-8 text-lg">
//             <NavLink className="text-lg" to="/">
//               Home
//             </NavLink>
//             <NavLink to="/categories">Categories</NavLink>
//             <NavLink to="/product">Product</NavLink>
//             <Link to="/cart" className="relative">
//               <FaShoppingCart className="text-2xl" />
//               {getCartCount() > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                   {getCartCount()}
//                 </span>
//               )}
//             </Link>
//             <Link to="/orders" className="text-gray-600 hover:text-blue-600">
//   My Orders
// </Link>
//           </nav>

//           {isLoggedIn ? (
//             <div className="relative">
//               <img
//                 src={
//                   userProfilePhoto ||
//                   "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
//                 }
//                 alt="Profile"
//                 style={{ borderRadius: "50%", width: "40px", height: "40px" }}
//                 onClick={handleProfileMenuToggle} // Toggle menu on click
//               />
//               {isProfileMenuOpen && ( // Conditional rendering of the profile menu
//                 <div
//                   ref={menuRef} // Attach the ref to the menu
//                   className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-sm shadow-lg z-10"
//                 >
//                   <Link
//                     to="/profile"
//                     onClick={handleMenuOptionClick}
//                     className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
//                   >
//                     Profile
//                   </Link>
//                   <button
//                     onClick={handleSignOut}
//                     className="block border-none w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
//                   >
//                     Log Out
//                   </button>
//                 </div>
//               )}
//               {/* <div className="cart-icon-container"> */}
//               {/* <FaShoppingCart size={20} className="text-gray-400 mt-[2px]" /> */}
//               {/* {cart > 0 && ( */}
//               {/* <div className={`cart-count ${animate ? "animate-count" : ""} px-2 rounded-full`}> */}
//               {/* {cart} */}
//               {/* </div> */}
//               {/* )} */}
//               {/* </div> */}
//             </div>
//           ) : (
//             <>
//               <div className="hidden md:flex items-center space-x-4">
//                 <Link
//                   to="/login"
//                   className="px-7 hover:text-purple-600 py-2.5 relative group overflow-hidden font-medium text-bl inline-block"
//                 >
//                   <span className="relative">Sign In</span>
//                 </Link>
//                 <Link
//                   to="./register"
//                   className="px-7 py-2.5 relative rounded group overflow-hidden font-medium bg-purple-600 text-white inline-block"
//                 >
//                   <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-0 bg-white group-hover:h-full opacity-90"></span>
//                   <span className="relative group-hover:text-purple-600">
//                     Sign Up
//                   </span>
//                 </Link>
//               </div>
//             </>
//           )}

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
//             >
//               <span className="sr-only">Open main menu</span>
//               {isOpen ? (
//                 <svg
//                   className="block h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               ) : (
//                 <svg
//                   className="block h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//       {/* Mobile menu */}
//       <motion.div
//         className={`${isOpen ? "block" : "hidden"} md:hidden`}
//         initial={{ opacity: 0, y: 0 }}
//         animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? "auto" : 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="px-4 pt-2 pb-3 space-y-3 bg-white shadow-lg">
//           <Link
//             to="/"
//             onClick={handleLinkClick}
//             className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
//           >
//             Home
//           </Link>

//           <Link
//             to="/categories"
//             onClick={handleLinkClick}
//             className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
//           >
//             Categories
//           </Link>

//           {isLoggedIn ? (
//             <></>
//           ) : (
//             <>
//               <Link
//                 to="/login"
//                 onClick={handleLinkClick}
//                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
//               >
//                 Sign In
//               </Link>

//               <Link
//                 to="/register"
//                 onClick={handleLinkClick}
//                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
//               >
//                 Sign Up
//               </Link>
//             </>
//           )}
//         </div>
//       </motion.div>
//     </header>
//   );
// };

// export default Header;

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
// // import { useAuth } from '../context/AuthContext';
// import { useAuth } from './context/AuthContext';
// // import { useCart } from '../context/CartContext';
// // import { useCart } from './context/CartContext';
// // import { useCart } from './context/CartContext';
// import {useCart} from './context/CartContext';
// import { toast } from 'react-hot-toast';
// import { useLogout } from './utils/logout';

// const Header = () => {
//   const { user } = useAuth();
//   const { cart } = useCart();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//   const logout = useLogout();

//   const handleLogout = () => {
//     logout();
//     toast.success('Logged out successfully');
//     navigate('/login');
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const toggleProfileDropdown = () => {
//     setIsProfileDropdownOpen(!isProfileDropdownOpen);
//   };

//   return (
//     <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center">
//             <span className="text-2xl font-bold text-blue-600">PurityPath</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="text-gray-600 hover:text-blue-600">
//               Home
//             </Link>
//             <Link to="/products" className="text-gray-600 hover:text-blue-600">
//               Products
//             </Link>
//             {user?.role === 'seller' && (
//               <Link to="/seller/dashboard" className="text-gray-600 hover:text-blue-600">
//                 Seller Dashboard
//               </Link>
//             )}
//           </nav>

//           {/* Desktop Right Section */}
//           <div className="hidden md:flex items-center space-x-6">
//             {user ? (
//               <>
//                 {/* Cart Icon */}
//                 <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
//                   <FaShoppingCart className="text-2xl" />
//                   {cart?.length > 0 && (
//                     <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                       {cart.length}
//                     </span>
//                   )}
//                 </Link>

//                 {/* Profile Dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={toggleProfileDropdown}
//                     className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 focus:outline-none"
//                   >
//                     <FaUser className="text-xl" />
//                     <span>{user.firstname}</span>
//                   </button>

//                   {isProfileDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
//                       <Link
//                         to="/profile"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Profile
//                       </Link>
//                       <Link
//                         to="/orders"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         My Orders
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <div className="space-x-4">
//                 <Link
//                   to="/login"
//                   className="text-gray-600 hover:text-blue-600"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 >
//                   Register
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={toggleMenu}
//             className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
//           >
//             {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4">
//             <div className="flex flex-col space-y-4">
//               <Link
//                 to="/"
//                 className="text-gray-600 hover:text-blue-600"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Home
//               </Link>
//               <Link
//                 to="/products"
//                 className="text-gray-600 hover:text-blue-600"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Products
//               </Link>
//               {user?.role === 'seller' && (
//                 <Link
//                   to="/seller/dashboard"
//                   className="text-gray-600 hover:text-blue-600"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Seller Dashboard
//                 </Link>
//               )}
//               {user ? (
//                 <>
//                   <Link
//                     to="/cart"
//                     className="text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Cart ({cart?.length || 0})
//                   </Link>
//                   <Link
//                     to="/profile"
//                     className="text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Profile
//                   </Link>
//                   <Link
//                     to="/orders"
//                     className="text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     My Orders
//                   </Link>
//                   <button
//                     onClick={() => {
//                       handleLogout();
//                       setIsMenuOpen(false);
//                     }}
//                     className="text-left text-gray-600 hover:text-blue-600"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <div className="space-y-4">
//                   <Link
//                     to="/login"
//                     className="block text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Login
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Register
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
// import { useAuth } from './context/AuthContext';
// import { useCart } from './context/CartContext';
// import { toast } from 'react-hot-toast';

// const Header = () => {
//   const { user, logout } = useAuth();
//   const { cart } = useCart();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const toggleProfileDropdown = () => {
//     setIsProfileDropdownOpen(!isProfileDropdownOpen);
//   };

//   return (
//     <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center">
//             <span className="text-2xl font-bold text-blue-600">PurityPath</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="text-gray-600 hover:text-blue-600">
//               Home
//             </Link>
//             <Link to="/products" className="text-gray-600 hover:text-blue-600">
//               Products
//             </Link>
//             {user?.role === 'seller' && (
//               <Link to="/seller/dashboard" className="text-gray-600 hover:text-blue-600">
//                 Seller Dashboard
//               </Link>
//             )}
//           </nav>

//           {/* Desktop Right Section */}
//           <div className="hidden md:flex items-center space-x-6">
//             {user ? (
//               <>
//                 {/* Cart Icon */}
//                 <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
//                   <FaShoppingCart className="text-2xl" />
//                   {cart?.length > 0 && (
//                     <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                       {cart.length}
//                     </span>
//                   )}
//                 </Link>

//                 {/* Profile Dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={toggleProfileDropdown}
//                     className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 focus:outline-none"
//                   >
//                     <FaUser className="text-xl" />
//                     <span>{user.firstname}</span>
//                   </button>

//                   {isProfileDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                       <Link
//                         to="/profile"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         onClick={() => setIsProfileDropdownOpen(false)}
//                       >
//                         Profile
//                       </Link>
//                       <Link
//                         to="/orders"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         onClick={() => setIsProfileDropdownOpen(false)}
//                       >
//                         My Orders
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <div className="space-x-4">
//                 <Link
//                   to="/login"
//                   className="text-gray-600 hover:text-blue-600"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 >
//                   Register
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={toggleMenu}
//             className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
//           >
//             {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 absolute top-16 left-0 right-0 bg-white shadow-md z-50">
//             <div className="flex flex-col space-y-4 px-4">
//               <Link
//                 to="/"
//                 className="text-gray-600 hover:text-blue-600"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Home
//               </Link>
//               <Link
//                 to="/products"
//                 className="text-gray-600 hover:text-blue-600"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Products
//               </Link>
//               {user ? (
//                 <>
//                   {user?.role === 'seller' && (
//                     <Link
//                       to="/seller/dashboard"
//                       className="text-gray-600 hover:text-blue-600"
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       Seller Dashboard
//                     </Link>
//                   )}
//                   <Link
//                     to="/cart"
//                     className="text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Cart ({cart?.length || 0})
//                   </Link>
//                   <Link
//                     to="/profile"
//                     className="text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Profile
//                   </Link>
//                   <Link
//                     to="/orders"
//                     className="text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     My Orders
//                   </Link>
//                   <button
//                     onClick={() => {
//                       handleLogout();
//                       setIsMenuOpen(false);
//                     }}
//                     className="text-left text-gray-600 hover:text-blue-600"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <div className="space-y-4">
//                   <Link
//                     to="/login"
//                     className="block text-gray-600 hover:text-blue-600"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Login
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Register
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;

// third method
// import React, { useRef, useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useDispatch } from "react-redux";
// import { SignOut } from "../store/userSlice";
// import { FaShoppingCart } from "react-icons/fa";
// import { AiOutlineSearch } from "react-icons/ai";
// import { TextInput, Button } from "flowbite-react";
// import { useCart } from './context/CartContext';
// import { useAuth } from './context/AuthContext';

// const Header = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const location = useLocation();
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const menuRef = useRef(null);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { cart } = useCart();
//   const { user, logout } = useAuth();
//   const [headerSearch, setHeaderSearch] = useState("");

//   const handleSignOut = () => {
//     logout(); // Use the logout function from AuthContext
//     dispatch(SignOut());
//     navigate('/login');
//   };

//   const NavLink = ({ to, children }) => (
//     <Link
//       to={to}
//       className="relative text-gray-600 hover:text-primary-600 px-3 py-2 text-base font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary-600 after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-left hover:after:scale-x-100"
//     >
//       {children}
//     </Link>
//   );

//   // Close profile menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setIsProfileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Close menus on route change
//   useEffect(() => {
//     setIsProfileMenuOpen(false);
//     setIsOpen(false);
//   }, [location]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Add search functionality here
//   };

//   return (
//     <header className="bg-white sticky shadow-sm w-full top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-20">
//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <Link to="/" className="flex items-center">
//               <span className="text-2xl font-bold text-gray-900">Bazario</span>
//             </Link>
//           </div>

//           {/* Search Bar */}
//           <form onSubmit={handleSubmit} className="hidden lg:block">
//             <TextInput
//               type="text"
//               placeholder="Search.."
//               value={headerSearch}
//               onChange={(e) => setHeaderSearch(e.target.value)}
//               rightIcon={AiOutlineSearch}
//             />
//           </form>

//           {/* Mobile Search Button */}
//           <Button
//             className="w-12 h-10 lg:hidden flex justify-center items-center"
//             color="gray"
//             pill
//             type="button"
//           >
//             <Link to="/search">
//               <AiOutlineSearch />
//             </Link>
//           </Button>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex space-x-8 text-lg">
//             <NavLink to="/">Home</NavLink>
//             <NavLink to="/categories">Categories</NavLink>
//             <NavLink to="/product">Product</NavLink>
//             {user && (
//               <>
//                 <Link to="/cart" className="relative">
//                   <FaShoppingCart className="text-2xl" />
//                   {cart?.length > 0 && (
//                     <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                       {cart.length}
//                     </span>
//                   )}
//                 </Link>
//                 <NavLink to="/orders">My Orders</NavLink>
//               </>
//             )}
//           </nav>

//           {/* Auth Section */}
//           {user ? (
//             <div className="relative" ref={menuRef}>
//               <img
//                 src={user.profilePhoto || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
//                 alt="Profile"
//                 className="w-10 h-10 rounded-full cursor-pointer"
//                 onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-sm shadow-lg z-10">
//                   <Link
//                     to="/profile"
//                     className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
//                     onClick={() => setIsProfileMenuOpen(false)}
//                   >
//                     Profile
//                   </Link>
//                   <button
//                     onClick={handleSignOut}
//                     className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
//                   >
//                     Log Out
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="hidden md:flex items-center space-x-4">
//               <Link
//                 to="/login"
//                 className="px-7 hover:text-purple-600 py-2.5 relative group overflow-hidden font-medium text-bl inline-block"
//               >
//                 <span className="relative">Sign In</span>
//               </Link>
//               <Link
//                 to="/register"
//                 className="px-7 py-2.5 relative rounded group overflow-hidden font-medium bg-purple-600 text-white inline-block"
//               >
//                 <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-0 bg-white group-hover:h-full opacity-90"></span>
//                 <span className="relative group-hover:text-purple-600">Sign Up</span>
//               </Link>
//             </div>
//           )}

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
//             onClick={() => setIsOpen(!isOpen)}
//           >
//             <span className="sr-only">Open menu</span>
//             {isOpen ? (
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             ) : (
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <motion.div
//         className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
//         transition={{ duration: 0.2 }}
//       >
//         <div className="px-4 pt-2 pb-3 space-y-1 bg-white shadow-lg">
//           <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//             Home
//           </Link>
//           <Link to="/categories" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//             Categories
//           </Link>
//           <Link to="/product" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//             Products
//           </Link>
//           {user ? (
//             <>
//               <Link to="/cart" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//                 Cart ({cart?.length || 0})
//               </Link>
//               <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//                 My Orders
//               </Link>
//               <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//                 Profile
//               </Link>
//               <button
//                 onClick={() => {
//                   handleSignOut();
//                   setIsOpen(false);
//                 }}
//                 className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//               >
//                 Log Out
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//                 Sign In
//               </Link>
//               <Link to="/register" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
//                 Sign Up
//               </Link>
//             </>
//           )}
//         </div>
//       </motion.div>
//     </header>
//   );
// };

// export default Header;

// 8-jan-2025

// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// // import { useAuth } from './context/AuthContext';
// import { useDispatch, useSelector } from 'react-redux';
// import { SignInSetUp } from '../store/userSlice';

// const Header = () => {
//   // const { user, logout } = useAuth();
//   const { userData } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleSignout = async () => {
//     try {
//       const res = await fetch("/api/users/sign-out", {
//         method: "POST",
//       });

//       if (res.ok) {
//         dispatch(SignInSetUp());
//         toast.success('Logged out successfully');
//         navigate("/login");
//       } else {
//          const errorMessage = error.response?.data?.message || 'Logout failed';
//          dispatch(SignInFailure(errorMessage));
//          toast.error(errorMessage);
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

//   return (
//     <header className="bg-white shadow-md sticky top-0 left-0 right-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="text-2xl font-bold">
//             Your Logo
//           </Link>

//           {/* Navigation */}
//           <nav className="flex items-center space-x-4">
//             {userData ? (
//               // Logged in user options
//               <>
//                 <Link to="/cart" className="text-gray-600 hover:text-blue-600">
//                   Cart
//                 </Link>
//                 <Link to="/orders" className="text-gray-600 hover:text-blue-600">
//                   Orders
//                 </Link>
//                 <Link to="/profile" className="text-gray-600 hover:text-blue-600">
//                   Profile
//                 </Link>
//                 <button
//                   onClick={() => handleSignout()}
//                   className="text-gray-600 hover:text-blue-600"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               // Guest options
//               <>
//                 <Link to="/login" className="text-gray-600 hover:text-blue-600">
//                   Login
//                 </Link>
//                 <Link to="/register" className="text-gray-600 hover:text-blue-600">
//                   Register
//                 </Link>
//               </>
//             )}
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInSetUp, SignInFailure } from "../store/userSlice";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaUserCircle } from "react-icons/fa";
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
  // 8-jan-2025 !

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
              // <>
               
              //   <div className="relative group">
              //     <button className="text-gray-600 hover:text-blue-600">
              //       <FaUser className="w-6 h-6" />
              //     </button>
              //     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
              //       <Link
              //         to="/profile"
              //         className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              //       >
              //         Profile
              //       </Link>
              //       <Link
              //         to="/orders"
              //         className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              //       >
              //         Orders
              //       </Link>
              //       <button
              //         onClick={handleSignout}
              //         className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              //       >
              //         Logout
              //       </button>
              //     </div>
              //   </div>
              // </>
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
