const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// In-memory data store for images (replace with database in production)
const imagesData = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Mountain landscape',
    width: 800,
    height: 600,
    category: 'nature',
    tags: ['mountain', 'landscape'],
    description: 'Beautiful mountain landscape with a lake view',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    isDeleted: false
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Mountain river',
    width: 800,
    height: 600,
    category: 'nature',
    tags: ['river', 'mountain'],
    description: 'Clear mountain river flowing through rocks',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    isDeleted: false
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Forest landscape',
    width: 800,
    height: 600,
    category: 'nature',
    tags: ['forest', 'landscape'],
    description: 'Deep forest with morning light',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isDeleted: false
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Modern building',
    width: 800,
    height: 600,
    category: 'architecture',
    tags: ['building', 'modern'],
    description: 'Modern glass building with geometric patterns',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    isDeleted: false
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Skyscraper',
    width: 800,
    height: 600,
    category: 'architecture',
    tags: ['building', 'skyscraper'],
    description: 'Tall skyscraper viewed from below',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isDeleted: false
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1486972863166-06e4c4d2f347?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Historical building',
    width: 800,
    height: 600,
    category: 'architecture',
    tags: ['building', 'historical'],
    description: 'Historical building with classical architecture',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    isDeleted: false
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1593620659911-0da583be5150?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Dog portrait',
    width: 800,
    height: 600,
    category: 'animals',
    tags: ['dog', 'pet'],
    description: 'Cute dog portrait close-up',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isDeleted: false
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Black dog',
    width: 800,
    height: 600,
    category: 'animals',
    tags: ['dog', 'black'],
    description: 'Black dog sitting and looking at camera',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    isDeleted: false
  },
  {
    id: '9',
    src: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
    alt: 'Bear',
    width: 800,
    height: 600,
    category: 'animals',
    tags: ['bear', 'wildlife'],
    description: 'Bear in its natural habitat',
    createdAt: new Date().toISOString(), // Just added
    isDeleted: false
  }
];

// Get all images, optionally filtered
router.get('/', (req, res) => {
  const { includeDeleted } = req.query;
  
  let result = imagesData;
  
  // Only return non-deleted images by default
  if (includeDeleted !== 'true') {
    result = result.filter(img => !img.isDeleted);
  }
  
  res.json(result);
});

// Get images by category
router.get('/category/:category', (req, res) => {
  const category = req.params.category;
  const { includeDeleted } = req.query;
  
  let filteredImages = imagesData;
  
  if (category !== 'all') {
    filteredImages = filteredImages.filter(image => 
      image.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Only return non-deleted images by default
  if (includeDeleted !== 'true') {
    filteredImages = filteredImages.filter(img => !img.isDeleted);
  }
  
  res.json(filteredImages);
});

// Get images in trash (deleted)
router.get('/trash', (req, res) => {
  const trashedImages = imagesData.filter(img => img.isDeleted);
  res.json(trashedImages);
});

// Get single image by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const image = imagesData.find(img => img.id === id);
  
  if (!image) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  res.json(image);
});

// Upload a new image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { filename, path: filePath } = req.file;
    const { alt, category, description, tags, caption } = req.body;

    // Process the image with sharp to get dimensions and create optimized versions
    const imageInfo = await sharp(filePath).metadata();
    
    // Create a unique ID
    const id = Date.now().toString();
    
    // Create a new image record
    const newImage = {
      id,
      src: `/uploads/${filename}`,
      alt: alt || filename,
      width: imageInfo.width,
      height: imageInfo.height,
      category: category || 'uncategorized',
      tags: tags ? JSON.parse(tags) : [],
      description: description || '',
      caption: caption || '',
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    
    // Add to our "database"
    imagesData.push(newImage);
    
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Soft delete an image (move to trash)
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const imageIndex = imagesData.findIndex(img => img.id === id);
  
  if (imageIndex === -1) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  // Mark as deleted instead of removing
  imagesData[imageIndex].isDeleted = true;
  
  res.json({ 
    message: 'Image moved to trash', 
    image: imagesData[imageIndex] 
  });
});

// Permanently delete an image
router.delete('/:id/permanent', (req, res) => {
  const id = req.params.id;
  const imageIndex = imagesData.findIndex(img => img.id === id);
  
  if (imageIndex === -1) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  // Remove from our "database"
  const deletedImage = imagesData.splice(imageIndex, 1)[0];
  
  // If it's a local file (not an external URL), delete the file
  if (deletedImage.src.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', deletedImage.src);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  res.json({ message: 'Image permanently deleted', image: deletedImage });
});

// Restore a deleted image from trash
router.post('/:id/restore', (req, res) => {
  const id = req.params.id;
  const imageIndex = imagesData.findIndex(img => img.id === id);
  
  if (imageIndex === -1) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  // Make sure the image is currently deleted
  if (!imagesData[imageIndex].isDeleted) {
    return res.status(400).json({ message: 'Image is not in trash' });
  }
  
  // Mark as not deleted
  imagesData[imageIndex].isDeleted = false;
  
  res.json({ 
    message: 'Image restored from trash', 
    image: imagesData[imageIndex] 
  });
});

// Update image details (patch allows partial updates)
router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const imageIndex = imagesData.findIndex(img => img.id === id);
  
  if (imageIndex === -1) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  // Fields that can be updated
  const updatableFields = ['alt', 'category', 'tags', 'description', 'caption'];
  
  // Update only the provided fields
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      imagesData[imageIndex][field] = req.body[field];
    }
  });
  
  res.json({ 
    message: 'Image updated successfully', 
    image: imagesData[imageIndex] 
  });
});

// Empty trash (permanently delete all trashed images)
router.delete('/trash/empty', (req, res) => {
  const trashedImagesCount = imagesData.filter(img => img.isDeleted).length;
  
  // Delete local files for images that need to be removed
  imagesData
    .filter(img => img.isDeleted && img.src.startsWith('/uploads/'))
    .forEach(img => {
      const filePath = path.join(__dirname, '..', img.src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  
  // Remove all trashed images
  const newImagesData = imagesData.filter(img => !img.isDeleted);
  const deletedCount = imagesData.length - newImagesData.length;
  
  // Update the array
  imagesData.length = 0;
  imagesData.push(...newImagesData);
  
  res.json({ 
    message: `${deletedCount} images permanently deleted`, 
    deletedCount 
  });
});

module.exports = router; 