require('dotenv').config()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const path = require('path')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer storage configuration (memory storage for Cloudinary)
const storage = multer.memoryStorage()

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Upload to Cloudinary
const uploadToCloudinary = async (buffer, folder = 'charging_platform') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format,
            size: result.bytes,
          })
        }
      })
      .end(buffer)
  })
}

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

// Single file upload middleware
const uploadSingle = (fieldName) => upload.single(fieldName)

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount)

// Handle single file upload
const handleSingleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const result = await uploadToCloudinary(req.file.buffer)
    req.uploadedFile = result
    next()
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
}

// Handle multiple files upload
const handleMultipleUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer))
    const results = await Promise.all(uploadPromises)
    req.uploadedFiles = results
    next()
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deleteFromCloudinary,
  handleSingleUpload,
  handleMultipleUpload,
}
