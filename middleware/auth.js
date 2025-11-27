require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' })
  }
}

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' })
  }
  next()
}

// Middleware to check if user is station owner or admin
const requireStationOwner = (req, res, next) => {
  if (req.user.role !== 'station_owner' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Station owner role required.' })
  }
  next()
}

module.exports = {
  authenticate,
  requireAdmin,
  requireStationOwner,
}
