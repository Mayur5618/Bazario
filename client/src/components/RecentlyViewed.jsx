import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const productCardVariants = {
    hidden: { 
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
        }
    },
    hover: {
        y: -5,
        scale: 1.02,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    }
};

const RecentlyViewed = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useSelector((state) => state.user);
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    useEffect(() => {
        fetchRecentlyViewed();
    }, [userData]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                setShowLeftArrow(scrollLeft > 0);
                setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            handleScroll();
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [products]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

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
        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Recently Viewed Products</h2>
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

            <div className="relative">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
                    >
                        <FaChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
                    >
                        <FaChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                <div 
                    ref={scrollContainerRef}
                    className="overflow-x-auto hide-scrollbar px-4"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex gap-4"
                    >
                        {products.map((item) => (
                            <motion.div
                                key={`${item.product._id}-${item.viewedAt}`}
                                variants={productCardVariants}
                                whileHover="hover"
                                className="cursor-pointer w-[225px] flex-shrink-0"
                            >
                                <Link to={`/product/${item.product._id}`}>
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                                        <div className="relative pt-[100%] overflow-hidden rounded-t-lg">
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-2 flex flex-col flex-grow">
                                            <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                                                {item.product.name}
                                            </h3>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-base font-bold">₹{item.product.price}</span>
                                                    <span className="text-xs text-gray-500">per {item.product.unitType || 'piece'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, index) => (
                                                        <FaStar
                                                            key={index}
                                                            className={`w-3 h-3 ${
                                                                index < (item.product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    ({item.product.reviews?.length || 0})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className={`font-medium ${item.product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                                <span className="text-gray-500">Stock: {item.product.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RecentlyViewed;
