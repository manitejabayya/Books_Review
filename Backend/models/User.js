const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  favoriteGenres: [{
    type: String,
    trim: true
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  averageRatingGiven: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to populate user's reviews
userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewer'
});

// Virtual to populate books added by user
userSchema.virtual('booksAdded', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'addedBy'
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      username: this.username,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'book-review-platform',
      audience: 'book-review-platform-users'
    }
  );
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.email; // Hide email in public profile
  return userObject;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};

// Static method to check if username exists
userSchema.statics.isUsernameTaken = async function(username, excludeUserId = null) {
  const query = { username: new RegExp(`^${username}$`, 'i') };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// Static method to check if email exists
userSchema.statics.isEmailTaken = async function(email, excludeUserId = null) {
  const query = { email: email.toLowerCase() };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// Pre-remove middleware to handle cleanup
userSchema.pre('remove', async function(next) {
  try {
    // Remove all reviews by this user
    await this.model('Review').deleteMany({ reviewer: this._id });
    
    // Update books added by this user to set addedBy to null
    await this.model('Book').updateMany(
      { addedBy: this._id },
      { addedBy: null }
    );
    
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;