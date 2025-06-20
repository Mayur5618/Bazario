// // // import React, { createContext, useContext, useReducer, useEffect } from 'react';
// // // import { useAuth } from './AuthContext';

// // // const CartContext = createContext();

// // // const cartReducer = (state, action) => {
// // //   switch (action.type) {
// // //     case 'SET_CART':
// // //       return {
// // //         ...state,
// // //         items: action.payload
// // //       };
// // //     case 'CLEAR_CART':
// // //       return {
// // //         ...state,
// // //         items: []
// // //       };
// // //     // ... other cases
// // //   }
// // // };



// // // export const CartProvider = ({ children }) => {
// // //   const { user } = useAuth();
// // //   const [state, dispatch] = useReducer(cartReducer, {
// // //     items: []
// // //   });

// // //   // Fetch cart when user logs in
// // //   useEffect(() => {
// // //     const fetchCart = async () => {
// // //       if (user) {
// // //         try {
// // //           const response = await axios.get('/api/cart');
// // //           dispatch({ type: 'SET_CART', payload: response.data.cart.items });
// // //         } catch (error) {
// // //           console.error('Error fetching cart:', error);
// // //         }
// // //       } else {
// // //         // Clear cart when user logs out
// // //         dispatch({ type: 'CLEAR_CART' });
// // //       }
// // //     };

// // //     fetchCart();
// // //   }, [user]);

// // //   const addToCart = async (product, quantity) => {
// // //     if (!user) {
// // //       // Redirect to login or show login prompt
// // //       toast.error('Please login to add items to cart');
// // //       return;
// // //     }

// // //     try {
// // //       const response = await axios.post('/api/cart/add', {
// // //         productId: product._id,
// // //         quantity
// // //       });
// // //       dispatch({ type: 'SET_CART', payload: response.data.cart.items });
// // //       toast.success('Added to cart successfully!');
// // //     } catch (error) {
// // //       toast.error(error.response?.data?.message || 'Failed to add to cart');
// // //     }
// // //   };

// // //   const removeFromCart = async (productId) => {
// // //     if (!user) return;

// // //     try {
// // //       await axios.delete(`/api/cart/remove/${productId}`);
// // //       dispatch({ type: 'SET_CART', payload: response.data.cart.items });
// // //     } catch (error) {
// // //       toast.error('Failed to remove item from cart');
// // //     }
// // //   };

// // //   const clearCart = async () => {
// // //     if (!user) return;

// // //     try {
// // //       await axios.delete('/api/cart/clear');
// // //       dispatch({ type: 'CLEAR_CART' });
// // //     } catch (error) {
// // //       toast.error('Failed to clear cart');
// // //     }
// // //   };

// // //   const updateQuantity = async (productId, quantity) => {
// // //     if (!user) return;

// // //     try {
// // //       const response = await axios.put(`/api/cart/update/${productId}`, {
// // //         quantity
// // //       });
// // //       dispatch({ type: 'SET_CART', payload: response.data.cart.items });
// // //     } catch (error) {
// // //       toast.error('Failed to update quantity');
// // //     }
// // //   };



// // //   return (
// // //     <CartContext.Provider
// // //       value={{
// // //         cart: state.items,
// // //         addToCart,
// // //         removeFromCart,
// // //         clearCart,
// // //         updateQuantity
// // //       }}
// // //     >
// // //       {children}
// // //     </CartContext.Provider>
// // //   );
// // // };

// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { toast } from 'react-hot-toast';
// // import { useAuth } from './AuthContext';

// // // Create context
// // const CartContext = createContext();

// // // Custom hook to use cart context
// // export const useCart = () => {
// //   const context = useContext(CartContext);
// //   if (!context) {
// //     throw new Error('useCart must be used within a CartProvider');
// //   }
// //   return context;
// // };

// // // Cart provider component
// // export const CartProvider = ({ children }) => {
// //   const [cart, setCart] = useState([]);
// //   const { user } = useAuth();

// //   // Fetch cart when user logs in
// //   useEffect(() => {
// //     if (user) {
// //       fetchCart();
// //     } else {
// //       setCart([]); // Clear cart when user logs out
// //     }
// //   }, [user]);

