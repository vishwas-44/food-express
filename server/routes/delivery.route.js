import express from 'express';

import {
  getDeliveryQuoteController,
  geocodeDeliveryAddressController,
} from '../controllers/delivery.controller.js';

const deliveryRouter = express.Router();

deliveryRouter.post('/quote', getDeliveryQuoteController);

deliveryRouter.post(
  '/geocode',
  geocodeDeliveryAddressController
);

export default deliveryRouter;