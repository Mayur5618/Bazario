import express from "express";
import mongoose from "mongoose";
import userRoutes from './routes/user.route.js';
import {errorMiddleware} from'./middleware/errorMiddleware.js';
import productRoutes from './routes/product.route.js';
import requestRoutes from './routes/request.route.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import searchRoutes from './routes/search.route.js';
import reviewRoutes from './routes/review.routes.js';
import bodyParser from 'body-parser';
import otpRoutes from './routes/otp.route.js';
import shippingAddressRoutes from './routes/shippingAddress.routes.js';
import mobileSearchRoutes from './routes/Mobile_search.routes.js';
import wishlistRoutes from './routes/wishlist.route.js';
import sellerRoutes from './routes/seller.route.js';
import uploadRoutes from './routes/upload.route.js';
import agencyRoutes from './routes/agencyRoutes.js';
import './models/seller.model.js'; // Import Seller model to register it
import recentlyViewedRoutes from './routes/recentlyViewed.js';

mongoose
  .connect("mongodb://localhost:27017/Purity-Path")
  .then(() => {
    console.log("mongodb is connected");
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();

// Configure middleware BEFORE routes
app.use(cookieParser());

app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set body size limits BEFORE any routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Define routes AFTER middleware
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes); 
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/user', shippingAddressRoutes);
app.use('/api/search', mobileSearchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);

// Error handling middleware should be last
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  
  res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});