const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for book covers
const bookCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'book-review-platform/book-covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 600, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      // Generate unique public_id based on timestamp and original name
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `book_cover_${timestamp}_${originalName}`;
    }
  }
});

// Configure Cloudinary storage for user profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'book-review-platform/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', quality: 'auto', gravity: 'face' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user ? req.user.id : 'anonymous';
      return `profile_${userId}_${timestamp}`;
    }
  }
});

// Multer configurations
const uploadBookCover = multer({
  storage: bookCoverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  const urlParts = cloudinaryUrl.split('/');
  const publicIdWithExtension = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExtension.split('.')[0];
  
  // Include folder path if exists
  const folderIndex = urlParts.indexOf('book-review-platform');
  if (folderIndex !== -1) {
    const folderPath = urlParts.slice(folderIndex, -1).join('/');
    return `${folderPath}/${publicId}`;
  }
  
  return publicId;
};

module.exports = {
  cloudinary,
  uploadBookCover,
  uploadProfilePicture,
  deleteImage,
  extractPublicId
};