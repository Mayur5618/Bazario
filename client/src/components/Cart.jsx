import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  cartRemove,
  cartAdd,
  cartItemRemove,
  selectCartItems,
  selectCartTotal,
  setCartItems,
  clearCart
} from "../store/cartSlice";
import axios from "axios";
import { FaShoppingCart, FaShoppingBasket, FaArrowLeft } from 'react-icons/fa';

const Cart = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const cart = useSelector(selectCartItems);
  const cartItems = useSelector(selectCartItems) || [];
  const cartTotal = useSelector(selectCartTotal) || 0;
  const navigate = useNavigate();
  const [removingItems, setRemovingItems] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);
  

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Clear any stale cart data first
        dispatch(clearCart());
        
        const response = await axios.get("/api/cart/getCartItems", {
          withCredentials: true,
        });
        
        if (response.data.success) {
          dispatch(setCartItems(response.data.cart.items));
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to fetch cart items");
        dispatch(setCartItems([]));
      } finally {
        setIsInitializing(false);
      }
    };

    if (userData) {
      fetchCartItems();
    } else {
      dispatch(setCartItems([]));
      setIsInitializing(false);
    }
  }, [userData, dispatch]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <div className="mb-8 flex justify-center">
            <FaShoppingBasket className="w-32 h-32 text-blue-600/80" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Please Login First</h2>
          <p className="text-gray-600 mb-8">Login to view your cart and start shopping</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 sm:mb-8 text-sm sm:text-base"
          >
            <FaArrowLeft className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
            Back to Shopping
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            {/* Empty Cart Icon */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FaShoppingBasket className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
            </div>

            {/* Empty Cart Message */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Looks like you haven't added anything to your cart yet.
              Browse our products and find something you'll love!
            </p>

            {/* Continue Shopping Button */}
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Continue Shopping
            </Link>

            {/* Product Suggestions */}
            <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                Popular Products You Might Like
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Add 3-4 popular product cards here */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (
    productId,
    currentQuantity,
    stock,
    newQuantity
  ) => {
    try {
      // If quantity becomes 0, remove item
      if (newQuantity < 1) {
        return handleRemoveFromCart(productId);
      }

      if (newQuantity > stock) {
        toast.error("Cannot exceed available stock");
        return;
      }

      const response = await axios.put(
        `/api/cart/update/${productId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Only update cart items, don't change cart count since we're just
        // updating quantity of an existing item
        dispatch(setCartItems(response.data.cart.items));
        toast.success("Cart updated successfully");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(error.response?.data?.message || "Failed to update cart");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      setRemovingItems(prev => ({ ...prev, [productId]: true }));

      // Wait for 1 second animation to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      const response = await axios.delete(`/api/cart/remove/${productId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        dispatch(cartItemRemove(productId));
        
        const updatedCartResponse = await axios.get("/api/cart/getCartItems", {
          withCredentials: true,
        });

        if (updatedCartResponse.data.success) {
          dispatch(setCartItems(updatedCartResponse.data.cart.items));
          toast.success("Item removed from cart");
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Basket</h2>

      {/* Checkout Summary Bar */}
      <div className="bg-gray-900 text-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <span className="text-base sm:text-lg">Subtotal ({cart.length} items): ₹{cartTotal.toFixed(2)}</span>
        </div>
        <Link
          to="/checkout"
          className="w-full sm:w-auto px-4 sm:px-8 py-2 bg-red-600 text-white text-center rounded hover:bg-red-700 transition-colors text-sm sm:text-base"
        >
          Checkout
        </Link>
      </div>

      {/* Cart Items Table Header - Hide on Mobile */}
      <div className="hidden sm:grid grid-cols-12 gap-4 mb-4 px-4 py-2 bg-[#f3eff3] rounded-t-lg">
        <div className="col-span-6">Items ({cart.length} items)</div>
        <div className="col-span-3 text-center">Quantity</div>
        <div className="col-span-3 text-right">Sub-total</div>
      </div>

      {/* Cart Items */}
      <div className="border rounded-lg sm:rounded-b-lg">
        {cart.map((item, index) => (
          <div
            key={`${item?.product?._id}-${index}`}
            className={`grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-3 sm:p-4 border-b last:border-b-0
              transition-all duration-[1000ms] ease-in-out
              ${removingItems[item?.product?._id] ? 
                'opacity-0 transform translate-x-full' : 
                'opacity-100 transform translate-x-0'}`}
          >
            {/* Item Details - Left Section */}
            <div className="sm:col-span-6 flex gap-3 sm:gap-4">
              <img
                src={item?.product?.images?.[0]}
                alt={item?.product?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/fallback.jpg";
                }}
              />
              <div className="flex flex-col justify-between flex-1">
                <Link
                  to={`/product/${item?.product?._id}`}
                  className="text-base sm:text-lg font-semibold hover:text-blue-600 line-clamp-2"
                >
                  {item?.product?.name}
                </Link>
                <div className="text-sm sm:text-base text-gray-600">₹{(item?.price || 0).toFixed(2)} per {item?.unitType}</div>
                <button
                  onClick={() => handleRemoveFromCart(item?.product?._id)}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm flex items-center gap-1 w-fit"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Mobile Price Display */}
            <div className="flex sm:hidden justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-500">Price:</span>
              <span className="text-base font-semibold">₹{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}</span>
            </div>

            {/* Quantity Controls - Middle Section */}
            <div className="sm:col-span-3 flex items-center sm:justify-center mt-3 sm:mt-0">
              <span className="text-sm font-medium text-gray-500 mr-3 sm:hidden">Quantity:</span>
              <div className="flex items-center gap-2 border-[1px] border-gray-300 py-[1px] rounded-sm">
                <button
                  onClick={() => handleUpdateQuantity(
                    item?.product?._id,
                    item?.quantity,
                    item?.product?.stock,
                    item?.quantity - 1
                  )}
                  className="px-3 py-1 transform transition-transform duration-200"
                >
                  -
                </button>
                <span className="w-8 sm:w-12 text-center text-sm sm:text-base">{item?.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(
                    item?.product?._id,
                    item?.quantity,
                    item?.product?.stock,
                    item?.quantity + 1
                  )}
                  className="px-3 py-1 transform transition-transform duration-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Subtotal - Right Section - Hide on Mobile */}
            <div className="hidden sm:flex sm:col-span-3 flex-col items-end justify-center">
              <div className="text-lg font-semibold">
                ₹{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
              </div>
              {item?.quantity >= (item?.product?.stock || 0) && (
                <p className="text-xs sm:text-sm text-red-600">Max stock reached</p>
              )}
            </div>

            {/* Stock Warning - Mobile Only */}
            {item?.quantity >= (item?.product?.stock || 0) && (
              <p className="text-xs text-red-600 mt-1 sm:hidden">Max stock reached</p>
            )}
          </div>
        ))}
      </div>

      {/* Continue Shopping Link */}
      <div className="mt-4 sm:mt-6 flex justify-start">
        <Link
          to="/"
          className="w-full sm:w-auto px-4 sm:px-6 py-2 border rounded text-center text-sm sm:text-base hover:bg-gray-100 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
