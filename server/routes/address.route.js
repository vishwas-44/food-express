import { Router } from 'express';

import {
  getAddressesController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
} from '../controllers/address.controller.js';

import auth from '../middleware/auth.js';

const addressRouter = Router();

// Get all saved addresses
addressRouter.get(
  '/my-addresses',
  auth,
  getAddressesController
);

// Add new address
addressRouter.post(
  '/add-address',
  auth,
  addAddressController
);

// Update address
addressRouter.put(
  '/update-address/:addressId',
  auth,
  updateAddressController
);

// Delete address
addressRouter.delete(
  '/delete-address/:addressId',
  auth,
  deleteAddressController
);

// Set default address
addressRouter.put(
  '/set-default/:addressId',
  auth,
  setDefaultAddressController
);

export default addressRouter;