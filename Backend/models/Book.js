const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters'],
    index: true
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters'],
    index: true,
    enum: [
      'Fiction',
      'Non-Fiction',
      'Mystery',
      'Romance',
      'Science Fiction',
      'Fantasy',
      'Thriller',
      'Biography',
      'History',
      'Self-Help',
      'Business',
      'Technology',
      'Horror',
      'Adventure',
      'Comedy',
      'Drama',
      'Poetry',
      'Philosophy',
      'Religion',
      'Politics',
      'Science',
      'Health',
      'Travel',
      'Cooking',
      'Art',
      'Music',
      'Sports',
      'Children',
      'Young Adult',
      'Educational',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allow multiple documents without ISBN
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty ISBN
        // Validate ISBN-10 or ISBN-13 format
        const isbn10 = /^(?:\d{9}[\dX]|\d{10})$/;
        const isbn13 = /^(?:\d{13})$/;
        const cleanISBN = v.replace(/[-\s]/g, '');
        return isbn10.test(cleanISBN) || isbn13.test(cleanISBN);
      },
      message: 'Please enter a valid ISBN-10 or ISBN-13'
    }
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be at least 1000'],
    max: [new Date().getFullYear() + 1, 'Published year cannot be in the future'],
    validate: {
      validator: Number.isInteger,
      message: 'Published year must be an integer'
    }
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  pageCount: {
    type: Number,
    min: [1, 'Page count must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Page count must be an integer'
    }
  },
  language: {
    type: String,
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters'],
    default: 'English'
  },
  coverImage: {
    type: String, // Cloudinary URL
    default: null
  },
  coverImagePublicId: {
    type: String, // Cloudinary public_id for deletion
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who added the book is required'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  // Rating statistics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: function(val) {
      return Math.round(val * 10) / 10; // Round to 1 decimal place
    }
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // SEO and search optimization
  slug: {
    type: String,
    unique: true,
    index: true
  },
  searchKeywords: [String], // For better search functionality
  
  // Admin fields
  isFeatured: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to populate reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
  options: { sort: { createdAt: -1 } }
});

// Virtual for formatted title
bookSchema.virtual('formattedTitle').get(function() {
  return this.title.replace(/\b\w/g, l => l.toUpperCase());
});

// Virtual for reading time estimate (assuming 250 words per page, 200 words per minute)
bookSchema.virtual('estimatedReadingTime').get(function() {
  if (!this.pageCount) return null;
  const wordsPerPage = 250;
  const wordsPerMinute = 200;
  const totalWords = this.pageCount * wordsPerPage;
  const minutes = Math.round(totalWords / wordsPerMinute);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${minutes} minutes`;
  return `${hours} hours ${remainingMinutes} minutes`;
});

// Indexes for better query performance
bookSchema.index({ title: 1, author: 1 });
bookSchema.index({ genre: 1, averageRating: -1 });
bookSchema.index({ addedBy: 1, createdAt: -1 });
bookSchema.index({ averageRating: -1, totalRatings: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ slug: 1 });

// Text index for search functionality
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  genre: 'text',
  tags: 'text'
});

// Pre-save middleware to generate slug
bookSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.generateSlug();
  }
  
  // Generate search keywords
  if (this.isModified('title') || this.isModified('author') || this.isModified('genre') || this.isNew) {
    this.searchKeywords = this.generateSearchKeywords();
  }
  
  next();
});

// Method to generate slug
bookSchema.methods.generateSlug = function() {
  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  return `${baseSlug}-${this._id.toString().slice(-6)}`;
};

// Method to generate search keywords
bookSchema.methods.generateSearchKeywords = function() {
  const keywords = [];
  
  // Add title words
  if (this.title) {
    keywords.push(...this.title.toLowerCase().split(/\s+/));
  }
  
  // Add author words
  if (this.author) {
    keywords.push(...this.author.toLowerCase().split(/\s+/));
  }
  
  // Add genre
  if (this.genre) {
    keywords.push(this.genre.toLowerCase());
  }
  
  // Add tags
  if (this.tags && this.tags.length > 0) {
    keywords.push(...this.tags.map(tag => tag.toLowerCase()));
  }
  
  // Remove duplicates and empty strings
  return [...new Set(keywords.filter(keyword => keyword.length > 0))];
};

// Method to update rating statistics
bookSchema.methods.updateRatingStats = async function() {
  const reviews = await mongoose.model('Review').find({ book: this._id });
  
  if (reviews.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    this.reviewCount = 0;
    this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return await this.save();
  }
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = totalRating / reviews.length;
  this.totalRatings = reviews.length;
  this.reviewCount = reviews.length;
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    distribution[review.rating]++;
  });
  this.ratingDistribution = distribution;
  
  return await this.save();
};

// Static method to search books
bookSchema.statics.searchBooks = function(query, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    genre,
    author,
    minRating,
    maxRating
  } = options;
  
  const searchQuery = { isActive: true };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Genre filter
  if (genre && genre !== 'all') {
    searchQuery.genre = genre;
  }
  
  // Author filter
  if (author) {
    searchQuery.author = new RegExp(author, 'i');
  }
  
  // Rating filter
  if (minRating || maxRating) {
    searchQuery.averageRating = {};
    if (minRating) searchQuery.averageRating.$gte = Number(minRating);
    if (maxRating) searchQuery.averageRating.$lte = Number(maxRating);
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(searchQuery)
    .populate('addedBy', 'username fullName')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));
};

// Static method to get popular books
bookSchema.statics.getPopularBooks = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(limit)
    .populate('addedBy', 'username fullName');
};

// Static method to get recently added books
bookSchema.statics.getRecentBooks = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('addedBy', 'username fullName');
};

// Static method to get featured books
bookSchema.statics.getFeaturedBooks = function(limit = 5) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ averageRating: -1 })
    .limit(limit)
    .populate('addedBy', 'username fullName');
};

// Static method to get books by genre
bookSchema.statics.getBooksByGenre = function(genre, limit = 10) {
  return this.find({ isActive: true, genre })
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(limit)
    .populate('addedBy', 'username fullName');
};

// Pre-remove middleware to handle cleanup
bookSchema.pre('remove', async function(next) {
  try {
    // Remove all reviews for this book
    await this.model('Review').deleteMany({ book: this._id });
    
    // Delete cover image from Cloudinary if exists
    if (this.coverImagePublicId) {
      const { deleteImage } = require('../config/cloudinary');
      await deleteImage(this.coverImagePublicId);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;