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
            {/* Header with Navigation */}
            

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Seller Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-start gap-8">
                        {/* Profile Image */}
                        <div className="relative">
                            <img 
                                src={seller.profileImage || '/default-shop.png'} 
                                alt={seller.shopName}
                                className="w-48 h-48 rounded-lg object-cover"
                            />
                           
                        </div>

                        {/* Business Info */}
                        <div className="flex-1">
                            <div className="mb-6">
                                <div className="relative mb-6">
                                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                                        {seller.shopName}
                                    </h1>
                                    <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-2"></div>
                                </div>
                                <div className="flex items-center mb-4">
                                    <FaStore className="text-blue-600 text-xl mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Business Type</h3>
                                        <p className="text-gray-600">{seller.businessType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="text-red-500 text-xl mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Location</h3>
                                        <p className="text-gray-600">{seller.city}, {seller.state}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600">{seller.productsCount || 0}</div>
                                <div className="text-gray-600 mt-1">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-600">
                                    {seller.averageRating || 'N/A'}
                                </div>
                                <div className="text-gray-600 mt-1">Rating</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-600">{seller.ordersCount || 0}</div>
                                <div className="text-gray-600 mt-1">Orders</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <FaShoppingBag className="text-blue-600 mr-2" />
                        Products
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div 
                                key={product._id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                <div className="aspect-w-16 aspect-h-12 bg-gray-50 relative">
                                    <img 
                                        src={product.youtubeLink ? 
                                            `https://img.youtube.com/vi/${getYoutubeVideoId(product.youtubeLink)}/hqdefault.jpg` 
                                            : product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4"
                                    />
                                    {product.youtubeLink && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                                                <FaPlay className="text-white text-xl ml-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                                        {product.rating ? (
                                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                                                <FaStar className="text-yellow-400 mr-1" />
                                                <span>{product.rating.toFixed(1)}</span>
                                            </div>
                                        ) : (
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm">New</span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FaBox className="mr-2" />
                                        <span>{product.stock} in stock</span>
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