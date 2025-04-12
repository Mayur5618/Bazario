import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`/api/orders/${id}`, {
                withCredentials: true
            });

            if (response.data.success) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = () => {
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
        
        if (!finalReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            const response = await axios.put(`/api/orders/cancel/${id}`, {
                reason: finalReason
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('Order cancelled successfully');
                setShowCancelModal(false);
                setCancelReason('');
                setCustomReason('');
                navigate('/orders'); // Navigate to orders page after successful cancellation
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!order) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Order not found</p>
                <Link to="/orders" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">Order Details</h1>
                    <Link 
                        to="/orders" 
                        className="text-blue-600 hover:text-blue-700 text-sm sm:text-base"
                    >
                        ← Back to Orders
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold mb-2">Order Information</h2>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                <span className="inline-block w-20 sm:w-24">Order ID:</span> 
                                <span className="font-medium">{order._id}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                <span className="inline-block w-20 sm:w-24">Date:</span>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                                <span className="inline-block w-20 sm:w-24">Status:</span>
                                <span className="font-medium capitalize">{order.status}</span>
                            </p>
                        </div>
                        <div className="border-t sm:border-t-0 pt-4 sm:pt-0">
                            <h2 className="text-base sm:text-lg font-semibold mb-2">Shipping Address</h2>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">{order.shippingAddress.fullName}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">{order.shippingAddress.street}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4 sm:pt-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b pb-4"
                                >
                                    <img 
                                        src={item.product.images[0]} 
                                        alt={item.product.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-sm sm:text-base font-medium mb-1">{item.product.name}</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs sm:text-sm text-gray-600">
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ₹{item.price.toFixed(2)}</p>
                                            <p className="col-span-2">Seller: {item.seller.firstname} {item.seller.lastname}</p>
                                        </div>
                                    </div>
                                    <div className="text-right mt-2 sm:mt-0">
                                        <p className="text-sm sm:text-base font-medium">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span>₹{order.shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base sm:text-lg font-semibold border-t pt-2">
                                <span>Total</span>
                                <span>₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {order.status === 'pending' && (
                        <div className="mt-4 sm:mt-6 text-right">
                            <button
                                onClick={handleCancelOrder}
                                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                            >
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Cancel Order</h3>
                            <button 
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setCustomReason('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Please provide a reason for cancellation
                            </label>
                            <select
                                value={cancelReason}
                                onChange={(e) => {
                                    setCancelReason(e.target.value);
                                    if (e.target.value !== 'Other') {
                                        setCustomReason('');
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a reason</option>
                                <option value="Changed my mind">Changed my mind</option>
                                <option value="Found better price elsewhere">Found better price elsewhere</option>
                                <option value="Ordered by mistake">Ordered by mistake</option>
                                <option value="Shipping time too long">Shipping time too long</option>
                                <option value="Other">Other</option>
                            </select>
                            
                            {cancelReason === 'Other' && (
                                <textarea
                                    placeholder="Please specify your reason"
                                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    rows="3"
                                />
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setCustomReason('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;