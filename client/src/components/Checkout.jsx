// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import { useCart } from '../context/CartContext';
// // import { useCart } from '../components/CartContext';
// import { toast } from 'react-hot-toast';
// import { orderService } from './services/orderService';

// const Checkout = () => {
//   const navigate = useNavigate();
//   const { cart, getCartTotal, clearCart } = useCart();
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
  
//   const [formData, setFormData] = useState({
//     shippingAddress: {
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       street: '',
//       city: '',
//       state: '',
//       pincode: '',
//       country: 'India'
//     },
//     paymentMethod: 'COD' // or 'online'
//   });

//   // Redirect if cart is empty
//   React.useEffect(() => {
//     if (cart.length === 0) {
//       navigate('/cart');
//       toast.error('Your cart is empty');
//     }
//   }, [cart, navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const validateShippingDetails = () => {
//     const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
//     for (let field of required) {
//       if (!formData[field]) {
//         toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
//         return false;
//       }
//     }
//     // Basic email validation
//     if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       toast.error('Please enter a valid email address');
//       return false;
//     }
//     // Basic phone validation
//     if (!/^\d{10}$/.test(formData.phone)) {
//       toast.error('Please enter a valid 10-digit phone number');
//       return false;
//     }
//     return true;
//   };

//   const validatePaymentDetails = () => {
//     const required = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
//     for (let field of required) {
//       if (!formData[field]) {
//         toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
//         return false;
//       }
//     }
//     // Basic card number validation
//     if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
//       toast.error('Please enter a valid 16-digit card number');
//       return false;
//     }
//     // Basic CVV validation
//     if (!/^\d{3,4}$/.test(formData.cvv)) {
//       toast.error('Please enter a valid CVV');
//       return false;
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (step === 1 && validateShippingDetails()) {
//       setStep(2);
//     }
//   };

//   const handleBack = () => {
//     setStep(1);
//   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     if (!validatePaymentDetails()) {
// //       return;
// //     }

// //     try {
// //       // Here you would typically make an API call to process the order
// //       const orderData = {
// //         items: cart,
// //         totalAmount: getCartTotal(),
// //         shippingDetails: {
// //           firstName: formData.firstName,
// //           lastName: formData.lastName,
// //           email: formData.email,
// //           phone: formData.phone,
// //           address: formData.address,
// //           city: formData.city,
// //           state: formData.state,
// //           pincode: formData.pincode,
// //         },
// //         // In a real application, you would handle payment details securely
// //         // and probably use a payment gateway
// //       };

// //       // Simulate API call
// //       await new Promise(resolve => setTimeout(resolve, 1500));

// //       // Clear cart and redirect to success page
// //       clearCart();
// //       navigate('/order-success');
// //       toast.success('Order placed successfully!');
// //     } catch (error) {
// //       toast.error('Failed to place order. Please try again.');
// //     }
// //   };

// const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const orderData = {
//         ...formData,
//         items: cart.map(item => ({
//           product: item.productId,
//           quantity: item.quantity,
//           price: item.price
//         }))
//       };

//       const response = await orderService.createOrder(orderData);
//       clearCart();
//       toast.success('Order placed successfully!');
//       navigate(`/order-success/${response.orders[0].orderId}`);
//     } catch (error) {
//       toast.error(error.message || 'Failed to place order');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Progress Steps */}
//       <div className="flex items-center justify-center mb-8">
//         <div className={`h-1 w-32 ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
//         <div className={`h-1 w-32 ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
//       </div>

//       <div className="max-w-3xl mx-auto">
//         <form onSubmit={handleSubmit}>
//           {step === 1 ? (
//             /* Shipping Details Form */
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h2 className="text-2xl font-semibold mb-6">Shipping Details</h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     First Name
//                   </label>
//                   <input
//                     type="text"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Last Name
//                   </label>
//                   <input
//                     type="text"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address
//                   </label>
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     rows="3"
//                     className="w-full px-3 py-2 border rounded-md"
//                   ></textarea>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     State
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Pincode
//                   </label>
//                   <input
//                     type="text"
//                     name="pincode"
//                     value={formData.pincode}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <button
//                   type="button"
//                   onClick={handleNext}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           ) : (
//             /* Payment Details Form */
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h2 className="text-2xl font-semibold mb-6">Payment Details</h2>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Card Number
//                   </label>
//                   <input
//                     type="text"
//                     name="cardNumber"
//                     value={formData.cardNumber}
//                     onChange={handleInputChange}
//                     placeholder="1234 5678 9012 3456"
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Cardholder Name
//                   </label>
//                   <input
//                     type="text"
//                     name="cardName"
//                     value={formData.cardName}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border rounded-md"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Expiry Date
//                     </label>
//                     <input
//                       type="text"
//                       name="expiryDate"
//                       value={formData.expiryDate}
//                       onChange={handleInputChange}
//                       placeholder="MM/YY"
//                       className="w-full px-3 py-2 border rounded-md"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       CVV
//                     </label>
//                     <input
//                       type="password"
//                       name="cvv"
//                       value={formData.cvv}
//                       onChange={handleInputChange}
//                       maxLength="4"
//                       className="w-full px-3 py-2 border rounded-md"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Order Summary */}
//               <div className="mt-8 border-t pt-6">
//                 <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
//                 <div className="space-y-2">
//                   {cart.map(item => (
//                     <div key={item.productId} className="flex justify-between">
//                       <span>{item.name} x {item.quantity}</span>
//                       <span>₹{(item.price * item.quantity).toFixed(2)}</span>
//                     </div>
//                   ))}
//                   <div className="border-t pt-2 font-semibold">
//                     <div className="flex justify-between">
//                       <span>Total</span>
//                       <span>₹{getCartTotal().toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-between">
//                 <button
//                   type="button"
//                   onClick={handleBack}
//                   className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 >
//                   Place Order
//                 </button>
//               </div>
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
// import { selectCartItems, selectCartTotal, clearCart } from '../store/cartSlice';
// import {cartRemove, cartAdd, cartItemRemove, cartEmpty} from '../store/cartSlice';
import { selectCartItems, selectCartTotal, clearCart } from '../store/cartSlice';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const { userData } = useSelector((state) => state.user);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shippingAddress: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    paymentMethod: 'COD'
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      toast.error('Your cart is empty');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value
      }
    }));
  };

  const validateShippingDetails = () => {
    const { shippingAddress } = formData;
    const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'pincode'];
    
    for (let field of required) {
      if (!shippingAddress[field]) {
        toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Basic phone validation
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateShippingDetails()) {
      setStep(2);
    }
  };

  // const handleBack = () => {
  //   setStep(1);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const orderData = {
  //       items: cart.map(item => ({
  //         product: item.product._id,
  //         quantity: item.quantity,
  //         price: item.product.price
  //       })),
  //       shippingAddress: formData.shippingAddress,
  //       paymentMethod: formData.paymentMethod,
  //       totalAmount: cartTotal
  //     };

  //     const response = await orderService.createOrder(orderData);
  //     dispatch(clearCart());
  //     toast.success('Order placed successfully!');
  //     navigate(`/order-success/${response.orderId}`);
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Failed to place order');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handlePlaceOrder = async (e) => {
  //   e.preventDefault();
    
  //   try {
  //     const response = await axios.post('/api/orders/create', {
  //       shippingAddress: formData.shippingAddress,
  //       paymentMethod: formData.paymentMethod,
  //       items: cartItems.map(item => ({
  //         product: item.product._id,
  //         quantity: item.quantity,
  //         price: item.price
  //       })),
  //       totalAmount: cartTotal
  //     }, {
  //       withCredentials: true,
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (response.data.success) {
  //       toast.success('Order placed successfully!');
  //       // Clear cart after successful order
  //       dispatch(clearCart());
  //       navigate(`/orders/${response.data.order._id}`);
  //     }
  //   } catch (error) {
  //     console.error('Order creation error:', error);
  //     toast.error(error.response?.data?.message || 'Failed to place order');
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (step === 1) {
  //     if (validateShippingDetails()) {
  //       setStep(2);
  //     }
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await axios.post('/api/orders/create', {
  //       shippingAddress: {
  //         ...formData.shippingAddress,
  //         fullName: `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`
  //       },
  //       paymentMethod: formData.paymentMethod,
  //       items: cartItems.map(item => ({
  //         product: item.product._id,
  //         quantity: item.quantity,
  //         price: item.product.price,
  //         seller: item.seller._id
  //       })),
  //       totalAmount: cartTotal
  //     }, {
  //       withCredentials: true,
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (response.data.success) {
  //       // Clear cart after successful order
  //       dispatch(clearCart());
  //       toast.success('Order placed successfully!');
  //       navigate(`/orders/${response.data.orders[0]._id}`); // Navigate to first order
  //     }
  //   } catch (error) {
  //     console.error('Order creation error:', error);
  //     toast.error(error.response?.data?.message || 'Failed to place order');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
        if (validateShippingDetails()) {
            setStep(2);
        }
        return;
    }

    setLoading(true);

    try {
        const response = await axios.post('/api/orders/create', {
            shippingAddress: formData.shippingAddress,
            paymentMethod: formData.paymentMethod,
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            dispatch(clearCart());
            toast.success('Order placed successfully!');
            // Navigate to the first order's detail page
             // Get the order ID from the first order
             const orderId = response.data.orders[0]._id;
            
             // Store order details in localStorage if needed
             localStorage.setItem('lastOrderId', orderId);
             
             // Navigate to order success page or order details page
             navigate(`/order-success/${orderId}`);
        }
    } catch (error) {
        console.error('Order creation error:', error);
        toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
        setLoading(false);
    }
};

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className={`h-1 w-32 ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`h-1 w-32 ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            /* Shipping Details Form */
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Shipping Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.shippingAddress.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.shippingAddress.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.shippingAddress.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <textarea
                    name="street"
                    value={formData.shippingAddress.street}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.shippingAddress.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            /* Payment Method and Order Summary */
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paymentMethod: e.target.value
                    }))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="cod">Cash on Delivery</label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.product._id} className="flex justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-md text-white transition-colors ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;