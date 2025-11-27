const Transaction = require('../models/Transaction')

// Get all transactions with pagination
const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let query = {}

    // Build filter query
    if (req.query.gateway) {
      query.gateway = req.query.gateway
    }
    if (req.query.status) {
      query.status = req.query.status
    }
    if (req.query.referenceCode) {
      query.referenceCode = req.query.referenceCode
    }
    if (req.query.sessionId) {
      query.sessionId = req.query.sessionId
    }

    const total = await Transaction.countDocuments(query)
    const transactions = await Transaction.find(query)
      .populate('sessionId', 'user machine port startTime endTime status')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(total / limit)

    res.json({
      data: {
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      'sessionId',
      'user machine port startTime endTime status',
    )
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }
    res.json({ data: transaction })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
}
