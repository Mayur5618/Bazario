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
  const [cartItemsMap, setCartItemsMap] = useState({});

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

  // Fetch cart items if user is logged in
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cart', {
          withCredentials: true
        });
        if (response.data.success) {
          const itemsMap = {};
          response.data.cart.items.forEach(item => {
            itemsMap[item.product._id] = item;
          });
          setCartItemsMap(itemsMap);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    if (userData) {
      fetchCartItems();
    }
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
        dispatch(cartAdd());
        toast.success('Added to cart');
        // Update cart items map
        const newCartItemsMap = { ...cartItemsMap };
        newCartItemsMap[productId] = response.data.cart.items.find(
          item => item.product._id === productId
        );
        setCartItemsMap(newCartItemsMap);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
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
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">₹{product.price}</span>
                    {cartItemsMap[product._id] ? (
                      <span className="text-green-500">Added to Cart</span>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        Add to Cart
                      </button>
                    )}
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