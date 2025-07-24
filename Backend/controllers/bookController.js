const Book = require('../models/Book');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// @desc    Add a new book
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
  console.log('[ADD BOOK] Body:', req.body);
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[ADD BOOK] Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const {
      title,
      author,
      genre,
      description,
      isbn,
      publishedYear,
      publisher,
      pageCount,
      language,
      coverImage,
      tags,
    } = req.body;

    const book = await Book.create({
      title,
      author,
      genre,
      description,
      isbn,
      publishedYear,
      publisher,
      pageCount,
      language,
      coverImage,
      tags,
      addedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: { book },
    });
  } catch (error) {
    console.error('[ADD BOOK] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message,
    });
  }
};

// @desc    Get all books (with filters, pagination, sorting)
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    // Filtering
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.author) query.author = req.query.author;
    if (req.query.minRating) query.averageRating = { ...(query.averageRating || {}), $gte: Number(req.query.minRating) };
    if (req.query.maxRating) query.averageRating = { ...(query.averageRating || {}), $lte: Number(req.query.maxRating) };
    // Text search (title, author, description)
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const order = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: order };
    }
    const books = await Book.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Book.countDocuments(query);
    res.json({
      success: true,
      total,
      data: { books },
      pagination: { page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching books' });
  }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, data: { book } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching book' });
  }
};

// @desc    Get reviews for a book
// @route   GET /api/books/:id/reviews
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ book: req.params.id, isDeleted: false, isApproved: true })
      .populate('reviewer', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Review.countDocuments({ book: req.params.id, isDeleted: false, isApproved: true });
    res.json({
      success: true,
      total,
      data: { reviews },
      pagination: { page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// @desc    Add a review to a book
// @route   POST /api/books/:id/reviews
// @access  Private
const addBookReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { rating, reviewText } = req.body;
    // Prevent duplicate review by same user
    const existing = await Review.findOne({ book: req.params.id, reviewer: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this book.' });
    }
    const review = await Review.create({
      book: req.params.id,
      reviewer: req.user.id,
      rating,
      reviewText
    });
    // Update book stats
    const book = await Book.findById(req.params.id);
    if (book) await book.updateRatingStats();
    res.status(201).json({ success: true, message: 'Review added', data: { review } });
  } catch (err) {
    console.error('Error in addBookReview:', err);
    res.status(500).json({ success: false, message: 'Error adding review' });
  }
};

module.exports = { addBook, getBooks, getBookById, getBookReviews, addBookReview }; 