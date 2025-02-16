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
} from "../store/cartSlice";
import axios from "axios";

const Cart = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const cart = useSelector(selectCartItems);
  const cartItems = useSelector(selectCartItems) || [];
  const cartTotal = useSelector(selectCartTotal) || 0;
  const navigate = useNavigate();
  const [removingItems, setRemovingItems] = useState({}); // Add this state
  

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
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
      }
    };

    if (userData) {
      fetchCartItems();
    } else {
      dispatch(setCartItems([]));
    }
  }, [userData, dispatch]);

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
          <p className="text-gray-600 mb-4">Please login to view your cart</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-4">Add some items to your cart</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
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
      setRemovingItems((prev) => ({ ...prev, [productId]: true }));

      const response = await axios.delete(`/api/cart/remove/${productId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        // This will decrease cart count by 1 since we're removing a product
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
    } finally {
      setRemovingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your Basket</h2>

      {/* Checkout Summary Bar */}
      <div className="bg-gray-900 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <span className="text-lg">Subtotal ({cart.length} items): ₹{cartTotal.toFixed(2)}</span>
          {/* <div className="text-green-400 text-sm">
            Savings: ₹{cart.reduce((acc, item) => 
              acc + ((item.product.originalPrice - item.price) * item.quantity), 0).toFixed(2)}
          </div> */}
        </div>
        <Link
          to="/checkout"
          className="px-8 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Checkout
        </Link>
      </div>

      {/* Cart Items Table Header */}
      <div className="grid grid-cols-12 gap-4 mb-4 px-4 py-2 bg-[#f3eff3] rounded-t-lg">
        <div className="col-span-6">Items ({cart.length} items)</div>
        <div className="col-span-3 text-center">Quantity</div>
        <div className="col-span-3 text-right">Sub-total</div>
      </div>

      {/* Cart Items */}
      <div className="border rounded-b-lg">
        {cart.map((item, index) => (
          <div
            key={`${item?.product?._id}-${index}`}
            className={`grid grid-cols-12 gap-4 p-4 border-b last:border-b-0
              transition-all duration-300 ease-in-out
              ${removingItems[item?.product?._id] ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}`}
          >
            {/* Item Details - Left Section */}
            <div className="col-span-6 flex gap-4">
              <img
                src={item?.product?.images?.[0]}
                alt={item?.product?.name}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/fallback.jpg";
                }}
              />
              <div className="flex flex-col justify-between">
                <Link
                  to={`/product/${item?.product?._id}`}
                  className="text-lg font-semibold hover:text-blue-600"
                >
                  {item?.product?.name}
                </Link>
                <div className="text-gray-600">₹{(item?.price || 0).toFixed(2)} per {item?.unitType}</div>
                <button
                  onClick={() => handleRemoveFromCart(item?.product?._id)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 w-fit"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Quantity Controls - Middle Section */}
            <div className="col-span-3 flex items-center justify-center ">
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
                <span className="w-12 text-center">{item?.quantity}</span>
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

            {/* Subtotal - Right Section */}
            <div className="col-span-3 flex flex-col items-end justify-center">
              <div className="text-lg font-semibold">
                ₹{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
              </div>
              {item?.quantity >= (item?.product?.stock || 0) && (
                <p className="text-sm text-red-600">Max stock reached</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping Link */}
      <div className="mt-6 flex justify-start">
        <Link
          to="/"
          className="px-6 py-2 border rounded hover:bg-gray-100 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
