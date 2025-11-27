const express = require('express')
const { authenticate } = require('../middleware/auth')
const {
  getUserPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
} = require('../controllers/paymentController')

const router = express.Router()

// Get user's payments
router.get('/', authenticate, getUserPayments)

// Get payment by ID
router.get('/:id', authenticate, getPaymentById)

// Create payment (usually called internally or by payment gateway webhook)
router.post('/', authenticate, createPayment)

// Update payment status (usually by payment gateway webhook or admin)
router.put('/:id/status', authenticate, updatePaymentStatus)

module.exports = router
