// import React from 'react';
// // import { useCart } from '../context/CartContext';
// // import { useCart } from '../components/context/CartContext';
// import { Link, useNavigate } from 'react-router-dom';
// // import { useAuth } from './context/AuthContext';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeCartItem, updateCartItemQuantity,selectCartTotal, selectCartItems} from '../store/cartSlice';

// const Cart = () => {
//   // const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
//   const dispatch = useDispatch();
//   // const { user } = useAuth();
//   const { userData } = useSelector((state) => state.user);
//   const cart = useSelector(selectCartItems);
//   const cartTotal = useSelector(selectCartTotal);
//   const navigate = useNavigate();

//   if (!userData) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
//           <p className="text-gray-600 mb-4">Please login to view your cart</p>
//           <Link
//             to="/login"
//             className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (cart.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
//           <p className="text-gray-600 mb-4">Add some items to your cart</p>
//           <Link
//             to="/products"
//             className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      
//       <div className="grid grid-cols-1 gap-4">
//         {cart.map((item) => (
//           <div 
//             key={item.productId} 
//             className="flex items-center gap-4 p-4 border rounded-lg"
//           >
//             <img 
//               src={item.image} 
//               alt={item.name} 
//               className="w-24 h-24 object-cover rounded"
//             />
            
//             <div className="flex-1">
//               <Link 
//                 to={`/product/${item.productId}`}
//                 className="text-lg font-semibold hover:text-blue-600"
//               >
//                 {item.name}
//               </Link>
//               <p className="text-gray-600">
//                 ₹{item.price} per {item.unitType}
//               </p>
              
//               <div className="flex items-center gap-2 mt-2">
//                 <button
//                   onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
//                   className="px-2 py-1 border rounded"
//                 >
//                   -
//                 </button>
//                 <span>{item.quantity}</span>
//                 <button
//                   onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
//                   className="px-2 py-1 border rounded"
//                 >
//                   +
//                 </button>
//                 <button
//                   onClick={() => removeFromCart(item.productId)}
//                   className="ml-4 text-red-600 hover:text-red-800"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
            
//             <div className="text-right">
//               <p className="text-lg font-semibold">
//                 ₹{(item.price * item.quantity).toFixed(2)}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-8 border-t pt-4">
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-xl font-semibold">Total:</span>
//           <span className="text-xl font-bold">₹{getCartTotal().toFixed(2)}</span>
//         </div>
        
//         <div className="flex justify-end gap-4">
//           <Link 
//             to="/products" 
//             className="px-6 py-2 border rounded hover:bg-gray-100"
//           >
//             Continue Shopping
//           </Link>
//           <Link
//   to="/checkout"
//   className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
// >
//   Proceed to Checkout
// </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { removeCartItem, updateCartItemQuantity, selectCartTotal, selectCartItems } from './';
import { toast } from 'react-hot-toast';
// import { removeCartItem, updateCartItemQuantity, selectCartTotal, selectCartItems } from '../store/cartSlice';
import {cartRemove, cartAdd, cartItemRemove, cartEmpty} from '../store/cartSlice';
const Cart = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const cart = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const navigate = useNavigate();

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
          <p className="text-gray-600 mb-4">Please login to view your cart</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-4">Add some items to your cart</p>
          <Link
            to="/products"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = (productId, currentQuantity, stock, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity cannot be less than 1');
      return;
    }
    if (newQuantity > stock) {
      toast.error('Cannot exceed available stock');
      return;
    }
    dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveFromCart = (productId) => {
    dispatch(removeCartItem(productId));
    toast.success('Item removed from cart');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {cart.map((item) => (
          <div 
            key={item.productId} 
            className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
          >
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-1">
              <Link 
                to={`/product/${item.productId}`}
                className="text-lg font-semibold hover:text-blue-600"
              >
                {item.name}
              </Link>
              <p className="text-gray-600">
                ₹{item.price.toFixed(2)} per {item.unitType}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleUpdateQuantity(
                    item.productId, 
                    item.quantity, 
                    item.stock, 
                    item.quantity - 1
                  )}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(
                    item.productId, 
                    item.quantity, 
                    item.stock, 
                    item.quantity + 1
                  )}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  +
                </button>
                <button
                  onClick={() => handleRemoveFromCart(item.productId)}
                  className="ml-4 text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Remove</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-semibold">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
              {item.quantity >= item.stock && (
                <p className="text-sm text-red-600">Max stock reached</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-xl font-bold">₹{cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-end gap-4">
          <Link 
            to="/products" 
            className="px-6 py-2 border rounded hover:bg-gray-100 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/checkout"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;