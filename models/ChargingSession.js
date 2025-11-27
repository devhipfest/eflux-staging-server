const mongoose = require('mongoose')

const chargingSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingMachine', required: true },
    port: { type: Number, required: true },

    duration: { type: Number, required: true }, // phút
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    actualEndTime: { type: Date },

    status: {
      type: String,
      enum: ['pending', 'paid', 'active', 'expired', 'cancelled', 'error', 'stopped'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ChargingSession', chargingSessionSchema)
