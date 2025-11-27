const express = require('express')
const { authenticate } = require('../middleware/auth')
const { register, login, getProfile, updateProfile } = require('../controllers/authController')

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Authenticated routes
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)

module.exports = router
