const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    // Map tới ChargingSession (nếu là giao dịch EFLUX)
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
      required: false,
    },

    // ====== DỮ LIỆU THUẦN SEPAY ======
    gateway: { type: String }, // vietcombank, mbbank...
    transactionDate: { type: Date, required: true },
    accountNumber: { type: String, required: true },
    code: { type: String },
    content: { type: String }, // nội dung CK
    transferType: { type: String }, // in / out
    transferAmount: { type: Number, required: true },
    accumulated: { type: Number },
    subAccount: { type: String },

    referenceCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    description: { type: String },

    // ====== STATUS NỘI BỘ HỆ THỐNG ======
    status: {
      type: String,
      enum: ['success', 'ignored'],
      default: 'success',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Transaction', transactionSchema)
