// // client/src/components/ProductCatalog.jsx
// "use client";


// import { useRef, useState } from "react";
// import { FaAngleLeft, FaAngleRight } from "react-icons/fa6"; // Import icons for navigation

// const products = [
//   {
//     id: 1,
//     name: "Product 1",
//     description: "Description for product 1",
//     price: "$599",
//     image: "https://via.placeholder.com/150",
//     rating: 5.0,
//   },
//   {
//     id: 2,
//     name: "Product 2",
//     description: "Description for product 2",
//     price: "$249",
//     image: "https://via.placeholder.com/150",
//     rating: 4.5,
//   },
//   {
//     id: 3,
//     name: "Product 3",
//     description: "Description for product 3",
//     price: "$149",
//     image: "https://via.placeholder.com/150",
//     rating: 4.0,
//   },
//   {
//     id: 4,
//     name: "Product 4",
//     description: "Description for product 4",
//     price: "$299",
//     image: "https://via.placeholder.com/150",
//     rating: 4.8,
//   },
//   {
//     id: 5,
//     name: "Product 5",
//     description: "Description for product 5",
//     price: "$49",
//     image: "https://via.placeholder.com/150",
//     rating: 4.2,
//   },
//   {
//     id: 6,
//     name: "Fossil Gen 5",
//     description: "Smartwatch, Black",
//     price: "$299",
//     image: "https://via.placeholder.com/150",
//     rating: 4.6,
//   },
//   {
//     id: 7,
//     name: "Product 4",
//     description: "Description for product 4",
//     price: "$299",
//     image: "https://via.placeholder.com/150",
//     rating: 4.8,
//   },
//   {
//     id: 8,
//     name: "Product 5",
//     description: "Description for product 5",
//     price: "$49",
//     image: "https://via.placeholder.com/150",
//     rating: 4.2,
//   },
//   {
//     id: 9,
//     name: "Fossil Gen 5",
//     description: "Smartwatch, Black",
//     price: "$299",
//     image: "https://via.placeholder.com/150",
//     rating: 4.6,
//   },
// ];

// const ProductCatalog = () => {
//   const productRef = useRef(null); // Reference for the product list
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Check if mobile


//   const handleScrollRight = () => {
//     if (productRef.current) {
//       setCurrentIndex(currentIndex + 1);
//       if(isMobile){
//         productRef.current.scrollLeft += 230; // Scroll right by 200px
//       }else{
//         productRef.current.scrollLeft += 270; // Scroll right by 200px
//       }
//     }
//   };

//   const handleScrollLeft = () => {
//     if (productRef.current) {
//       setCurrentIndex(currentIndex - 1);
//       if(isMobile){
//         productRef.current.scrollLeft -= 230; // Scroll left by 200px
//       }else{
//         productRef.current.scrollLeft -= 270; // Scroll left by 200px
//       }
//     }
//   };

//   // Check if the right arrow should be disabled
//   const isRightDisabled = () => {
//     return currentIndex >= products.length - 5; // Disable if at the end
//   };

//   // Check if the left arrow should be disabled
//   const isLeftDisabled = () => {
//     return currentIndex <= 0; // Disable if at the start
//   };

//   return (
//     <div className="mx-auto ">
      
//       <div className={`relative flex items-center flex-col max-w-[99%] mx-auto overflow-hidden`}>
//         {/* Left Arrow Button */}
//         <div className="w-[99.5%] mx-auto bg-white ">
//         <h3 className="text-xl font-bold ml-10 mb-1 mt-7">Related to items you've viewed</h3>
//         <div className=" w-[91.5%] mx-auto mb-2">
//           <div className={`absolute top-1/2 ${isMobile ? 'left-[-20px] mt-6' : 'left-0'} transform -translate-y-1/2 z-10 pl-6`}>
          
//             <button
//               onClick={handleScrollLeft}
//               className={`bg-white shadow-lg text-lg p-2 rounded-full ${
//                 isLeftDisabled() ? "hidden" : "hover:bg-gray-100"
//               }`}
//             >
//               <FaAngleLeft />
//             </button>
//           </div>

//           {/* Right Arrow Button */}
//           <div className={`absolute top-1/2 ${isMobile ? 'right-[-20px] mt-6' : 'right-0'} transform -translate-y-1/2 z-10 pr-6`}>
//             <button
//               onClick={handleScrollRight}
//               className={`bg-white shadow-lg text-lg p-2 rounded-full ${
//                 isRightDisabled() ?  "hidden" : "hover:bg-gray-100"
//               }`}
//             >
//               <FaAngleRight />
//             </button>
//           </div>

//           {/* Product Cards Wrapper */}

//           <div
//             className="flex w-[100%]  items-center overflow-x-scroll scrollbar-none scroll-smooth"
//             ref={productRef}
//           >
//             <div className="p-1 mx-auto flex gap-2">
//               {products.map((product) => (
//                 <div
//                   key={product.id}
//                   className={`p-2  bg-slate-300 rounded-md flex-shrink-0 ${isMobile ? 'w-[200px] ml-6' : 'w-[260px]'}`}
//                 >
//                   <img
//                     className="rounded-t-lg w-full"
//                     src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_RpV_Nq_aND67ekZG9sOso6gv4AQatx2sw&s"
//                     alt={product.name}
//                   />
//                   <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
//                     <h5 className={` font-semibold tracking-tight text-gray-900 ${isMobile ? 'text-base' : 'text-xl'}`}>
//                       {product.name}
//                     </h5>
//                     <p className={`text-gray-600 ${isMobile ? 'hidden' : 'text-base'}`}>{product.description}</p>
//                     <div className={`flex items-center ${isMobile ? 'mb-3 ml-[-5px]' : 'mb-5 mt-2.5 '}`}>
//                       {[...Array(5)].map((_, index) => (
//                         <svg
//                           key={index}
//                           className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${
//                             index < product.rating
//                               ? "text-yellow-300"
//                               : "text-gray-300"
//                           }`}
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                       ))}
//                       <span className={`rounded bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 ${isMobile ? 'ml-2' : 'ml-3 mr-2'}`}>
//                         {product.rating}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className= {`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
//                         {product.price}
//                       </span>
//                       <a
//                         href="#"
//                         className={`rounded-lg bg-cyan-700  text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 ${isMobile ? 'px-2 py-2' : 'px-5 py-2.5'}`}
//                       >
//                         Add to cart
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCatalog;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
// import {addToCart} from '../store/cartSlice';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const dispatch = useDispatch();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`);
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (productId) => {
    try {
      // await dispatch(addToCart({ productId, quantity: 1 }));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'vegetable', name: 'Vegetables' },
    { id: 'Home-Cooked Food', name: 'Home Cooked Food' },
    { id: 'Traditional-Pickles', name: 'Traditional Pickles' },
    { id: 'Seasonal Foods', name: 'Seasonal Foods' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Product Categories</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <Link to={`/product/${product._id}`}>
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-2">
                {product.description.length > 100 
                  ? `${product.description.substring(0, 100)}...` 
                  : product.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold">₹{product.price}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    per {product.unitSize} {product.unitType}
                  </span>
                </div>
                {product.stock > 0 ? (
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </div>
              {product.stock < 5 && product.stock > 0 && (
                <p className="text-orange-500 text-sm mt-2">
                  Only {product.stock} left in stock!
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Products Message */}
      {products.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
