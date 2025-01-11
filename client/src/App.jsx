import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Home from './components/Home.jsx';
import './styles/main.css';
import './index.css';
import CategorySection from './components/CategorySection.jsx';
import Profile from './components/Profile.jsx';
import Footer from './components/layout/Footer.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
// import { CartProvider } from './components/CartContext.jsx';
// import { CartProvider } from './components/context/CartContext.jsx';
import { Toaster } from 'react-hot-toast';
import Cart from './components/Cart.jsx';
import NotFound from './components/NotFound.jsx';
import Checkout from './components/Checkout.jsx';
import OrderSuccess from './components/OrderSuccess.jsx';
import Orders from './components/Orders.jsx';
import OrderDetail from './components/OrderDetail.jsx';
// import { AuthProvider } from './components/context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import AllProducts from './pages/AllProducts.jsx';
import SellerAccount from './pages/SellerAccount.jsx';

// const App = () => {
//   return (
//     <Router>
//       <AuthProvider>
//       <CartProvider>
//       <div className="flex flex-col min-h-screen">
//           {/* Toast notifications */}
//           <Toaster 
//             position="top-right"
//             toastOptions={{
//               duration: 3000,
//               style: {
//                 background: '#333',
//                 color: '#fff',
//               },
//               success: {
//                 style: {
//                   background: '#22c55e',
//                 },
//               },
//               error: {
//                 style: {
//                   background: '#ef4444',
//                 },
//               },
//             }} 
//           />
//       <ConditionalHeader />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/categories" element={<CategorySection />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/product" element={<ProductDetailPage />} />
//         <Route path="/product/:id" element={<ProductDetail />} />
//         <Route path="/cart" element={<Cart />} />
//         <Route path="*" element={<NotFound />} />
//         {/* <Route path="/checkout" element={<Checkout />} /> */}
//         {/* <Route path="/order-success" element={<OrderSuccess />} /> */}
//         {/* <Route path="/orders" element={<Orders />} /> */}
//         {/* <Route path="/order/:id" element={<OrderDetail />} /> */}
//         {/* <Route path="/orders" element={<Orders />} /> */}
//         {/* <Route path="/order/:orderId" element={<OrderDetail />} /> */}
//         <Route path="/order-success/:orderId" element={<OrderSuccess />} />

//         <Route path="/orders" element={
//               <ProtectedRoute>
//                 <Orders />
//               </ProtectedRoute>
//             } />
//             <Route path="/order/:orderId" element={
//               <ProtectedRoute>
//                 <OrderDetail />
//               </ProtectedRoute>
//             } />
//             <Route path="/checkout" element={
//               <ProtectedRoute>
//                 <Checkout />
//               </ProtectedRoute>
//             } />
//         {/* <Route path="/buyer/dashboard" element={<Dashboard />} /> */}
//         {/* Add other routes as needed */}
//       </Routes>
//         <Footer />
//         </div>
//     </CartProvider>
//     </AuthProvider>
//     </Router>
//   );
// };

// // New component to conditionally render Header
// const ConditionalHeader = () => {
//   const location = useLocation();
  
//   // Check if the current path is '/register'
//   if (location.pathname === '/register' || location.pathname === '/login') {
//     return null; // Do not render Header for the register page
//   }

//   return <Header />; // Render Header for all other pages
// };

// export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import Header from './components/Header.jsx';
// import Login from './components/auth/Login.jsx';
// import Register from './components/auth/Register.jsx';
// import Home from './components/Home.jsx';
// import './styles/main.css';
// import './index.css';
// import CategorySection from './components/CategorySection.jsx';
// import Profile from './components/Profile.jsx';
// import Footer from './components/layout/Footer.jsx';
// import ProductDetailPage from './pages/ProductDetailPage.jsx';
// import ProductDetail from './pages/ProductDetail.jsx';
// // Update these import paths
// import { CartProvider } from './context/CartContext.jsx';
// import { AuthProvider } from './context/AuthContext.jsx';
// import { Toaster } from 'react-hot-toast';
// import Cart from './components/Cart.jsx';
// import NotFound from './components/NotFound.jsx';
// import Checkout from './components/Checkout.jsx';
// import OrderSuccess from './components/OrderSuccess.jsx';
// import Orders from './components/Orders.jsx';
// import OrderDetail from './components/OrderDetail.jsx';
// import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  return (
      <Router>
    {/* <AuthProvider> */}
        {/* <CartProvider> */}
          <div className="flex flex-col min-h-screen">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }} 
            />
            <ConditionalHeader />
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/categories" element={<CategorySection />} />
              <Route path="/product" element={<ProductDetailPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/all-products" element={<AllProducts />} />
              <Route path="/sellers/:sellerId" element={<SellerAccount />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              <Route path="/order-success/:orderId" element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        {/* </CartProvider> */}
    {/* </AuthProvider> */}
      </Router>
  );
};

// Conditional Header Component
const ConditionalHeader = () => {
  const location = useLocation();
  const publicPaths = ['/register', '/login'];
  
  if (publicPaths.includes(location.pathname)) {
    return null;
  }

  return <Header />;
};

export default App;