require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:3000', // React dev server
      'http://localhost:3001', // Another common dev port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://localhost:5173',
      'https://charger-user.vercel.app',
      process.env.FRONTEND_URL, // From environment variable
      process.env.MOBILE_APP_URL, // For mobile app
    ].filter(Boolean) // Remove undefined values

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
}

// Middleware
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/stations', require('./routes/stationRoutes'))
app.use('/api/machines', require('./routes/machineRoutes'))
app.use('/api/payments', require('./routes/paymentRoutes'))
app.use('/api/transactions', require('./routes/transactionRoutes'))

app.use('/test-mqtt', require('./routes/testMQTTRouter'))
app.use('/sepay', require('./routes/sepayRouter'))
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

module.exports = app
