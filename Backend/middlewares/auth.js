const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed.'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication.'
    });
  }
};

// Middleware to check if user is admin or moderator
const moderatorAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Moderator privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Moderator auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during moderator authentication.'
    });
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Middleware to check resource ownership
const checkOwnership = (Model, paramName = 'id', userField = 'addedBy') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      // Allow admins and moderators to access any resource
      if (['admin', 'moderator'].includes(req.user.role)) {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      const ownerId = resource[userField];
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during ownership verification.'
      });
    }
  };
};

// Middleware to validate JWT token structure without verification
const validateTokenStructure = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided.'
    });
  }

  // Check if token has correct structure (3 parts separated by dots)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format.'
    });
  }

  next();
};

// Rate limiting middleware for auth routes
const authRateLimit = (windowMs = 15 * 60 * 1000, max = 5) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    }

    const userRequests = requests.get(ip) || [];

    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    requests.set(ip, userRequests);
    next();
  };
};

// Middleware to log authentication events
const logAuthEvent = (eventType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Log successful authentication events
      if (res.statusCode < 400) {
        console.log(`[AUTH EVENT] ${eventType}:`, {
          timestamp: new Date().toISOString(),
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          userId: req.user?._id,
          username: req.user?.username
        });
      }
      
      originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = {
  auth,
  adminAuth,
  moderatorAuth,
  optionalAuth,
  checkOwnership,
  validateTokenStructure,
  authRateLimit,
  logAuthEvent
};