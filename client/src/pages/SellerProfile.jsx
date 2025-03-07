import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaStore, FaBox, FaUsers, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SellerProfile = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    averageRating: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // products, about, reviews

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      const response = await axios.get(`/api/users/seller/${sellerId}`);
      if (response.data.success) {
        setSeller(response.data.seller);
        setProducts(response.data.products);
        setStats({
          totalProducts: response.data.stats.totalProducts || 0,
          totalSales: response.data.stats.totalSales || 0,
          averageRating: response.data.stats.averageRating || 0,
          totalCustomers: response.data.stats.totalCustomers || 0
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load seller information');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Seller not found</h2>
          <p className="mt-2 text-gray-600">The seller you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Seller Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Seller Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {seller.profileImage ? (
                <img 
                  src={seller.profileImage} 
                  alt={`${seller.firstname} ${seller.lastname}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaStore className="w-12 h-12 text-gray-400" />
              )}
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {seller.firstname} {seller.lastname}
              </h1>
              <p className="text-gray-600 mt-1">{seller.bio || 'No bio available'}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FaBox className="w-6 h-6 mx-auto text-blue-500" />
                  <div className="mt-2">
                    <div className="text-xl font-semibold">{stats.totalProducts}</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FaShoppingCart className="w-6 h-6 mx-auto text-green-500" />
                  <div className="mt-2">
                    <div className="text-xl font-semibold">{stats.totalSales}</div>
                    <div className="text-sm text-gray-600">Sales</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FaStar className="w-6 h-6 mx-auto text-yellow-400" />
                  <div className="mt-2">
                    <div className="text-xl font-semibold">{stats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FaUsers className="w-6 h-6 mx-auto text-purple-500" />
                  <div className="mt-2">
                    <div className="text-xl font-semibold">{stats.totalCustomers}</div>
                    <div className="text-sm text-gray-600">Customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'about'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:scale-105">
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        <div className="flex items-center">
                          <FaStar className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">
                            {product.rating || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">About the Seller</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <p className="mt-1 text-gray-600">{seller.description || 'No description available'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Contact Information</h3>
                  <div className="mt-1 text-gray-600">
                    <p>Email: {seller.email}</p>
                    <p>Phone: {seller.phone}</p>
                    <p>Location: {seller.location || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Business Hours</h3>
                  <p className="mt-1 text-gray-600">{seller.businessHours || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
              {/* Add reviews component here */}
              <div className="text-center text-gray-600">
                Reviews coming soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile; 