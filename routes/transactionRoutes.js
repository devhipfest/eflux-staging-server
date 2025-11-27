const express = require('express')
const { authenticate } = require('../middleware/auth')
const { getTransactions, getTransactionById } = require('../controllers/transactionController')

const router = express.Router()

// Get all transactions
router.get('/', authenticate, getTransactions)

// Get transaction by ID
router.get('/:id', authenticate, getTransactionById)

module.exports = router
