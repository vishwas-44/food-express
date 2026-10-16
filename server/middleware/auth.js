import jwt from 'jsonwebtoken';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Please log in.',
        error: true,
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY_ACCESS_TOKEN
    );

    // Admin authentication
    if (decoded.isAdmin === true && decoded.role === 'Admin') {
      req.userId = null;
      req.userRole = 'Admin';
      req.isAdmin = true;
      return next();
    }

    // Customer authentication
    if (
      typeof decoded.id !== 'string' ||
      !UUID_REGEX.test(decoded.id)
    ) {
      return res.status(401).json({
        message: 'Invalid user ID. Please log in again.',
        error: true,
      });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.isAdmin = false;

    return next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired authentication token.',
        error: true,
      });
    }

    console.error('Authentication error:', error.message);

    return res.status(500).json({
      message: 'Internal authentication error.',
      error: true,
    });
  }
};

export default auth;
