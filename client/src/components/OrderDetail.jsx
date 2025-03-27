// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// // import { format } from 'date-fns';
// import { format } from 'date-fns';
// import { FaBox, FaTruck, FaCheck, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';

// const OrderDetail = () => {
//   const { id } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchOrderDetails();
//   }, [id]);

//   const fetchOrderDetails = async () => {
//     try {
//       const response = await axios.get(`/api/orders/${id}`);
//       setOrder(response.data.order);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch order details');
//       setLoading(false);
//     }
//   };

//   const getStatusSteps = () => {
//     const steps = [
//       { status: 'pending', label: 'Order Placed', icon: FaBox },
//       { status: 'processing', label: 'Processing', icon: FaBox },
//       { status: 'shipped', label: 'Shipped', icon: FaTruck },
//       { status: 'delivered', label: 'Delivered', icon: FaCheck }
//     ];

//     const currentStepIndex = steps.findIndex(step => step.status === order.status);

//     return steps.map((step, index) => ({
//       ...step,
//       completed: index <= currentStepIndex,
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center text-red-600">
//           <p className="text-xl font-semibold mb-4">{error}</p>
//           <button
//             onClick={fetchOrderDetails}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-bold">
//             Order Details #{order._id.slice(-8)}
//           </h1>
//           <Link
//             to="/orders"
//             className="text-blue-600 hover:text-blue-800"
//           >
//             Back to Orders
//           </Link>
//         </div>

//         {/* Order Status Timeline */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-lg font-semibold mb-4">Order Status</h2>
//           <div className="flex justify-between items-center">
//             {getStatusSteps().map((step, index) => (
//               <div key={step.status} className="flex flex-col items-center">
//                 <div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                     step.completed ? 'bg-blue-600 text-white' : 'bg-gray-200'
//                   }`}
//                 >
//                   <step.icon />
//                 </div>
//                 <p className="text-sm mt-2">{step.label}</p>
//                 {index < getStatusSteps().length - 1 && (
//                   <div
//                     className={`h-1 w-24 ${
//                       step.completed ? 'bg-blue-600' : 'bg-gray-200'
//                     }`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Shipping Details */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-start gap-2">
//               <FaUser className="mt-1 text-gray-600" />
//               <div>
//                 <p className="font-medium">
//                   {order.shippingDetails.firstName} {order.shippingDetails.lastName}
//                 </p>
//                 <p className="text-gray-600">{order.shippingDetails.email}</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-2">
//               <FaPhone className="mt-1 text-gray-600" />
//               <p>{order.shippingDetails.phone}</p>
//             </div>
//             <div className="flex items-start gap-2 md:col-span-2">
//               <FaMapMarkerAlt className="mt-1 text-gray-600" />
//               <div>
//                 <p>{order.shippingDetails.address}</p>
//                 <p>
//                   {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.pincode}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Order Items */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold mb-4">Order Items</h2>
//           <div className="space-y-4">
//             {order.items.map((item) => (
//               <div
//                 key={item.productId}
//                 className="flex items-center gap-4 border-b pb-4"
//               >
//                 <img
//                   src={item.image}
//                   alt={item.name}
//                   className="w-16 h-16 object-cover rounded"
//                 />
//                 <div className="flex-1">
//                   <h4 className="font-medium">{item.name}</h4>
//                   <p className="text-sm text-gray-600">
//                     Quantity: {item.quantity}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Price: ₹{item.price} per {item.unitType}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-medium">
//                     ₹{(item.price * item.quantity).toFixed(2)}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 border-t pt-4">
//             <div className="flex justify-between items-center">
//               <p className="font-medium">Total Amount</p>
//               <p className="text-2xl font-bold">₹{order.totalAmount.toFixed(2)}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetail;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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
                                onClick={() => handleCancelOrder(order._id)}
                                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                            >
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;