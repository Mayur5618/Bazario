import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const RecentlyViewed = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useSelector((state) => state.user);

    useEffect(() => {
        fetchRecentlyViewed();
    }, [userData]);

    const fetchRecentlyViewed = async () => {
        if (!userData) {
            setProducts([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get('/api/recently-viewed/get', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching recently viewed products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!userData || products.length === 0) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
                {products.length > 0 && (
                    <button
                        onClick={async () => {
                            try {
                                await axios.delete('/api/recently-viewed/clear', {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });
                                setProducts([]);
                            } catch (error) {
                                console.error('Error clearing recently viewed:', error);
                            }
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((item) => (
                    <Link
                        key={`${item.product._id}-${item.viewedAt}`}
                        to={`/product/${item.product._id}`}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-square">
                            <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-2">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                {item.product.name}
                            </h3>
                            <div className="flex items-center mt-1">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`w-3 h-3 ${
                                                star <= item.product.rating ? "text-yellow-400" : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="ml-1 text-xs text-gray-500">
                                    ({item.product.reviews?.length || 0})
                                </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-base font-bold text-gray-900">
                                    ₹{item.product.price}
                                </span>
                                <span className="text-xs text-gray-500">
                                    per {item.product.unitType || 'piece'}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
