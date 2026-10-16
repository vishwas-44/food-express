import { Router } from 'express';

import auth from '../middleware/auth.js';

import {
  addAddressController,
  createOrderController,
  getOrdersController,
  cancelOrderController,
} from '../controllers/order.controller.js';

import {
  getCustomerNotificationsController,
  markCustomerNotificationReadController,
} from '../controllers/notification.controller.js';

const orderRouter = Router();

// Add delivery address
orderRouter.post(
  '/add-address',
  auth,
  addAddressController
);

// Create food order
orderRouter.post(
  '/create-order',
  auth,
  createOrderController
);

// Get customer's orders
orderRouter.get(
  '/my-orders',
  auth,
  getOrdersController
);

// Cancel customer order
orderRouter.put(
  '/cancel-order/:orderId',
  auth,
  cancelOrderController
);

// ============================================
// CUSTOMER NOTIFICATIONS
// ============================================

orderRouter.get(
  '/notifications',
  auth,
  getCustomerNotificationsController
);

orderRouter.patch(
  '/notifications/:notificationId/read',
  auth,
  markCustomerNotificationReadController
);

export default orderRouter;