// //   // Fetch cart items
// //   const fetchCart = async () => {
// //     try {
// //       const response = await axios.get('/api/cart');
// //       setCart(response.data.cart.items || []);
// //     } catch (error) {
// //       console.error('Error fetching cart:', error);
// //     }
// //   };

// //   // Add item to cart
// //   const addToCart = async (product, quantity) => {
// //     if (!user) {
// //       toast.error('Please login to add items to cart');
// //       return;
// //     }

// //     try {
// //       const response = await axios.post('/api/cart/add', {
// //         productId: product._id,
// //         quantity
// //       });
// //       setCart(response.data.cart.items);
// //       toast.success('Added to cart successfully!');
// //     } catch (error) {
// //       toast.error(error.response?.data?.message || 'Failed to add to cart');
// //     }
// //   };

// //   // Remove item from cart
// //   const removeFromCart = async (productId) => {
// //     try {
// //       await axios.delete(`/api/cart/remove/${productId}`);
// //       setCart(prev => prev.filter(item => item.productId !== productId));
// //       toast.success('Item removed from cart');
// //     } catch (error) {
// //       toast.error('Failed to remove item from cart');
// //     }
// //   };

// //   // Update item quantity
// //   const updateQuantity = async (productId, quantity) => {
// //     try {
// //       const response = await axios.put(`/api/cart/update/${productId}`, {
// //         quantity
// //       });
// //       setCart(response.data.cart.items);
// //     } catch (error) {
// //       toast.error('Failed to update quantity');
// //     }
// //   };

// //   // Clear cart
// //   const clearCart = async () => {
// //     try {
// //       await axios.delete('/api/cart/clear');
// //       setCart([]);
// //     } catch (error) {
// //       console.error('Error clearing cart:', error);
// //     }
// //   };

// //   // Get cart total
// //   const getCartTotal = () => {
// //     return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
// //   };

// //   // Get cart count
// //   const getCartCount = () => {
// //     return cart.reduce((count, item) => count + item.quantity, 0);
// //   };

// //   const value = {
// //     cart,
// //     addToCart,
// //     removeFromCart,
// //     updateQuantity,
// //     clearCart,
// //     getCartTotal,
// //     getCartCount
// //   };

// //   return (
// //     <CartContext.Provider value={value}>
// //       {children}
// //     </CartContext.Provider>
// //   );
// // };

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// // import { useAuth } from './AuthContext';

// const CartContext = createContext();

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState([]);
//   // const { user } = useAuth();
//   const { userData } = useSelector((state) => state.user);

//   // Fetch cart when user changes
//   useEffect(() => {
//     if (userData) {
//       fetchCart();
//     } else {
//       setCart([]); // Clear cart when user logs out
//     }
//   }, [userData]);

//   // Fetch cart items
//   const fetchCart = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/cart', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setCart(response.data.cart.items || []);
//     } catch (error) {
//       console.error('Error fetching cart:', error);
//     }
//   };

//   // Add item to cart
//   const addToCart = async (product, quantity) => {
//     if (!userData) {
//       toast.error('Please login to add items to cart');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post('/api/cart/add', {
//         productId: product._id,
//         quantity
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setCart(response.data.cart.items);
//       toast.success('Added to cart successfully!');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to add to cart');
//     }
//   };

//   // Remove item from cart
//   const removeFromCart = async (productId) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`/api/cart/remove/${productId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setCart(prev => prev.filter(item => item.product._id !== productId));
//       toast.success('Item removed from cart');
//     } catch (error) {
//       toast.error('Failed to remove item from cart');
//     }
//   };

//   // Update item quantity
//   const updateQuantity = async (productId, quantity) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put(`/api/cart/update/${productId}`, {
//         quantity
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setCart(response.data.cart.items);
//     } catch (error) {
//       toast.error('Failed to update quantity');
//     }
//   };

//   // Clear cart
//   const clearCart = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete('/api/cart/clear', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setCart([]);
//     } catch (error) {
//       console.error('Error clearing cart:', error);
//     }
//   };

//   // Get cart total
//   const getCartTotal = () => {
//     return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };

//   // Get cart count
//   const getCartCount = () => {
//     return cart.reduce((count, item) => count + item.quantity, 0);
//   };

//   const value = {
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getCartTotal,
//     getCartCount
//   };

//   return (
//     <CartContext.Provider value={value}>
//       {children}
//     </CartContext.Provider>
//   );
// };