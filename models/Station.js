const mongoose = require('mongoose')

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    openTime: { type: String, default: '06:00' }, // e.g., "06:00"
    closeTime: { type: String, default: '22:00' }, // e.g., "22:00"
    amenities: {
      type: [String],
      enum: ['wifi', 'cafe', 'restroom', 'waiting_room', 'air_conditioned', 'hammock', 'parking'],
      default: [],
    }, // e.g., ['wifi', 'parking', 'cafe']
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
    totalMachines: {
      type: Number,
      default: 0,
    },
    pricePerKWh: {
      type: Number,
      min: 0,
    },
    pricePerMinute: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for geospatial queries
stationSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Station', stationSchema)
