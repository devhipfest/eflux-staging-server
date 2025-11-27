const ChargingMachine = require('../models/ChargingMachine')
const Station = require('../models/Station')

// Get all machines (admin only) with pagination
const getMachines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let query = {}

    // Build filter query
    if (req.query.station) {
      query.station = req.query.station
    }
    if (req.query.vehicleType) {
      query.vehicleType = req.query.vehicleType
    }
    if (req.query.status) {
      query.status = req.query.status
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    const total = await ChargingMachine.countDocuments(query)
    const machines = await ChargingMachine.find(query)
      .populate('station', 'name address')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(total / limit)

    res.json({
      data: {
        data: machines,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get machines by station (with permission check) with pagination
const getMachinesByStation = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if user can access this station
    const station = await Station.findById(req.params.stationId)
    if (!station) {
      return res.status(404).json({ message: 'Station not found' })
    }

    if (req.user.role === 'station_owner' && station.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const total = await ChargingMachine.countDocuments({
      station: req.params.stationId,
    })
    const machines = await ChargingMachine.find({
      station: req.params.stationId,
    })
      .populate('station', 'name address')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(total / limit)

    res.json({
      data: {
        data: machines,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get machine by ID
const getMachineById = async (req, res) => {
  try {
    const machine = await ChargingMachine.findById(req.params.id).populate(
      'station',
      'name address',
    )
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' })
    }
    res.json({ data: machine })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create new machine (admin only)
const createMachine = async (req, res) => {
  try {
    const { station, name, code, vehicleType, power } = req.body

    if (!station || !name || !code || !vehicleType || !power) {
      return res.status(400).json({
        message: 'Station, name, code, vehicleType and power are required',
      })
    }

    // Check if station exists
    const stationDoc = await Station.findById(station)
    if (!stationDoc) {
      return res.status(404).json({ message: 'Station not found' })
    }

    const machine = new ChargingMachine({
      station,
      name,
      code,
      vehicleType,
      power,
    })

    await machine.save()
    await machine.populate('station', 'name address')

    // Update station's total machines count
    await Station.findByIdAndUpdate(station, { $inc: { totalMachines: 1 } })

    res.status(201).json({ data: machine })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update machine (admin only)
const updateMachine = async (req, res) => {
  try {
    const machine = await ChargingMachine.findById(req.params.id)
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' })
    }

    const { name, code, vehicleType, power, status, lastMaintenance } = req.body

    if (!name || !code || !vehicleType || !power) {
      return res.status(400).json({
        message: 'Name, code, vehicleType and power are required',
      })
    }

    const updatedMachine = await ChargingMachine.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        vehicleType,
        power,
        status,
        lastMaintenance,
      },
      { new: true, runValidators: true },
    ).populate('station', 'name address')

    res.json({ data: updatedMachine })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete machine (admin only)
const deleteMachine = async (req, res) => {
  try {
    const machine = await ChargingMachine.findById(req.params.id).populate('station')
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' })
    }

    await ChargingMachine.findByIdAndDelete(req.params.id)

    // Update station's total machines count
    await Station.findByIdAndUpdate(machine.station._id, {
      $inc: { totalMachines: -1 },
    })

    res.json({ message: 'Machine deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getMachines,
  getMachinesByStation,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
}
