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
mongoose
  .connect("mongodb://localhost:27017/Purity-Path")
  .then(() => {
    console.log("mongodb is connected");
  })
  .catch((error) => {
    console.log(error);
  });


const app = express();
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes); 
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); 
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});