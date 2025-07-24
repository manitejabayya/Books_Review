const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const User = require('../models/User');
const Book = require('../models/Book');
require('dotenv').config();

// Configuration
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const PROFILE_PICS_DIR = path.join(UPLOAD_DIR, 'profiles');
const BOOK_COVERS_DIR = path.join(UPLOAD_DIR, 'covers');
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Image processing configuration
const IMAGE_SIZES = {
  profile: {
    small: { width: 50, height: 50 },
    medium: { width: 150, height: 150 },
    large: { width: 300, height: 300 }
  },
  cover: {
    small: { width: 200, height: 300 },
    medium: { width: 400, height: 600 },
    large: { width: 600, height: 900 }
  }
};

/**
 * Create upload directories if they don't exist
 */
async function createDirectories() {
  const directories = [
    UPLOAD_DIR,
    PROFILE_PICS_DIR,
    BOOK_COVERS_DIR,
    THUMBNAILS_DIR,
    path.join(PROFILE_PICS_DIR, 'small'),
    path.join(PROFILE_PICS_DIR, 'medium'),
    path.join(PROFILE_PICS_DIR, 'large'),
    path.join(BOOK_COVERS_DIR, 'small'),
    path.join(BOOK_COVERS_DIR, 'medium'),
    path.join(BOOK_COVERS_DIR, 'large')
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✓ Directory created: ${dir}`);
    } catch (error) {
      console.error(`✗ Error creating directory ${dir}:`, error.message);
    }
  }
}

/**
 * Process and resize image
 */
async function processImage(inputPath, outputPath, options = {}) {
  try {
    const { width, height, quality = 80 } = options;
    
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(outputPath);

    console.log(`✓ Processed image: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing image ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Migrate user profile pictures
 */
async function migrateUserImages() {
  console.log('\n🔄 Starting user profile picture migration...');
  
  try {
    const users = await User.find({ profilePicture: { $exists: true, $ne: null } });
    console.log(`Found ${users.length} users with profile pictures`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const oldImagePath = path.join(__dirname, '../', user.profilePicture);
        
        // Check if old image exists
        try {
          await fs.access(oldImagePath);
        } catch (error) {
          console.log(`⚠ Profile picture not found for user ${user.username}: ${oldImagePath}`);
          continue;
        }

        // Generate new filename
        const extension = path.extname(user.profilePicture);
        const newFilename = `${user._id}${extension}`;

        // Process different sizes
        const sizes = ['small', 'medium', 'large'];
        let allProcessed = true;

        for (const size of sizes) {
          const outputPath = path.join(PROFILE_PICS_DIR, size, newFilename);
          const processed = await processImage(
            oldImagePath, 
            outputPath, 
            IMAGE_SIZES.profile[size]
          );
          
          if (!processed) {
            allProcessed = false;
            break;
          }
        }

        if (allProcessed) {
          // Update user record with new path
          const newProfilePicturePath = `uploads/profiles/medium/${newFilename}`;
          await User.findByIdAndUpdate(user._id, {
            profilePicture: newProfilePicturePath
          });

          migratedCount++;
          console.log(`✓ Migrated profile picture for user: ${user.username}`);
        } else {
          errorCount++;
        }

      } catch (error) {
        console.error(`✗ Error migrating user ${user.username}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 User Migration Summary:`);
    console.log(`   ✓ Successfully migrated: ${migratedCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error during user image migration:', error);
  }
}

/**
 * Migrate book cover images
 */
async function migrateBookImages() {
  console.log('\n🔄 Starting book cover image migration...');
  
  try {
    const books = await Book.find({ coverImage: { $exists: true, $ne: null } });
    console.log(`Found ${books.length} books with cover images`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const book of books) {
      try {
        const oldImagePath = path.join(__dirname, '../', book.coverImage);
        
        // Check if old image exists
        try {
          await fs.access(oldImagePath);
        } catch (error) {
          console.log(`⚠ Cover image not found for book "${book.title}": ${oldImagePath}`);
          continue;
        }

        // Generate new filename
        const extension = path.extname(book.coverImage);
        const newFilename = `${book._id}${extension}`;

        // Process different sizes
        const sizes = ['small', 'medium', 'large'];
        let allProcessed = true;

        for (const size of sizes) {
          const outputPath = path.join(BOOK_COVERS_DIR, size, newFilename);
          const processed = await processImage(
            oldImagePath, 
            outputPath, 
            IMAGE_SIZES.cover[size]
          );
          
          if (!processed) {
            allProcessed = false;
            break;
          }
        }

        if (allProcessed) {
          // Update book record with new path
          const newCoverImagePath = `uploads/covers/medium/${newFilename}`;
          await Book.findByIdAndUpdate(book._id, {
            coverImage: newCoverImagePath
          });

          migratedCount++;
          console.log(`✓ Migrated cover image for book: "${book.title}"`);
        } else {
          errorCount++;
        }

      } catch (error) {
        console.error(`✗ Error migrating book "${book.title}":`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Book Migration Summary:`);
    console.log(`   ✓ Successfully migrated: ${migratedCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error during book image migration:', error);
  }
}

/**
 * Clean up old image files
 */
async function cleanupOldImages() {
  console.log('\n🧹 Starting cleanup of old image files...');
  
  // This is a placeholder - implement based on your old image storage structure
  console.log('⚠ Cleanup function not implemented - please review old images manually');
}

/**
 * Validate migrated images
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration...');
  
  try {
    // Check users
    const usersWithImages = await User.find({ profilePicture: { $exists: true, $ne: null } });
    let validUserImages = 0;
    
    for (const user of usersWithImages) {
      const imagePath = path.join(__dirname, '../', user.profilePicture);
      try {
        await fs.access(imagePath);
        validUserImages++;
      } catch (error) {
        console.log(`⚠ Missing user image: ${user.username} - ${user.profilePicture}`);
      }
    }

    // Check books
    const booksWithImages = await Book.find({ coverImage: { $exists: true, $ne: null } });
    let validBookImages = 0;
    
    for (const book of booksWithImages) {
      const imagePath = path.join(__dirname, '../', book.coverImage);
      try {
        await fs.access(imagePath);
        validBookImages++;
      } catch (error) {
        console.log(`⚠ Missing book image: "${book.title}" - ${book.coverImage}`);
      }
    }

    console.log(`\n📊 Validation Summary:`);
    console.log(`   User images: ${validUserImages}/${usersWithImages.length} valid`);
    console.log(`   Book images: ${validBookImages}/${booksWithImages.length} valid`);

  } catch (error) {
    console.error('Error during validation:', error);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting image migration process...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to database');

    // Create directories
    await createDirectories();

    // Run migrations
    await migrateUserImages();
    await migrateBookImages();

    // Validate migration
    await validateMigration();

    // Optional cleanup (uncomment if needed)
    // await cleanupOldImages();

    console.log('\n🎉 Image migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateUserImages,
  migrateBookImages,
  validateMigration,
  createDirectories
};