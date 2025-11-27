require('dotenv').config()
require('./config/mqtt')
const mongoose = require('mongoose')
const app = require('./app')

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/charging_platform')
  .then(() => {
    console.log('🍃 MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })
