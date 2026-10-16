
import { Router } from 'express';

import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

import {
  adminLoginController,

  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,

  createProductController,
  getAllProductsController,
  updateProductController,
  deleteProductController,

  getAllOrdersController,
  updateOrderStatusController,
} from '../controllers/admin.controller.js';

import {
  getAdminCouponsController,
  createAdminCouponController,
  updateAdminCouponController,
  toggleAdminCouponController,
  deleteAdminCouponController,
} from '../controllers/adminCoupon.controller.js';

import {
  getAdminNotificationsController,
  markAdminNotificationReadController,
} from '../controllers/notification.controller.js';

const adminRouter = Router();

/*
=====================================================
  Admin Login
=====================================================
*/

adminRouter.post(
  '/login',
  adminLoginController
);

/*
=====================================================
  Admin Access Check
=====================================================
*/

adminRouter.get(
  '/check',
  auth,
  admin,
  (req, res) => {
    return res.status(200).json({
      message: 'Admin access granted',
      success: true,
      error: false,
    });
  }
);

/*
=====================================================
  Categories
=====================================================
*/

// Get all categories
adminRouter.get(
  '/categories',
  getAllCategoriesController
);

// Create category
adminRouter.post(
  '/create-category',
  auth,
  admin,
  createCategoryController
);

// Update category
adminRouter.put(
  '/update-category/:categoryId',
  auth,
  admin,
  updateCategoryController
);

// Delete category
adminRouter.delete(
  '/delete-category/:categoryId',
  auth,
  admin,
  deleteCategoryController
);

/*
=====================================================
  Products
=====================================================
*/

// Get all products
adminRouter.get(
  '/products',
  getAllProductsController
);

// Create product
adminRouter.post(
  '/create-product',
  auth,
  admin,
  createProductController
);

// Update product
adminRouter.put(
  '/update-product/:productId',
  auth,
  admin,
  updateProductController
);

// Delete product
adminRouter.delete(
  '/delete-product/:productId',
  auth,
  admin,
  deleteProductController
);

/*
=====================================================
  Orders
=====================================================
*/

// Get all orders
adminRouter.get(
  '/all-orders',
  auth,
  admin,
  getAllOrdersController
);

// Update order status
adminRouter.put(
  '/update-order-status/:orderId',
  auth,
  admin,
  updateOrderStatusController
);

/*
=====================================================
  Coupon Management
=====================================================
*/

// Get all coupons
adminRouter.get(
  '/coupons',
  auth,
  admin,
  getAdminCouponsController
);

// Create a coupon
adminRouter.post(
  '/coupons',
  auth,
  admin,
  createAdminCouponController
);

// Edit a coupon
adminRouter.put(
  '/coupons/:couponId',
  auth,
  admin,
  updateAdminCouponController
);

// Activate or deactivate a coupon
adminRouter.patch(
  '/coupons/:couponId/active',
  auth,
  admin,
  toggleAdminCouponController
);

// Delete a coupon
adminRouter.delete(
  '/coupons/:couponId',
  auth,
  admin,
  deleteAdminCouponController
);

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

adminRouter.get(
  '/notifications',
  auth,
  admin,
  getAdminNotificationsController
);

adminRouter.patch(
  '/notifications/:notificationId/read',
  auth,
  admin,
  markAdminNotificationReadController
);

export default adminRouter;

