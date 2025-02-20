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

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccess = () => {
    const { orderId } = useParams();

    return (
        <div className="min-h-[90vh] bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Order Placed Successfully!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your order has been placed and will be delivered soon.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="border-t border-b py-4">
                        <p className="text-sm text-gray-600">Order ID:</p>
                        <p className="font-medium">{orderId}</p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to={`/orders/${orderId}`}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            View Order Details
                        </Link>
                        
                        <Link
                            to="/"
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;