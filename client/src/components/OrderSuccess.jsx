// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaCheckCircle } from 'react-icons/fa';

// const OrderSuccess = () => {
//   return (
//     <div className="container mx-auto px-4 py-16">
//       <div className="max-w-md mx-auto text-center">
//         <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
//         <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
//         <p className="text-gray-600 mb-8">
//           Thank you for your purchase. We'll send you an email with your order details.
//         </p>
//         <div className="space-y-4">
//           <Link
//             to="/products"
//             className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Continue Shopping
//           </Link>
//           <Link
//             to="/orders"
//             className="block w-full px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
//           >
//             View Orders
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderSuccess;

import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
    const { orderId } = useParams();

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                    >
                        <FaCheckCircle className="mx-auto h-20 w-20 text-green-500" />
                    </motion.div>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Order Placed Successfully!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your order has been placed and will be delivered soon.
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 space-y-6"
                >
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Order ID:</p>
                        <p className="font-mono text-sm sm:text-xl break-all">{orderId}</p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to={`/orders/${orderId}`}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                        >
                            <FaBox />
                            <span>View Order Details</span>
                        </Link>
                        
                        <Link
                            to="/"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            <FaHome />
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center text-sm text-gray-500"
                >
                    <p>We'll send you an email with your order details and tracking information.</p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;