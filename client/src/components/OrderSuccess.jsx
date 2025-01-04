import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccess = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. We'll send you an email with your order details.
        </p>
        <div className="space-y-4">
          <Link
            to="/products"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="block w-full px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;