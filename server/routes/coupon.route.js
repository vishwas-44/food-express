
import { Router } from 'express';
import { validateCouponController } from '../controllers/coupon.controller.js';

const couponRouter = Router();

couponRouter.post('/validate', validateCouponController);

export default couponRouter;
