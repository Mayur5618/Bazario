import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStore, FaMapMarkerAlt, FaBox, FaStar, FaShoppingBag, FaPlay } from 'react-icons/fa';
import Loading from '../components/common/Loading';

const SellerProfile = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getYoutubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                const [sellerRes, productsRes] = await Promise.all([
                    axios.get(`/api/seller/profile/${sellerId}`),
                    axios.get(`/api/seller/${sellerId}/products`)
                ]);

                setSeller(sellerRes.data.seller);
                setProducts(productsRes.data.products);
            } catch (error) {
                setError(error.response?.data?.message || 'Error loading seller profile');
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [sellerId]);

    if (loading) return <Loading />;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
    if (!seller) return <div className="text-center p-4">Seller not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Mobile View */}
                <div className="block md:hidden">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Header Banner */}
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        
                        <div className="px-4 pb-6 -mt-12">
                            {/* Profile Section */}
                            <div className="flex flex-col items-center">
                                {/* Profile Image */}
                                <div className="w-24 h-24 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white">
                                    <img 
                                        src={seller.profileImage || '/default-shop.png'} 
                                        alt={seller.shopName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Shop Info */}
                                <div className="mt-3 text-center">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {seller.shopName}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                                        <div className="flex items-center text-gray-600">
                                            <FaStore className="text-blue-600 w-4 h-4 mr-1.5" />
                                            <span className="text-sm">{seller.businessType || 'Business'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <FaMapMarkerAlt className="text-red-500 w-4 h-4 mr-1.5" />
                                            <span className="text-sm">{seller.city}, {seller.state}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Section */}
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-900">{seller.productsCount || 0}</div>
                                    <div className="text-xs text-gray-500">Products</div>
                                </div>
                                <div className="text-center border-x border-gray-100">
                                    <div className="text-lg font-bold text-gray-900">
                                        {seller.averageRating || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500">Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-900">{seller.ordersCount || 0}</div>
                                    <div className="text-xs text-gray-500">Orders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop View - Original Code */}
                <div className="hidden md:block">
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="flex gap-8">
                            {/* Left Side - Profile Image */}
                            <div>
                                <img 
                                    src={seller.profileImage || '/default-shop.png'} 
                                    alt={seller.shopName}
                                    className="w-40 h-40 object-contain border border-black rounded-sm"
                                />
                            </div>
                            
                            {/* Right Side - Shop Info */}
                            <div className="flex-1">
                                {/* Shop Name */}
                                <h1 className="text-2xl font-bold text-blue-600">
                                    {seller.shopName}
                                </h1>
                                <div className="h-0.5 w-24 bg-blue-600 mt-1 mb-6"></div>

                                {/* Business Type */}
                                <div className="flex items-center mb-4">
                                    <FaStore className="text-blue-600 w-5 h-5" />
                                    <div className="ml-3">
                                        <div className="text-gray-600">Business Type</div>
                                        <div className="text-gray-900">{seller.businessType || 'other'}</div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="text-red-500 w-5 h-5" />
                                    <div className="ml-3">
                                        <div className="text-gray-600">Location</div>
                                        <div className="text-gray-900">{seller.city}, {seller.state}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats - Right Aligned */}
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">4</div>
                                    <div className="text-gray-600">Products</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">N/A</div>
                                    <div className="text-gray-600">Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">4</div>
                                    <div className="text-gray-600">Orders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                            <FaShoppingBag className="text-blue-600 w-4 h-4" />
                            <h2 className="text-lg font-bold text-gray-900">Products</h2>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map(product => (
                            <div 
                                key={product._id} 
                                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                <div className="relative w-full pt-[100%] bg-gray-50 rounded-t-xl overflow-hidden border-b border-gray-200">
                                    <img 
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">₹{product.price}</div>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <FaBox className="w-3.5 h-3.5 mr-1" />
                                                <span>{product.stock} in stock</span>
                                            </div>
                                        </div>
                                        <div>
                                            {product.rating ? (
                                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                                                    <FaStar className="text-yellow-400 w-3.5 h-3.5" />
                                                    <span className="ml-1 text-sm font-medium">{product.rating.toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span className="bg-blue-50 text-blue-600 text-sm font-medium px-2 py-1 rounded-full border border-blue-100">New</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerProfile;