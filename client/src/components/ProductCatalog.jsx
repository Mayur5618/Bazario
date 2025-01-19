import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { cartAdd, cartRemove } from "../store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/catelog.css";
import "../styles/recentlyViewed.css";
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [cartItemsMap, setCartItemsMap] = useState({});
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get("/api/cart/getCartItems", {
          withCredentials: true,
        });
        if (response.data.success) {
          const itemsMap = {};
          response.data.cart.items.forEach((item) => {
            itemsMap[item.product._id] = item;
          });
          setCartItemsMap(itemsMap);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (userData) {
      fetchCartItems();
    } else {
      setCartItemsMap({});
    }
  }, [userData]);

  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const response = await axios.post("/api/cart/add", {
        productId,
        quantity: 1,
      });

      if (response.data.success) {
        dispatch(cartAdd());
        const updatedCart = await axios.get("/api/cart/getCartItems");
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach((item) => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success("Added to cart!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, stock) => {
    if (!userData) {
      toast.error("Please login to update cart");
      return;
    }

    try {
      if (newQuantity < 1) {
        dispatch(cartRemove());
        const response = await axios.delete(`/api/cart/remove/${productId}`);
        if (response.data.success) {
          const newItemsMap = { ...cartItemsMap };
          delete newItemsMap[productId];
          setCartItemsMap(newItemsMap);
          toast.success("Item removed from cart");
        }
        return;
      }

      if (newQuantity > stock) {
        toast.error("Cannot exceed available stock");
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity,
      });

      if (response.data.success) {
        const updatedCart = await axios.get("/api/cart/getCartItems");
        const newItemsMap = {};
        updatedCart.data.cart.items.forEach((item) => {
          newItemsMap[item.product._id] = item;
        });
        setCartItemsMap(newItemsMap);
        toast.success(`Quantity updated to ${newQuantity}`);
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleWishlist = (e, productId) => {
    e.preventDefault();
    
    if (!userData) {
      toast.error("Please login to manage wishlist");
      return;
    }

    if (wishlistItems.includes(productId)) {
      dispatch(removeFromWishlist(productId));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist(productId));
      toast.success("Added to wishlist");
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/products${
            selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
          }`
        );
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError("Failed to fetch products");
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "vegetable", name: "Vegetables" },
    { id: "Home-Cooked Food", name: "Home Cooked Food" },
    { id: "Traditional-Pickles", name: "Traditional Pickles" },
    { id: "Seasonal Foods", name: "Seasonal Foods" },
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
    <>
      <div className="container mx-auto px-4 pt-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full text-sm ${
                  selectedCategory === category.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="relative w-full pb-[100%]">
              <Link to={`/product/${product._id}`} className="absolute inset-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlist(e, product._id);
                }}
                className="absolute top-3 right-3 z-10"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {wishlistItems.includes(product._id) ? (
                    <FaHeart className="w-6 h-6 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
            </div>

            <div className="p-3 flex flex-col flex-grow">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">₹{product.price}</span>
                <span className="text-sm text-gray-500">
                  per {product.unitSize} {product.unitType}
                </span>
              </div>

              {product.stock > 0 ? (
                <AnimatePresence mode="wait">
                  {cartItemsMap[product._id] ? (
                    <div className="flex items-center justify-between bg-red-500 rounded-md overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(product._id, cartItemsMap[product._id].quantity - 1)}
                        className="w-12 h-10 flex items-center justify-center text-white text-xl font-bold"
                      >
                        -
                      </button>
                      <span className="text-white font-medium">
                        {cartItemsMap[product._id].quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(product._id, cartItemsMap[product._id].quantity + 1, product.stock)}
                        className="w-12 h-10 flex items-center justify-center text-white text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                </AnimatePresence>
              ) : (
                <div className="text-center py-2.5 text-red-500 font-medium">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductCatalog;
