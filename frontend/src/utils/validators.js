export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateRating = (rating) => {
  const num = parseInt(rating);
  return num >= 1 && num <= 5;
};

export const validateBookForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.title)) {
    errors.title = 'Title is required';
  }
  
  if (!validateRequired(formData.author)) {
    errors.author = 'Author is required';
  }
  
  if (!validateRequired(formData.genre)) {
    errors.genre = 'Genre is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateReviewForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.review_text)) {
    errors.review_text = 'Review text is required';
  }
  
  if (!validateRating(formData.rating)) {
    errors.rating = 'Rating must be between 1 and 5';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSignupForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.name)) {
    errors.name = 'Name is required';
  }
  
  if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};