import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { cartAdd } from '../store/cartSlice';

const CategoryProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});

  // Fetch products for the category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/category/${category}`);
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Fetch cart items whenever component mounts or cart is updated
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userData) return;

      try {
        const response = await axios.get('http://localhost:5000/api/cart', {
          withCredentials: true
        });
        
        if (response.data.success) {
          const cartMap = {};
          response.data.cart.items.forEach(item => {
            cartMap[item.product._id] = item.quantity;
          });
          setCartItems(cartMap);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCartItems();
  }, [userData]);

  const handleAddToCart = async (productId) => {
    if (!userData) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/cart/add', {
        productId,
        quantity: 1
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Update local cart state
        setCartItems(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1
        }));
        dispatch(cartAdd());
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      try {
        await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
          withCredentials: true
        });
        
        // Remove item from local cart state
        const newCartItems = { ...cartItems };
        delete newCartItems[productId];
        setCartItems(newCartItems);
        toast.success('Item removed from cart');
      } catch (error) {
        toast.error('Failed to remove item');
      }
    } else {
      try {
        await axios.put('http://localhost:5000/api/cart/update', {
          productId,
          quantity: newQuantity
        }, {
          withCredentials: true
        });

        // Update local cart state
        setCartItems(prev => ({
          ...prev,
          [productId]: newQuantity
        }));
      } catch (error) {
        toast.error('Failed to update quantity');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 capitalize">
          {category.replace(/-/g, ' ')}
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No products found in this category
            </h2>
            <p className="text-gray-500">
              Check back later for new products
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">₹{product.price}</span>
                    <div className="w-[120px]">
                      {cartItems[product._id] ? (
                        <div className="flex items-center justify-between w-full">
                          <button
                            onClick={() => handleUpdateQuantity(product._id, cartItems[product._id] - 1)}
                            className="w-8 h-8 bg-blue-500 text-white rounded-lg text-xl font-medium flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-lg">
                            {cartItems[product._id]}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product._id, cartItems[product._id] + 1)}
                            className="w-8 h-8 bg-blue-500 text-white rounded-lg text-xl font-medium flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="w-full h-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts; 