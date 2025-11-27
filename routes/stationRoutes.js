const express = require('express')
const { authenticate, requireAdmin } = require('../middleware/auth')
const {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
  getStationCoordinates,
} = require('../controllers/stationController')

const router = express.Router()

// Get all stations (authenticated users)
router.get('/', getStations)

// Get station coordinates (authenticated users)
router.get('/coordinates', getStationCoordinates)

// Get station by ID
router.get('/:id', getStationById)

// Create new station (admin only)
router.post('/', authenticate, requireAdmin, createStation)

// Update station (admin only)
router.put('/:id', authenticate, requireAdmin, updateStation)

// Delete station (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteStation)

module.exports = router
