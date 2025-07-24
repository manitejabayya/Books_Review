const express = require('express');
const { param, query } = require('express-validator');
const {
  getUsers,
  getUser,
  getUserByUsername,
  getUserReviews,
  getUserBooks,
  getUserStats,
  getTopReviewers,
  followUser
} = require('../controllers/userController');
const { auth, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const usernameValidation = [
  param('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Invalid username format')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'username', 'firstName', 'lastName', 'reviewCount', 'averageRatingGiven'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const searchValidation = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim()
];

const genreValidation = [
  query('genre')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Genre must be between 1 and 50 characters')
    .trim()
];

const reviewsValidation = [
  ...paginationValidation,
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'updatedAt'])
    .withMessage('Invalid sort field for reviews')
];

const booksValidation = [
  ...paginationValidation,
  ...searchValidation,
  ...genreValidation,
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'author', 'averageRating', 'reviewCount'])
    .withMessage('Invalid sort field for books')
];

const topReviewersValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Public routes

// Get all users with optional filters and pagination
router.get('/', 
  paginationValidation,
  searchValidation,
  genreValidation,
  getUsers
);

// Get top reviewers
router.get('/top-reviewers', 
  topReviewersValidation,
  getTopReviewers
);

// Get single user by ID
router.get('/:id', 
  userIdValidation,
  getUser
);

// Get user by username
router.get('/username/:username', 
  usernameValidation,
  getUserByUsername
);

// Get user's reviews
router.get('/:id/reviews', 
  userIdValidation,
  reviewsValidation,
  getUserReviews
);

// Get user's added books
router.get('/:id/books', 
  userIdValidation,
  booksValidation,
  getUserBooks
);

// Get user statistics
router.get('/:id/stats', 
  userIdValidation,
  getUserStats
);

// Protected routes (require authentication)

// Follow/Unfollow user
router.put('/:id/follow', 
  auth,
  userIdValidation,
  followUser
);

module.exports = router;