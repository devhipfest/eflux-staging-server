const Station = require('../models/Station')

// Get all stations (filtered by user role) with pagination
const getStations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let query = {}

    // Add search functionality
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' }
      query.$or = [{ name: searchRegex }, { address: searchRegex }, { description: searchRegex }]
    }

    const total = await Station.countDocuments(query)
    const stations = await Station.find(query)
      .populate('owner', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(total / limit)

    res.json({
      data: {
        data: stations,
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

// Get station by ID (with permission check)
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id).populate('owner', 'name email phone')
    if (!station) {
      return res.status(404).json({ message: 'Station not found' })
    }

    res.json({ data: station })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create new station (admin only)
const createStation = async (req, res) => {
  try {
    const {
      name,
      address,
      longitude,
      latitude,
      owner,
      description,
      openTime,
      closeTime,
      amenities,
      pricePerKWh,
      pricePerMinute,
    } = req.body

    if (!name || !address || longitude === undefined || latitude === undefined || !owner) {
      return res.status(400).json({
        message: 'Name, address, longitude, latitude and owner are required',
      })
    }

    // Validate longitude and latitude
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Longitude must be between -180 and 180' })
    }
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90' })
    }

    // Verify owner exists and is a station_owner
    const User = require('../models/User')
    const ownerUser = await User.findById(owner)
    if (!ownerUser || ownerUser.role !== 'station_owner') {
      return res.status(400).json({ message: 'Invalid owner - must be a station owner' })
    }

    const station = new Station({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      owner,
      description,
      openTime,
      closeTime,
      amenities,
      pricePerKWh,
      pricePerMinute,
    })

    await station.save()
    await station.populate('owner', 'name email')

    res.status(201).json({ data: station })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update station (admin only)
const updateStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id)
    if (!station) {
      return res.status(404).json({ message: 'Station not found' })
    }

    const {
      name,
      address,
      longitude,
      latitude,
      description,
      openTime,
      closeTime,
      amenities,
      status,
      pricePerKWh,
      pricePerMinute,
    } = req.body

    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' })
    }

    // Validate longitude and latitude if provided
    let locationUpdate = {}
    if (longitude !== undefined && latitude !== undefined) {
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'Longitude must be between -180 and 180' })
      }
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ message: 'Latitude must be between -90 and 90' })
      }
      locationUpdate = {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      }
    }

    const updateData = {
      name,
      address,
      description,
      openTime,
      closeTime,
      amenities,
      status,
      ...locationUpdate,
    }

    if (pricePerKWh !== undefined) {
      updateData.pricePerKWh = pricePerKWh
    }
    if (pricePerMinute !== undefined) {
      updateData.pricePerMinute = pricePerMinute
    }

    const updatedStation = await Station.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email')

    res.json({ data: updatedStation })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete station (admin only)
const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id)
    if (!station) {
      return res.status(404).json({ message: 'Station not found' })
    }

    await Station.findByIdAndDelete(req.params.id)
    res.json({ message: 'Station deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get station coordinates (for customers - active stations only)
const getStationCoordinates = async (req, res) => {
  try {
    const stations = await Station.find({ status: 'active' })
      .select('_id name location.coordinates')
      .sort({ createdAt: -1 })

    const coordinates = stations.map((station) => ({
      _id: station._id,
      name: station.name,
      lng: station.location.coordinates[0], // kinh độ
      lat: station.location.coordinates[1], // vĩ độ
      status: 'active',
    }))

    res.json({ data: coordinates })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
  getStationCoordinates,
}
