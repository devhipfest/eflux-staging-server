const mongoose = require('mongoose')

const portSchema = new mongoose.Schema(
  {
    port: { type: Number, required: true },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
    },
  },
  { _id: false },
)

const chargingMachineSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },

    vehicleType: {
      type: String,
      enum: ['motorbike', 'car'],
      default: 'motorbike',
    },

    power: { type: Number, required: true },

    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'faulty'],
      default: 'available',
    },

    lastMaintenance: { type: Date },

    ports: {
      type: [portSchema],
      default: () =>
        Array.from({ length: 10 }, (_, i) => ({
          port: i + 1,
          session: null,
        })),
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ChargingMachine', chargingMachineSchema)
