const express = require('express');
const router = express.Router();
const { addBook } = require('../controllers/bookController');
const { auth } = require('../middlewares/auth');
const { body } = require('express-validator');

// Example: Get all books (placeholder)
// router.get('/', (req, res) => {
//   res.json({ message: 'List of books' });
// });

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