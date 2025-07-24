const User = require('../models/User');
const Review = require('../models/Review');
const Book = require('../models/Book');
const { asyncHandler } = require('../middlewares/error');
const { validationResult } = require('express-validator');

// @desc    Get all users with pagination and search
// @route   GET /api/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query based on search parameters
  let query = { isActive: true };

  // Search by name or username
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { username: searchRegex }
    ];
  }

  // Filter by favorite genres
  if (req.query.genre) {
    query.favoriteGenres = { $in: [req.query.genre] };
  }

  // Sort options
  let sortBy = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy;
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sortBy[sortField] = sortOrder;
  } else {
    sortBy = { createdAt: -1 };
  }

  try {
    // Execute query
    const users = await User.find(query)
      .select('-password -email')
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex)
      .populate('reviews', 'book rating createdAt')
      .populate('booksAdded', 'title author genre');

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: users.length,
      total,
      pagination,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -email')
    .populate({
      path: 'reviews',
      select: 'book rating reviewText createdAt',
      populate: {
        path: 'book',
        select: 'title author genre coverImage'
      }
    })
    .populate('booksAdded', 'title author genre averageRating coverImage');

  if (!user || !user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
const getUserByUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ 
    username: req.params.username.toLowerCase(),
    isActive: true 
  })
    .select('-password -email')
    .populate({
      path: 'reviews',
      select: 'book rating reviewText createdAt',
      populate: {
        path: 'book',
        select: 'title author genre coverImage'
      }
    })
    .populate('booksAdded', 'title author genre averageRating coverImage');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/users/:id/reviews
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Check if user exists
  const user = await User.findById(req.params.id);
  if (!user || !user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Build query
  let query = { reviewer: req.params.id };

  // Filter by rating
  if (req.query.rating) {
    query.rating = parseInt(req.query.rating);
  }

  // Sort options
  let sortBy = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy;
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sortBy[sortField] = sortOrder;
  } else {
    sortBy = { createdAt: -1 };
  }

  try {
    const reviews = await Review.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex)
      .populate('book', 'title author genre coverImage averageRating')
      .populate('reviewer', 'username firstName lastName profilePicture');

    const total = await Review.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: reviews.length,
      total,
      pagination,
      data: {
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews'
    });
  }
});

// @desc    Get user's added books
// @route   GET /api/users/:id/books
// @access  Public
const getUserBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Check if user exists
  const user = await User.findById(req.params.id);
  if (!user || !user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Build query
  let query = { addedBy: req.params.id };

  // Filter by genre
  if (req.query.genre) {
    query.genre = req.query.genre;
  }

  // Search by title or author
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { title: searchRegex },
      { author: searchRegex }
    ];
  }

  // Sort options
  let sortBy = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy;
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    sortBy[sortField] = sortOrder;
  } else {
    sortBy = { createdAt: -1 };
  }

  try {
    const books = await Book.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex)
      .populate('addedBy', 'username firstName lastName');

    const total = await Book.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: books.length,
      total,
      pagination,
      data: {
        books
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user books'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = asyncHandler(async (req, res) => {
  // Check if user exists
  const user = await User.findById(req.params.id);
  if (!user || !user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  try {
    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { reviewer: user._id } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          highestRating: { $max: '$rating' },
          lowestRating: { $min: '$rating' }
        }
      }
    ]);

    // Get books added count
    const booksAddedCount = await Book.countDocuments({ addedBy: user._id });

    // Get review distribution by rating
    const ratingDistribution = await Review.aggregate([
      { $match: { reviewer: user._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get favorite genres from reviews
    const genreStats = await Review.aggregate([
      { $match: { reviewer: user._id } },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookData'
        }
      },
      { $unwind: '$bookData' },
      {
        $group: {
          _id: '$bookData.genre',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const stats = {
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        joinedDate: user.createdAt
      },
      reviews: {
        total: reviewStats[0]?.totalReviews || 0,
        averageRating: reviewStats[0]?.averageRating || 0,
        highestRating: reviewStats[0]?.highestRating || 0,
        lowestRating: reviewStats[0]?.lowestRating || 0,
        ratingDistribution: ratingDistribution
      },
      books: {
        totalAdded: booksAddedCount
      },
      genres: genreStats.slice(0, 5) // Top 5 genres
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
});

// @desc    Get top reviewers
// @route   GET /api/users/top-reviewers
// @access  Public
const getTopReviewers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const topReviewers = await User.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'reviewer',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRatingGiven: { $avg: '$reviews.rating' }
        }
      },
      { $match: { reviewCount: { $gt: 0 } } },
      { $sort: { reviewCount: -1, averageRatingGiven: -1 } },
      { $limit: limit },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          profilePicture: 1,
          reviewCount: 1,
          averageRatingGiven: 1,
          createdAt: 1
        }
      }
    ]);

    res.json({
      success: true,
      count: topReviewers.length,
      data: {
        reviewers: topReviewers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top reviewers'
    });
  }
});

// @desc    Follow/Unfollow user (if you have a follow system)
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow || !userToFollow.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (userToFollow._id.toString() === currentUser._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself'
    });
  }

  // Note: This assumes you have followers/following arrays in your User model
  // You might need to add these fields to your schema
  res.json({
    success: true,
    message: 'Follow functionality not implemented yet'
  });
});

module.exports = {
  getUsers,
  getUser,
  getUserByUsername,
  getUserReviews,
  getUserBooks,
  getUserStats,
  getTopReviewers,
  followUser
};