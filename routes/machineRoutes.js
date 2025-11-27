const express = require('express')
const { authenticate, requireAdmin } = require('../middleware/auth')
const {
  getMachines,
  getMachinesByStation,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} = require('../controllers/machineController')

const router = express.Router()

// Get all machines (admin only)
router.get('/',  getMachines)

// Get machines by station
router.get('/station/:stationId', getMachinesByStation)

// Get machine by ID
router.get('/:id', getMachineById)

// Create new machine (admin only)
router.post('/', authenticate, requireAdmin, createMachine)

// Update machine (admin only)
router.put('/:id', authenticate, requireAdmin, updateMachine)

// Delete machine (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteMachine)

module.exports = router
