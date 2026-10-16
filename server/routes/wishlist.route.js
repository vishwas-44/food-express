
import { Router } from 'express';
import auth from '../middleware/auth.js';

import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
} from '../controllers/wishlist.controller.js';

const wishlistRouter = Router();

// Get the logged-in user's wishlist
wishlistRouter.get(
  '/',
  auth,
  getWishlistController
);

// Add a product to the wishlist
wishlistRouter.post(
  '/add',
  auth,
  addToWishlistController
);

// Remove a product from the wishlist
wishlistRouter.delete(
  '/remove/:productId',
  auth,
  removeFromWishlistController
);

export default wishlistRouter;
