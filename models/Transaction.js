const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
      required: false,
    },

    // thông tin từ Sepay
    gateway: { type: String }, // Vietcombank
    transactionDate: { type: Date, required: true },
    accountNumber: { type: String, required: true }, // tài khoản nhận tiền
    code: { type: String }, // ( null cũng oke)
    content: { type: String }, // nội dung chuyển khoản
    transferType: { type: String }, // in / out
    transferAmount: { type: Number, required: true }, // số tiền user chuyển

    accumulated: { type: Number }, // số dư sau giao dịch
    subAccount: { type: String }, // nếu dùng tài khoản phụ

    referenceCode: {
      type: String,
      unique: true, // tránh trùng giao dịch
      required: true,
      index: true,
    },

    description: { type: String },

    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Transaction', transactionSchema)
