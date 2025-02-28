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

//   const fetchOrders = async () => {
//     try {
//       const response = await axios.get('/api/orders');
//       setOrders(response.data.orders);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch orders');
//       setLoading(false);
//     }
//   };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No orders found</p>
          <Link 
            to="/products" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden border
                ${order.status === 'completed' ? 
                  'bg-gray-10 border-gray-200 opacity-60' : 
                  'bg-white border-transparent'}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold 
                      ${order.status === 'completed' ? 'text-gray-700' : 'text-gray-900'}`}>
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium
                    ${order.status === 'completed' ? 
                      'bg-green-100 text-green-700' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 border-b pb-4
                        ${order.status === 'completed' ? 
                          'border-gray-200' : 'border-gray-100'}`}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className={`w-20 h-20 object-cover rounded
                          ${order.status === 'completed' ? 'opacity-80' : ''}`}
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium
                          ${order.status === 'completed' ? 'text-gray-600' : 'text-gray-900'}`}>
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ₹{item.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          Seller: {item.seller.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 flex justify-between items-center border-t pt-4
                  ${order.status === 'completed' ? 'border-gray-200' : 'border-gray-100'}`}>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className={`text-xl font-bold
                      ${order.status === 'completed' ? 'text-gray-600' : 'text-gray-900'}`}>
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
      )}
    </div>
  );
};

export default Orders;