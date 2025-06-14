import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Home from './components/Home.jsx';
import './styles/main.css';
import './index.css';
import CategorySection from './components/CategorySection.jsx';
import Profile from './pages/Profile.jsx';
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
import Wishlist from './pages/Wishlist';
import CategoryProducts from './components/CategoryProducts';
import AllCategoriesPage from './pages/AllCategoriesPage.jsx';
import SellerProfile from './pages/SellerProfile';

const App = () => {
  return (
      <Router>
    {/* <AuthProvider> */}
        {/* <CartProvider> */}
          <div className="flex flex-col min-h-screen">
            <Toaster
              containerStyle={{
                top: 70,
                right: 20,
              }}
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#fff',
                  color: '#333',
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
              <Route path="/products" element={<AllProducts />} />
              <Route path="/categories/all" element={<AllCategoriesPage />} />
              <Route path="/users/sellers/:sellerId" element={<SellerAccount />} />
              <Route path="/sellers/:sellerId" element={<SellerProfile />} />
              <Route path="/seller/:sellerId" element={<SellerProfile />} />
              <Route path="/products/category/:category" element={<CategoryProducts showFilters={true} />} />
              
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
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ConditionalFooter />
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

// Conditional Footer Component
const ConditionalFooter = () => {
  const location = useLocation();
  const publicPaths = ['/register', '/login'];
  
  if (publicPaths.includes(location.pathname)) {
    return null;
  }

  return <Footer />;
};

export default App;