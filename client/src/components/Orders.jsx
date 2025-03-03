import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FaBox, FaTruck, FaCheck } from 'react-icons/fa';
import { orderService } from './services/orderService';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders(); // Refresh orders list
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
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

  // Group orders by date and status
  const groupOrdersByDateAndStatus = (orders) => {
    const groups = {
      pending: {},
      completed: {}
    };
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const status = order.status === 'completed' ? 'completed' : 'pending';
      
      if (!groups[status][date]) {
        groups[status][date] = [];
      }
      groups[status][date].push(order);
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-1 text-sm text-gray-500">View and manage all your orders</p>
            </div>
            <Link 
              to="/products" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaBox className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <FaBox className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-xl font-semibold text-gray-600">No orders found</p>
            <p className="mt-2 text-gray-500">Looks like you haven't placed any orders yet</p>
            <Link 
              to="/products" 
              className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders */}
            {Object.keys(groupedOrders.pending).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-6 text-blue-600 flex items-center">
                  <FaTruck className="mr-2" />
                  Active Orders
                </h2>
                <div className="space-y-6">
                  {Object.entries(groupedOrders.pending).map(([date, dateOrders]) => (
                    <div key={date}>
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">
                        {new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-4">
                        {dateOrders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden border border-transparent"
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Order #{order._id.slice(-8)}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </div>

                              <div className="space-y-4">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-4 border-b pb-4 border-gray-100"
                                  >
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">
                                        {item.product.name}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        Quantity: {item.quantity} × ₹{item.price}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Seller: {item.seller.firstname} {item.seller.lastname}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex justify-between items-center border-t pt-4 border-gray-100">
                                <div>
                                  <p className="text-sm text-gray-500">Total Amount</p>
                                  <p className="text-xl font-bold text-gray-900">
                                    ₹{order.total}
                                  </p>
                                </div>
                                <div className="space-x-4">
                                  <Link
                                    to={`/orders/${order._id}`}
                                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded font-medium hover:bg-blue-50"
                                  >
                                    View Details
                                  </Link>
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
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

            {/* Completed Orders */}
            {Object.keys(groupedOrders.completed).length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-6 text-green-600">Completed Orders</h2>
                <div className="space-y-6">
                  {Object.entries(groupedOrders.completed).map(([date, dateOrders]) => (
                    <div key={date}>
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">
                        {new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-4">
                        {dateOrders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 opacity-80"
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-700">
                                    Order #{order._id.slice(-8)}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </div>

                              <div className="space-y-4">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-4 border-b pb-4 border-gray-200"
                                  >
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      className="w-20 h-20 object-cover rounded opacity-80"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-600">
                                        {item.product.name}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        Quantity: {item.quantity} × ₹{item.price}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Seller: {item.seller.firstname} {item.seller.lastname}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex justify-between items-center border-t pt-4 border-gray-200">
                                <div>
                                  <p className="text-sm text-gray-500">Total Amount</p>
                                  <p className="text-xl font-bold text-gray-600">
                                    ₹{order.total}
                                  </p>
                                </div>
                                <div>
                                  <Link
                                    to={`/orders/${order._id}`}
                                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded font-medium hover:bg-blue-50"
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
    </div>
  );
};

export default Orders;