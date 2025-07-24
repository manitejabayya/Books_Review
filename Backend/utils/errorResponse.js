/**
 * Custom Error Response Class
 * Provides consistent error handling and response formatting
 */

class ErrorResponse extends Error {
  /**
   * Create a new ErrorResponse
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Custom error code for client handling
   * @param {Array|Object} errors - Additional error details
   */
  constructor(message, statusCode = 500, errorCode = null, errors = null) {
    super(message);
    this.name = 'ErrorResponse';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   * @param {boolean} includeStack - Whether to include stack trace in development
   * @returns {Object} - Formatted error response
   */
  toJSON(includeStack = false) {
    const response = {
      success: false,
      error: {
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp
      }
    };

    // Add error code if provided
    if (this.errorCode) {
      response.error.code = this.errorCode;
    }

    // Add detailed errors if provided
    if (this.errors) {
      response.error.details = this.errors;
    }

    // Add stack trace in development
    if (includeStack && process.env.NODE_ENV === 'development') {
      response.error.stack = this.stack;
    }

    return response;
  }
}

/**
 * Predefined error response creators
 */
class ErrorResponses {
  // Authentication & Authorization Errors (400-403)
  static badRequest(message = 'Bad Request', errors = null) {
    return new ErrorResponse(message, 400, 'BAD_REQUEST', errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ErrorResponse(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access forbidden') {
    return new ErrorResponse(message, 403, 'FORBIDDEN');
  }

  static invalidCredentials(message = 'Invalid credentials') {
    return new ErrorResponse(message, 401, 'INVALID_CREDENTIALS');
  }

  static tokenExpired(message = 'Token has expired') {
    return new ErrorResponse(message, 401, 'TOKEN_EXPIRED');
  }

  static invalidToken(message = 'Invalid token') {
    return new ErrorResponse(message, 401, 'INVALID_TOKEN');
  }

  // Resource Errors (404, 409, 410)
  static notFound(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    return new ErrorResponse(message, 404, 'NOT_FOUND');
  }

  static conflict(message = 'Resource conflict') {
    return new ErrorResponse(message, 409, 'CONFLICT');
  }

  static gone(message = 'Resource no longer available') {
    return new ErrorResponse(message, 410, 'GONE');
  }

  // Validation Errors (422)
  static validationError(message = 'Validation failed', errors = null) {
    return new ErrorResponse(message, 422, 'VALIDATION_ERROR', errors);
  }

  static duplicateEntry(field, value) {
    const message = `${field} '${value}' already exists`;
    return new ErrorResponse(message, 409, 'DUPLICATE_ENTRY', { field, value });
  }

  // Rate Limiting (429)
  static rateLimitExceeded(message = 'Too many requests') {
    return new ErrorResponse(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Server Errors (500+)
  static internalServer(message = 'Internal server error') {
    return new ErrorResponse(message, 500, 'INTERNAL_SERVER_ERROR');
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ErrorResponse(message, 503, 'SERVICE_UNAVAILABLE');
  }

  static databaseError(message = 'Database operation failed') {
    return new ErrorResponse(message, 500, 'DATABASE_ERROR');
  }

  // File/Upload Errors
  static fileTooLarge(maxSize) {
    return new ErrorResponse(
      `File size exceeds maximum allowed size of ${maxSize}`, 
      413, 
      'FILE_TOO_LARGE'
    );
  }

  static invalidFileType(allowedTypes) {
    return new ErrorResponse(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 
      400, 
      'INVALID_FILE_TYPE'
    );
  }

  static fileUploadError(message = 'File upload failed') {
    return new ErrorResponse(message, 500, 'FILE_UPLOAD_ERROR');
  }

  // Business Logic Errors
  static insufficientPermissions(action) {
    return new ErrorResponse(
      `Insufficient permissions to ${action}`, 
      403, 
      'INSUFFICIENT_PERMISSIONS'
    );
  }

  static accountSuspended(message = 'Account has been suspended') {
    return new ErrorResponse(message, 403, 'ACCOUNT_SUSPENDED');
  }

  static accountNotVerified(message = 'Account email not verified') {
    return new ErrorResponse(message, 403, 'ACCOUNT_NOT_VERIFIED');
  }

  // External Service Errors
  static externalServiceError(service, message = 'External service error') {
    return new ErrorResponse(
      `${service}: ${message}`, 
      502, 
      'EXTERNAL_SERVICE_ERROR'
    );
  }

  static timeout(message = 'Request timeout') {
    return new ErrorResponse(message, 408, 'TIMEOUT');
  }
}

/**
 * Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = ErrorResponses.duplicateEntry(field, value);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    error = ErrorResponses.validationError('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ErrorResponses.invalidToken();
  }

  if (err.name === 'TokenExpiredError') {
    error = ErrorResponses.tokenExpired();
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ErrorResponses.fileTooLarge('10MB');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = ErrorResponses.badRequest('Unexpected file field');
  }

  // Handle ErrorResponse instances
  if (error instanceof ErrorResponse) {
    return res.status(error.statusCode).json(
      error.toJSON(process.env.NODE_ENV === 'development')
    );
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  const defaultError = new ErrorResponse(message, statusCode);
  res.status(statusCode).json(
    defaultError.toJSON(process.env.NODE_ENV === 'development')
  );
};

/**
 * Not found middleware for unmatched routes
 */
const notFound = (req, res, next) => {
  const error = ErrorResponses.notFound(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Async error catcher for development
 */
const asyncErrorCatcher = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ErrorResponse,
  ErrorResponses,
  errorHandler,
  notFound,
  asyncErrorCatcher
};