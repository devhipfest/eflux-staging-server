const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession', // Assuming we'll have a session model later
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'VND',
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'e-wallet', 'bank_transfer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      unique: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // Store gateway response data
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('Payment', paymentSchema)
