const admin = async (req, res, next) => {
  try {
    // Admin tokens are identified by their verified JWT role.
    if (
      req.isAdmin === true &&
      req.userRole === 'Admin'
    ) {
      return next();
    }

    // Customer tokens must have a valid user ID.
    if (!req.userId) {
      return res.status(401).json({
        message: 'Authentication required.',
        error: true,
      });
    }

    if (req.userRole !== 'Admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.',
        error: true,
      });
    }

    return res.status(403).json({
      message: 'Admin access denied.',
      error: true,
    });
  } catch (error) {
    console.error('Admin authentication error:', error.message);

    return res.status(500).json({
      message: 'Internal server error.',
      error: true,
    });
  }
};

export default admin;
