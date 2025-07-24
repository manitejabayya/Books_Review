const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// @desc    Add a new book
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message,
    });
  }
};

module.exports = { addBook }; 