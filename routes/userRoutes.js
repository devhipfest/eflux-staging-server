const express = require('express')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { createUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController')

const router = express.Router()

// Admin only routes for user management
router.post('/', authenticate, requireAdmin, createUser) // Create station owner
router.get('/', authenticate, requireAdmin, getAllUsers) // Get all users
router.put('/:id', authenticate, requireAdmin, updateUser) // Update user
router.delete('/:id', authenticate, requireAdmin, deleteUser) // Delete user

module.exports = router
