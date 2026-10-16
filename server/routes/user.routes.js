import { Router } from 'express';

import {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
  forgotPasswordController,
  verifyResetOtpController,
  resetPasswordController,
  changePasswordController,
} from '../controllers/user.controller.js';

import auth from '../middleware/auth.js';

const userRouter = Router();

// Register
userRouter.post(
  '/register',
  registerUserController
);

// Verify Email OTP
userRouter.post(
  '/verify-email',
  verifyEmailController
);

// Login
userRouter.post(
  '/login',
  loginController
);

// Logout
userRouter.post(
  '/logout',
  logoutController
);

// Forgot Password - Send OTP
userRouter.post(
  '/forgot-password',
  forgotPasswordController
);

// Verify Password Reset OTP
userRouter.post(
  '/verify-reset-otp',
  verifyResetOtpController
);

// Reset Password
userRouter.post(
  '/reset-password',
  resetPasswordController
);

// Change Password - Logged-in User
userRouter.put(
  '/change-password',
  auth,
  changePasswordController
);

export default userRouter;