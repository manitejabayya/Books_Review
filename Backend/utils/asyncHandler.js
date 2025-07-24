/**
 * Async Handler - Wrapper for async route handlers
 * Eliminates the need for try-catch blocks in async controllers
 * Automatically catches and forwards errors to error handling middleware
 */

/**
 * Main async handler function
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Async handler with custom error transformation
 * @param {Function} fn - Async function to wrap
 * @param {Function} errorTransform - Function to transform errors before passing to next()
 * @returns {Function} - Express middleware function
 */
const asyncHandlerWithTransform = (fn, errorTransform) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    if (errorTransform && typeof errorTransform === 'function') {
      const transformedError = errorTransform(error);
      return next(transformedError);
    }
    next(error);
  });
};

/**
 * Async handler for validation-heavy routes
 * Automatically handles express-validator errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncValidationHandler = (fn) => (req, res, next) => {
  const { validationResult } = require('express-validator');
  
  return Promise.resolve(fn(req, res, next)).catch((error) => {
    // Check for validation errors first
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const validationError = new Error('Validation failed');
      validationError.statusCode = 400;
      validationError.errors = validationErrors.array();
      return next(validationError);
    }
    
    next(error);
  });
};

/**
 * Async handler with automatic success response
 * Useful for simple CRUD operations
 * @param {Function} fn - Async function that returns data
 * @param {Object} options - Response options
 * @returns {Function} - Express middleware function
 */
const asyncSuccessHandler = (fn, options = {}) => (req, res, next) => {
  const {
    successMessage = 'Operation completed successfully',
    statusCode = 200,
    dataKey = 'data'
  } = options;

  return Promise.resolve(fn(req, res, next))
    .then((result) => {
      // If the function already sent a response, don't send another
      if (res.headersSent) {
        return;
      }

      // If result is undefined, send basic success response
      if (result === undefined) {
        return res.status(statusCode).json({
          success: true,
          message: successMessage
        });
      }

      // Send response with data
      res.status(statusCode).json({
        success: true,
        message: successMessage,
        [dataKey]: result
      });
    })
    .catch(next);
};

/**
 * Async handler for database operations
 * Includes common database error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncDbHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((error) => {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateError = new Error(`${field} already exists`);
      duplicateError.statusCode = 400;
      return next(duplicateError);
    }

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationError = new Error('Validation failed');
      validationError.statusCode = 400;
      validationError.errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(validationError);
    }

    // Handle MongoDB cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      const castError = new Error('Invalid ID format');
      castError.statusCode = 400;
      return next(castError);
    }

    next(error);
  });
};

/**
 * Async handler with request timeout
 * @param {Function} fn - Async function to wrap
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Function} - Express middleware function
 */
const asyncTimeoutHandler = (fn, timeout = 30000) => (req, res, next) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      const timeoutError = new Error('Request timeout');
      timeoutError.statusCode = 408;
      reject(timeoutError);
    }, timeout);
  });

  return Promise.race([
    Promise.resolve(fn(req, res, next)),
    timeoutPromise
  ]).catch(next);
};

/**
 * Async handler with retry logic
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Retry options
 * @returns {Function} - Express middleware function
 */
const asyncRetryHandler = (fn, options = {}) => {
  const { maxRetries = 3, retryDelay = 1000, retryCondition } = options;

  return (req, res, next) => {
    let attempts = 0;

    const executeWithRetry = async () => {
      try {
        attempts++;
        return await fn(req, res, next);
      } catch (error) {
        // Check if we should retry
        const shouldRetry = retryCondition ? retryCondition(error) : 
          (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT');

        if (attempts < maxRetries && shouldRetry) {
          console.log(`Retrying request (attempt ${attempts + 1}/${maxRetries})`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry();
        }

        throw error;
      }
    };

    executeWithRetry().catch(next);
  };
};

/**
 * Create a custom async handler with default options
 * @param {Object} defaultOptions - Default options for all handlers
 * @returns {Function} - Configured async handler
 */
const createAsyncHandler = (defaultOptions = {}) => {
  return (fn, options = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };
    
    if (mergedOptions.validation) {
      return asyncValidationHandler(fn);
    }
    
    if (mergedOptions.database) {
      return asyncDbHandler(fn);
    }
    
    if (mergedOptions.timeout) {
      return asyncTimeoutHandler(fn, mergedOptions.timeout);
    }
    
    if (mergedOptions.retry) {
      return asyncRetryHandler(fn, mergedOptions.retry);
    }
    
    return asyncHandler(fn);
  };
};

module.exports = {
  asyncHandler,
  asyncHandlerWithTransform,
  asyncValidationHandler,
  asyncSuccessHandler,
  asyncDbHandler,
  asyncTimeoutHandler,
  asyncRetryHandler,
  createAsyncHandler
};