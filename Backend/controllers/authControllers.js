const User = require('../models/User');
const Notification = require('../models/Notifications');
const { asyncHandler } = require('../middlewares/error');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  console.log('[REGISTER] Body:', req.body);
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[REGISTER] Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, email, password, firstName, lastName, favoriteGenres, bio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username.toLowerCase() }
    ]
  });

  if (existingUser) {
    const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
    return res.status(400).json({
      success: false,
      message: `User with this ${field} already exists`
    });
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    favoriteGenres: favoriteGenres || [],
    bio: bio || ''
  });

  // Create welcome notification
  await Notification.createWelcomeNotification(user._id);

  // Generate JWT token
  const token = user.generateAuthToken();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  console.log('[LOGIN] Body:', req.body);
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[LOGIN] Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    // Find user by credentials (this method includes password verification)
    const user = await User.findByCredentials(email.toLowerCase(), password);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('reviews', 'book rating reviewText createdAt')
    .populate('booksAdded', 'title author genre averageRating');

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    favoriteGenres: req.body.favoriteGenres
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Update username
// @route   PUT /api/auth/username
// @access  Private
const updateUsername = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username } = req.body;

  // Check if username is already taken
  const isTaken = await User.isUsernameTaken(username, req.user.id);
  if (isTaken) {
    return res.status(400).json({
      success: false,
      message: 'Username is already taken'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username: username.toLowerCase() },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Username updated successfully',
    data: {
      user
    }
  });
});

// @desc    Update email
// @route   PUT /api/auth/email
// @access  Private
const updateEmail = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Get user with password to verify
  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  // Check if email is already taken
  const isTaken = await User.isEmailTaken(email, req.user.id);
  if (isTaken) {
    return res.status(400).json({
      success: false,
      message: 'Email is already taken'
    });
  }

  // Update email
  user.email = email.toLowerCase();
  user.emailVerified = false; // Reset email verification status
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: 'Email updated successfully',
    data: {
      user: userResponse
    }
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { password } = req.body;

  // Get user with password to verify
  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  // Delete user account
  await User.findByIdAndDelete(req.user.id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateUsername,
  updateEmail,
  logout,
  deleteAccount
};