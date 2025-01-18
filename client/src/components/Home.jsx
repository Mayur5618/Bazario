import React from 'react';
import CategorySection from './CategorySection';
import ProductCatalog from './ProductCatalog';
import Temp from './temp';
import ProductSlider from './ProductSlider';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { clearUserData } from '../store/userSlice';
import RecentlyViewed from './RecentlyViewed';


const Home = () => {
  const [tokenExpired, setTokenExpired] = useState(false);
  const dispatch = useDispatch();

  // console.log(messageShown);
  
  // useEffect(() => {
  //   const checkToken = async () => {
  //     try {
  //       const response = await fetch('/api/cart', {
  //         method: 'GET',
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });
  //       if (!response.ok) {
  //         const data = await response.json();
  //         if (data.message === "Please log in to access this resource") {
  //           setTokenExpired(true);
  //           dispatch(clearUserData()); // Clear user data from Redux
  //           localStorage.removeItem('token'); // Optionally remove token from local storage
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching cart:", error);
  //     }
  //   };

  //   checkToken();
  // }, [dispatch]);

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

  return (
    <div className='bg-gray-00'>
      
      <div className="w-full relative">
        <Temp />
        <div className="relative z-0 p-4"> {/* Added padding for spacing */}
          {/* <h className="text-xl font-bold mb-4">Explore Categories</h> */}
          {/* <CategorySection /> */}
          <ProductCatalog />
          {/* <ProductSlider /> */}
          <RecentlyViewed handleViewProduct={handleViewProduct}/>
        </div>
      </div>
    </div>
  );
};

export default Home;

//  import React, { useEffect, useState } from 'react';
//  import CategorySection from './CategorySection';
//  import ProductCatalog from './ProductCatalog';
//  import ProductSlider from './ProductSlider';
//  import { useDispatch } from 'react-redux';
//  import { toast } from 'react-hot-toast';
 
//  const Home = () => {
//    const [tokenExpired, setTokenExpired] = useState(false);
//    const dispatch = useDispatch();
 
//    useEffect(() => {
//      const checkToken = async () => {
//        try {
//          // Simulate a cart fetch or any API call that requires authentication
//          const response = await fetch('/api/cart', {
//            method: 'GET',
//            headers: {
//              'Authorization': `Bearer ${localStorage.getItem('token')}`
//            }
//          });
//          if (!response.ok) {
//            const data = await response.json();
//            if (data.message === "Please log in to access this resource") {
//              setTokenExpired(true);
//              toast.error("Your session has expired. Please log in again.");
//            }
//          }
//        } catch (error) {
//          console.error("Error fetching cart:", error);
//        }
//      };
 
//      checkToken();
//    }, [dispatch]);
 
//    return (
//      <div className='bg-gray-00'>
//        {tokenExpired && (
//          <div className="alert alert-warning">
//            Your session has expired. Please log in again.
//          </div>
//        )}
//        <div className="w-full relative">
//            <ProductCatalog />
//            <ProductSlider />
//          </div>
//        </div>
     

//    );
//  };
 
//  export default Home;