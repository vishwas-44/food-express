
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

import userRouter from './routes/user.routes.js';
import orderRouter from './routes/order.route.js';
import adminRouter from './routes/admin.route.js';
import addressRouter from './routes/address.route.js';
import wishlistRouter from './routes/wishlist.route.js';
import couponRouter from './routes/coupon.route.js';
import deliveryRouter from './routes/delivery.route.js';

import { cancelExpiredOrders } from './utils/orderExpiry.js';

dotenv.config();

const app = express();

// Security and Parsing Middleware
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// API Routes
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/address', addressRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/delivery', deliveryRouter);

// Test Route
app.get('/', (req, res) => {
  res.json({
    message: 'Food Ordering Server is running',
    database: 'Supabase',
  });
});

const PORT = process.env.PORT || 8000;

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Check for expired orders immediately
  await cancelExpiredOrders();

  // Check for expired orders every 5 minutes
  setInterval(
    async () => {
      await cancelExpiredOrders();
    },
    5 * 60 * 1000
  );
});