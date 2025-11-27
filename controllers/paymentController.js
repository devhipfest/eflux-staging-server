const Payment = require('../models/Payment')

// Get user's payments with pagination
const getUserPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Payment.countDocuments({ user: req.user._id })
    const payments = await Payment.find({ user: req.user._id })
      .populate('session')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(total / limit)

    res.json({
      data: {
        data: payments,
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

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('user session')
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // Check if user owns this payment or is admin
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ data: payment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create payment
const createPayment = async (req, res) => {
  try {
    const { session, amount, method, transactionId } = req.body

    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and method are required' })
    }

    const payment = new Payment({
      user: req.user._id,
      session,
      amount,
      method,
      transactionId,
      status: 'pending',
    })

    await payment.save()
    await payment.populate('user session')

    res.status(201).json({ data: payment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, gatewayResponse } = req.body

    if (!status) {
      return res.status(400).json({ message: 'Status is required' })
    }

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // Only admin can update status for now
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const updateData = { status }
    if (gatewayResponse) updateData.gatewayResponse = gatewayResponse
    if (status === 'completed') updateData.completedAt = new Date()

    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate('user session')

    res.json({ data: updatedPayment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getUserPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
}
