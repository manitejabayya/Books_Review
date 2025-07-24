const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system notifications
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'new_review', // Someone reviewed a book you added
      'review_vote', // Someone voted on your review
      'book_featured', // Your book was featured
      'review_flagged', // Your review was flagged
      'book_approved', // Your book was approved
      'book_rejected', // Your book was rejected
      'welcome', // Welcome message for new users
      'system_update', // System maintenance/updates
      'milestone', // User reached a milestone (10 reviews, etc.)
      'recommendation' // Book recommendation based on preferences
    ],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  // Related entities
  relatedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  relatedReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null
  },
  // Notification status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  // Action URL (where to redirect when clicked)
  actionUrl: {
    type: String,
    default: null
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Expiry date (for temporary notifications)
  expiresAt: {
    type: Date,
    default: null
  },
  // Delivery settings
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  // Metadata for different notification types
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return this.createdAt.toLocaleDateString();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  }
  return this;
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const {
    recipient,
    sender = null,
    type,
    title,
    message,
    relatedBook = null,
    relatedReview = null,
    actionUrl = null,
    priority = 'medium',
    expiresAt = null,
    metadata = {}
  } = data;
  
  const notification = new this({
    recipient,
    sender,
    type,
    title,
    message,
    relatedBook,
    relatedReview,
    actionUrl,
    priority,
    expiresAt,
    metadata
  });
  
  return await notification.save();
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type = null
  } = options;
  
  const query = { recipient: userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('sender', 'username fullName profilePicture')
    .populate('relatedBook', 'title author coverImage')
    .populate('relatedReview', 'rating reviewText')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to create new review notification
notificationSchema.statics.createNewReviewNotification = async function(review) {
  try {
    const Book = mongoose.model('Book');
    const User = mongoose.model('User');
    
    const book = await Book.findById(review.book).populate('addedBy');
    const reviewer = await User.findById(review.reviewer);
    
    if (book && book.addedBy && book.addedBy._id.toString() !== review.reviewer.toString()) {
      await this.createNotification({
        recipient: book.addedBy._id,
        sender: review.reviewer,
        type: 'new_review',
        title: 'New Review on Your Book',
        message: `${reviewer.fullName} reviewed "${book.title}" and gave it ${review.rating} stars.`,
        relatedBook: book._id,
        relatedReview: review._id,
        actionUrl: `/books/${book._id}#reviews`,
        metadata: {
          bookTitle: book.title,
          rating: review.rating,
          reviewerName: reviewer.fullName
        }
      });
    }
  } catch (error) {
    console.error('Error creating new review notification:', error);
  }
};

// Static method to create review vote notification
notificationSchema.statics.createReviewVoteNotification = async function(review, voter, helpful) {
  try {
    const User = mongoose.model('User');
    const Book = mongoose.model('Book');
    
    const voterUser = await User.findById(voter);
    const book = await Book.findById(review.book);
    
    if (review.reviewer.toString() !== voter.toString()) {
      const voteType = helpful ? 'helpful' : 'not helpful';
      
      await this.createNotification({
        recipient: review.reviewer,
        sender: voter,
        type: 'review_vote',
        title: 'Someone Voted on Your Review',
        message: `${voterUser.fullName} found your review of "${book.title}" ${voteType}.`,
        relatedBook: book._id,
        relatedReview: review._id,
        actionUrl: `/books/${book._id}#review-${review._id}`,
        priority: 'low',
        metadata: {
          bookTitle: book.title,
          voteType: voteType,
          voterName: voterUser.fullName
        }
      });
    }
  } catch (error) {
    console.error('Error creating review vote notification:', error);
  }
};

// Static method to create milestone notification
notificationSchema.statics.createMilestoneNotification = async function(userId, milestone) {
  const milestones = {
    first_review: {
      title: '🎉 First Review!',
      message: 'Congratulations on writing your first book review! Keep sharing your thoughts with the community.'
    },
    reviews_10: {
      title: '📚 10 Reviews Milestone!',
      message: 'Amazing! You\'ve written 10 book reviews. You\'re becoming a valuable community member!'
    },
    reviews_50: {
      title: '⭐ 50 Reviews Achievement!',
      message: 'Incredible! You\'ve reached 50 reviews. Your insights are helping many readers discover great books!'
    },
    reviews_100: {
      title: '🏆 100 Reviews Legend!',
      message: 'Phenomenal! You\'ve written 100 reviews. You\'re now a true book review legend in our community!'
    },
    first_book: {
      title: '📖 First Book Added!',
      message: 'Great job on adding your first book to our platform! Help others discover amazing reads.'
    },
    books_10: {
      title: '📚 Book Curator!',
      message: 'You\'ve added 10 books to our platform. Thank you for helping build our amazing book collection!'
    }
  };
  
  const milestoneData = milestones[milestone];
  if (milestoneData) {
    await this.createNotification({
      recipient: userId,
      sender: null, // System notification
      type: 'milestone',
      title: milestoneData.title,
      message: milestoneData.message,
      priority: 'medium',
      metadata: {
        milestone: milestone,
        achievedAt: new Date()
      }
    });
  }
};

// Static method to create welcome notification
notificationSchema.statics.createWelcomeNotification = async function(userId) {
  await this.createNotification({
    recipient: userId,
    sender: null, // System notification
    type: 'welcome',
    title: '🎉 Welcome to Book Review Platform!',
    message: 'Welcome to our community! Start by exploring books, writing reviews, and discovering your next great read.',
    actionUrl: '/books',
    priority: 'medium',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    metadata: {
      isWelcome: true,
      version: '1.0'
    }
  });
};

// Pre-save middleware to set default expiry for certain notification types
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiry for temporary notification types
    const temporaryTypes = ['system_update', 'welcome'];
    if (temporaryTypes.includes(this.type)) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;