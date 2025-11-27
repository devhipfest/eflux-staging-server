const mongoose = require('mongoose')

const WebhookLogSchema = new mongoose.Schema(
  {
    ip: { type: String }, // địa chỉ IP của SePay gửi
    headers: { type: Object }, // toàn bộ headers
    body: { type: Object }, // raw data từ webhook
    status: {
      type: String,
      enum: ['received', 'processed', 'error'],
      default: 'received',
    },
    errorMessage: { type: String, default: null }, // nếu có lỗi xử lý
  },
  { timestamps: true },
)

module.exports = mongoose.model('WebhookLog', WebhookLogSchema)
