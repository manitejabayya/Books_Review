const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required'],
    index: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer reference is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  isRecommended: {
    type: Boolean,
    default: null // null means no recommendation given
  },
  readingStatus: {
    type: String,
    enum: ['completed', 'currently-reading', 'want-to-read', 'dnf'], // dnf = did not finish
    default: 'completed'
  },
  readingStartDate: {
    type: Date,
    default: null
  },
  readingEndDate: {
    type: Date,
    default: null
  },
  // Helpful votes from other users
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  // Users who voted this review as helpful
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other'],
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  // Admin/Moderator who approved/rejected
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  // Review metrics
  characterCount: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
reviewSchema.index({ book: 1, reviewer: 1 }, { unique: true }); // One review per user per book
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ rating: -1, helpfulVotes: -1 });
reviewSchema.index({ isApproved: 1, isDeleted: 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Virtual for reading duration (if both dates are provided)
reviewSchema.virtual('readingDuration').get(function() {
  if (!this.readingStartDate || !this.readingEndDate) return null;
  
  const timeDiff = this.readingEndDate - this.readingStartDate;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) return '1 day';
  if (daysDiff < 7) return `${daysDiff} days`;
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks`;
  if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months`;
  return `${Math.floor(daysDiff / 365)} years`;
});

// Virtual for star display
reviewSchema.virtual('starDisplay').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Pre-save middleware to calculate text metrics
reviewSchema.pre('save', function(next) {
  if (this.isModified('reviewText')) {
    this.characterCount = this.reviewText.length;
    this.wordCount = this.reviewText.trim().split(/\s+/).length;
    // Estimate reading time (200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  // Validate reading dates
  if (this.readingStartDate && this.readingEndDate) {
    if (this.readingStartDate > this.readingEndDate) {
      return next(new Error('Reading start date cannot be after end date'));
    }
  }
  
  next();
});

// Post-save middleware to update book rating statistics
reviewSchema.post('save', async function(doc) {
  try {
    const Book = mongoose.model('Book');
    const book = await Book.findById(doc.book);
    if (book) {
      await book.updateRatingStats();
    }
  } catch (error) {
    console.error('Error updating book rating stats:', error);
  }
});

// Post-remove middleware to update book rating statistics
reviewSchema.post('remove', async function(doc) {
  try {
    const Book = mongoose.model('Book');
    const book = await Book.findById(doc.book);
    if (book) {
      await book.updateRatingStats();
    }
  } catch (error) {
    console.error('Error updating book rating stats after review removal:', error);
  }
});

// Instance method to check if user has voted on this review
reviewSchema.methods.hasUserVoted = function(userId) {
  return this.votedBy.some(vote => vote.user.toString() === userId.toString());
};

// Instance method to get user's vote
reviewSchema.methods.getUserVote = function(userId) {
  const vote = this.votedBy.find(vote => vote.user.toString() === userId.toString());
  return vote ? vote.helpful : null;
};

// Instance method to add/update vote
reviewSchema.methods.addVote = async function(userId, helpful) {
  const existingVoteIndex = this.votedBy.findIndex(
    vote => vote.user.toString() === userId.toString()
  );
  
  if (existingVoteIndex !== -1) {
    // Update existing vote
    const oldVote = this.votedBy[existingVoteIndex].helpful;
    this.votedBy[existingVoteIndex].helpful = helpful;
    this.votedBy[existingVoteIndex].votedAt = new Date();
    
    // Update vote counts
    if (oldVote && !helpful) {
      this.helpfulVotes--;
    } else if (!oldVote && helpful) {
      this.helpfulVotes++;
    }
  } else {
    // Add new vote
    this.votedBy.push({
      user: userId,
      helpful: helpful,
      votedAt: new Date()
    });
    
    this.totalVotes++;
    if (helpful) {
      this.helpfulVotes++;
    }
  }
  
  return await this.save();
};

// Instance method to remove vote
reviewSchema.methods.removeVote = async function(userId) {
  const voteIndex = this.votedBy.findIndex(
    vote => vote.user.toString() === userId.toString()
  );
  
  if (voteIndex !== -1) {
    const vote = this.votedBy[voteIndex];
    this.votedBy.splice(voteIndex, 1);
    this.totalVotes--;
    
    if (vote.helpful) {
      this.helpfulVotes--;
    }
    
    return await this.save();
  }
  
  return this;
};

// Static method to get reviews for a book with pagination
reviewSchema.statics.getBookReviews = function(bookId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    rating = null,
    minHelpfulness = null
  } = options;
  
  const query = {
    book: bookId,
    isApproved: true,
    isDeleted: false
  };
  
  // Filter by rating
  if (rating) {
    query.rating = Number(rating);
  }
  
  // Filter by minimum helpfulness
  if (minHelpfulness) {
    query.helpfulVotes = { $gte: Number(minHelpfulness) };
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('reviewer', 'username fullName profilePicture')
    .populate('book', 'title author')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));
};

// Static method to get user reviews
reviewSchema.statics.getUserReviews = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    rating = null,
    readingStatus = null
  } = options;
  
  const query = {
    reviewer: userId,
    isDeleted: false
  };
  
  if (rating) {
    query.rating = Number(rating);
  }
  
  if (readingStatus) {
    query.readingStatus = readingStatus;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('book', 'title author genre coverImage averageRating')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));
};

// Static method to get top reviews (most helpful)
reviewSchema.statics.getTopReviews = function(limit = 10) {
  return this.find({
    isApproved: true,
    isDeleted: false,
    totalVotes: { $gte: 3 } // Minimum 3 votes to be considered
  })
    .sort({ helpfulVotes: -1, totalVotes: -1 })
    .limit(limit)
    .populate('reviewer', 'username fullName profilePicture')
    .populate('book', 'title author genre coverImage');
};

// Static method to get review statistics for a book
reviewSchema.statics.getBookReviewStats = async function(bookId) {
  const stats = await this.aggregate([
    {
      $match: {
        book: mongoose.Types.ObjectId(bookId),
        isApproved: true,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        averageWordCount: { $avg: '$wordCount' },
        totalHelpfulVotes: { $sum: '$helpfulVotes' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      averageWordCount: 0,
      totalHelpfulVotes: 0
    };
  }
  
  const result = stats[0];
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });
  
  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution,
    averageWordCount: Math.round(result.averageWordCount),
    totalHelpfulVotes: result.totalHelpfulVotes
  };
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;