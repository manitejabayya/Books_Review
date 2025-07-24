const express = require('express');
const router = express.Router();
const { addBook, getBooks, getBookById, getBookReviews, addBookReview } = require('../controllers/bookController');
const { auth } = require('../middlewares/auth');
const { body } = require('express-validator');

// Get all books
router.get('/', getBooks);

// Get a single book by ID
router.get('/:id', getBookById);

// Get reviews for a book
router.get('/:id/reviews', getBookReviews);

// Add a review to a book (protected)
router.post(
  '/:id/reviews',
  auth,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  ],
  addBookReview
);

// Add a new book (protected)
router.post(
  '/',
  auth,
  [
    body('title').isLength({ min: 1 }).withMessage('Title is required'),
    body('author').isLength({ min: 1 }).withMessage('Author is required'),
    body('genre').isLength({ min: 1 }).withMessage('Genre is required'),
  ],
  addBook
);

module.exports = router; 