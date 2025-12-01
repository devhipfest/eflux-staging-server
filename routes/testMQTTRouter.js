const express = require('express')
const router = express.Router()
const {
  publish,
  subscribe,
  requestResponse,
  startCharging,
  stopCharging,
  getStationStatus,
  sendHeartbeat,
  setChargingPower,
  subscribeToStationStatus,
  unsubscribeFromStationStatus,
  emergencyStop,
} = require('../services/mqttService')

router.get('/', async (req, res) => {
  try {
    const stationId = req.query.stationId || '123456789'
    const appTopic = `APP/${stationId}`
    const mcuTopic = `MCU/${stationId}`

    // Send request and wait for response
    const response = await requestResponse(
      appTopic,
      mcuTopic,
      { action: 'start', message: 'Test MQTT communication' },
      10000, // 10 second timeout
    )

    res.status(200).json({
      success: true,
      requestTopic: appTopic,
      responseTopic: mcuTopic,
      response: response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MQTT request failed',
      error: error.message,
    })
  }
})

// Additional route for publishing without waiting for response
router.post('/publish', async (req, res) => {
  try {
    const { topic, message } = req.body
    if (!topic || !message) {
      return res.status(400).json({ error: 'Topic and message are required' })
    }

    await publish(topic, message)

    res.status(200).json({
      success: true,
      message: 'Published successfully',
      topic,
      payload: message,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Route for subscribing to a topic
router.post('/subscribe', (req, res) => {
  try {
    const { topic } = req.body
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' })
    }

    subscribe(topic, (receivedTopic, message) => {
      console.log('Received message on subscribed topic:', receivedTopic, message.toString())
      // In a real app, you might want to emit this via WebSocket or store it
    })

    res.status(200).json({
      success: true,
      message: `Subscribed to ${topic}`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// ===== CHARGING STATION ROUTES =====

// Start charging session
router.post('/charging/start/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params
    const sessionData = req.body

    const response = await startCharging(stationId, sessionData)

    res.status(200).json({
      success: true,
      stationId,
      response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Stop charging session
router.post('/charging/stop/:stationId/:sessionId', async (req, res) => {
  try {
    const { stationId, sessionId } = req.params

    const response = await stopCharging(stationId, sessionId)

    res.status(200).json({
      success: true,
      stationId,
      sessionId,
      response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Get station status
router.get('/charging/status/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params

    const response = await getStationStatus(stationId)

    res.status(200).json({
      success: true,
      stationId,
      status: response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Set charging power
router.post('/charging/power/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params
    const { power } = req.body

    if (!power || typeof power !== 'number') {
      return res.status(400).json({ error: 'Power (number) is required' })
    }

    const response = await setChargingPower(stationId, power)

    res.status(200).json({
      success: true,
      stationId,
      power,
      response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Send heartbeat
router.post('/charging/heartbeat/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params

    const response = await sendHeartbeat(stationId)

    res.status(200).json({
      success: true,
      stationId,
      response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Emergency stop
router.post('/charging/emergency/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params

    const response = await emergencyStop(stationId)

    res.status(200).json({
      success: true,
      stationId,
      message: 'Emergency stop initiated',
      response,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Subscribe to station status updates
router.post('/charging/subscribe/:stationId', (req, res) => {
  try {
    const { stationId } = req.params

    subscribeToStationStatus(stationId, (topic, message) => {
      console.log(`Station ${stationId} status update:`, topic, message.toString())
      // In production, emit via WebSocket or save to database
    })

    res.status(200).json({
      success: true,
      message: `Subscribed to status updates for station ${stationId}`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// Unsubscribe from station status updates
router.delete('/charging/subscribe/:stationId', (req, res) => {
  try {
    const { stationId } = req.params

    unsubscribeFromStationStatus(stationId)

    res.status(200).json({
      success: true,
      message: `Unsubscribed from status updates for station ${stationId}`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

module.exports = router
