import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FaBox, FaTruck, FaCheck, FaTimes } from 'react-icons/fa';
import { orderService } from './services/orderService';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders', {
        withCredentials: true
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    
    if (!finalReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const response = await axios.put(`/api/orders/cancel/${selectedOrderId}`, {
        reason: finalReason
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setCancelReason('');
        setCustomReason('');
        setSelectedOrderId(null);
        fetchOrders(); // Refresh orders list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaBox />;
      case 'processing':
      case 'shipped':
        return <FaTruck />;
      case 'delivered':
        return <FaCheck />;
      default:
        return null;
    }
  };

  // Modified groupOrdersByDateAndStatus function
  const groupOrdersByDateAndStatus = (orders) => {
    const groups = {
      pending: {},
      cancelled: {},
      completed: {}
    };
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      let statusGroup;
      
      // Group by status
      if (order.status === 'pending' || order.status === 'processing' || order.status === 'shipped') {
        statusGroup = 'pending';
      } else if (order.status === 'cancelled') {
        statusGroup = 'cancelled';
      } else {
        statusGroup = 'completed';
      }
      
      if (!groups[statusGroup][date]) {
        groups[statusGroup][date] = [];
      }
      groups[statusGroup][date].push(order);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedOrders = groupOrdersByDateAndStatus(orders);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">View and manage all your orders</p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaBox className="mr-2 text-sm sm:text-base" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm">
            <FaBox className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
            <p className="mt-4 text-lg sm:text-xl font-semibold text-gray-600">No orders found</p>
            <p className="mt-2 text-sm sm:text-base text-gray-500">Looks like you haven't placed any orders yet</p>
            <Link 
              to="/" 
              className="mt-4 sm:mt-6 inline-block px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Pending Orders */}
            {Object.keys(groupedOrders.pending).length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-blue-600 flex items-center">
                  <FaTruck className="mr-2 text-base sm:text-lg" />
                  Active Orders
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(groupedOrders.pending).map(([date, dateOrders]) => (
                    <div key={date}>
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
                        {new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {dateOrders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden border border-transparent"
                          >
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-4">
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Order #{order._id.slice(-8)}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                                  </p>
                                </div>
                                <div className={`self-start sm:self-auto px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </div>

                              <div className="space-y-3 sm:space-y-4">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start sm:items-center gap-3 sm:gap-4 border-b pb-3 sm:pb-4 border-gray-100"
                                  >
                                    <img
                                      src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                                      alt={item.product?.name || 'Product'}
                                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                        {item.product?.name || 'Product Unavailable'}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Quantity: {item.quantity} × ₹{item.price}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-500">
                                        Seller: {item.seller?.firstname || ''} {item.seller?.lastname || ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 border-t pt-4 border-gray-100">
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
                                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                                    ₹{order.total}
                                  </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                                  <Link
                                    to={`/orders/${order._id}`}
                                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 text-center"
                                  >
                                    View Details
                                  </Link>
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-center"
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Orders */}
            {Object.keys(groupedOrders.cancelled).length > 0 && (
              <div className="mt-8 sm:mt-12">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-red-600 flex items-center">
                  <FaTimes className="mr-2 text-base sm:text-lg" />
                  Cancelled Orders
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(groupedOrders.cancelled).map(([date, dateOrders]) => (
                    <div key={date}>
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
                        {new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {dateOrders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 opacity-80"
                          >
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-4">
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                                    Order #{order._id.slice(-8)}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                                  </p>
                                </div>
                                <div className={`self-start sm:self-auto px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </div>

                              <div className="space-y-3 sm:space-y-4">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start sm:items-center gap-3 sm:gap-4 border-b pb-3 sm:pb-4 border-gray-200"
                                  >
                                    <img
                                      src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                                      alt={item.product?.name || 'Product'}
                                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded opacity-80"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm sm:text-base font-medium text-gray-600 truncate">
                                        {item.product?.name || 'Product Unavailable'}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Quantity: {item.quantity} × ₹{item.price}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-500">
                                        Seller: {item.seller?.firstname || ''} {item.seller?.lastname || ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 border-t pt-4 border-gray-200">
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
                                  <p className="text-lg sm:text-xl font-bold text-gray-600">
                                    ₹{order.total}
                                  </p>
                                </div>
                                <div>
                                  <Link
                                    to={`/orders/${order._id}`}
                                    className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 text-center block"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {Object.keys(groupedOrders.completed).length > 0 && (
              <div className="mt-8 sm:mt-12">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-green-600 flex items-center">
                  <FaCheck className="mr-2 text-base sm:text-lg" />
                  Completed Orders
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(groupedOrders.completed).map(([date, dateOrders]) => (
                    <div key={date}>
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
                        {new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {dateOrders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 opacity-80"
                          >
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-4">
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                                    Order #{order._id.slice(-8)}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                                  </p>
                                </div>
                                <div className={`self-start sm:self-auto px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </div>

                              <div className="space-y-3 sm:space-y-4">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start sm:items-center gap-3 sm:gap-4 border-b pb-3 sm:pb-4 border-gray-200"
                                  >
                                    <img
                                      src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                                      alt={item.product?.name || 'Product'}
                                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded opacity-80"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm sm:text-base font-medium text-gray-600 truncate">
                                        {item.product?.name || 'Product Unavailable'}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Quantity: {item.quantity} × ₹{item.price}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-500">
                                        Seller: {item.seller?.firstname || ''} {item.seller?.lastname || ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 border-t pt-4 border-gray-200">
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
                                  <p className="text-lg sm:text-xl font-bold text-gray-600">
                                    ₹{order.total}
                                  </p>
                                </div>
                                <div>
                                  <Link
                                    to={`/orders/${order._id}`}
                                    className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 text-center block"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
                  setSelectedOrderId(null);
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
                  setSelectedOrderId(null);
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

export default Orders;