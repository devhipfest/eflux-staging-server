const client = require('../config/mqtt')

// State management using closures
let subscriptions = new Map() // topic -> callback
let pendingRequests = new Map() // requestId -> { resolve, reject, timeout }

// Initialize message handler
client.on('message', (topic, message) => {
  handleMessage(topic, message)
})

/**
 * Publish a message to a topic
 * @param {string} topic - MQTT topic
 * @param {string|object} message - Message to publish
 * @param {object} options - Publish options
 * @returns {Promise} - Resolves when published
 */
const publish = (topic, message, options = {}) => {
  return new Promise((resolve, reject) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)

    client.publish(topic, payload, options, (err) => {
      if (err) {
        console.error('MQTT Publish Error:', err)
        reject(err)
      } else {
        console.log('MQTT Published:', topic, payload)
        resolve()
      }
    })
  })
}

/**
 * Subscribe to a topic
 * @param {string} topic - MQTT topic
 * @param {function} callback - Callback function(topic, message)
 */
const subscribe = (topic, callback) => {
  if (!subscriptions.has(topic)) {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error('MQTT Subscribe Error:', err)
      } else {
        console.log('MQTT Subscribed to:', topic)
        subscriptions.set(topic, callback)
      }
    })
  } else {
    subscriptions.set(topic, callback)
  }
}

/**
 * Unsubscribe from a topic
 * @param {string} topic - MQTT topic
 */
const unsubscribe = (topic) => {
  client.unsubscribe(topic, (err) => {
    if (err) {
      console.error('MQTT Unsubscribe Error:', err)
    } else {
      console.log('MQTT Unsubscribed from:', topic)
      subscriptions.delete(topic)
    }
  })
}

/**
 * Send a request and wait for response
 * @param {string} requestTopic - Topic to publish request
 * @param {string} responseTopic - Topic to listen for response
 * @param {string|object} message - Request message
 * @param {number} timeout - Timeout in ms (default 5000)
 * @returns {Promise} - Resolves with response message
 */
const requestResponse = (requestTopic, responseTopic, message, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString()

    // Subscribe to response topic temporarily
    subscribe(responseTopic, (topic, msg) => {
      try {
        const response = JSON.parse(msg.toString())
        if (response.requestId === requestId) {
          unsubscribe(responseTopic)
          clearTimeout(pendingRequests.get(requestId).timeout)
          pendingRequests.delete(requestId)
          resolve(response)
        }
      } catch (err) {
        console.error('Error parsing MQTT response:', err)
      }
    })

    // Set timeout
    const timeoutId = setTimeout(() => {
      unsubscribe(responseTopic)
      pendingRequests.delete(requestId)
      reject(new Error('MQTT request timeout'))
    }, timeout)

    pendingRequests.set(requestId, { resolve, reject, timeout: timeoutId })

    // Publish request with ID
    const requestMessage =
      typeof message === 'string' ? { message, requestId } : { ...message, requestId }
    publish(requestTopic, requestMessage)
  })
}

/**
 * Handle incoming messages
 * @param {string} topic - MQTT topic
 * @param {Buffer} message - Message buffer
 */
const handleMessage = (topic, message) => {
  console.log('MQTT Received:', topic, message.toString())

  const callback = subscriptions.get(topic)
  if (callback) {
    callback(topic, message)
  }
}

/**
 * Get client connection status
 * @returns {boolean} - True if connected
 */
const isConnected = () => {
  return client.connected
}

// ===== CHARGING STATION SPECIFIC FUNCTIONS =====

/**
 * Start charging session
 * @param {string} stationId - Station ID
 * @param {object} sessionData - Session parameters
 * @returns {Promise} - Response from MCU
 */
const startCharging = (stationId, sessionData = {}) => {
  const appTopic = `APP/${stationId}`
  const mcuTopic = `MCU/${stationId}`

  const message = {
    action: 'start_charging',
    sessionId: sessionData.sessionId || `session_${Date.now()}`,
    userId: sessionData.userId,
    power: sessionData.power || 22, // kW
    charger: sessionData.charger || 'AH-01',
    ...sessionData,
  }

  return requestResponse(appTopic, mcuTopic, message, 10000)
}

/**
 * Stop charging session
 * @param {string} stationId - Station ID
 * @param {string} sessionId - Session ID to stop
 * @returns {Promise} - Response from MCU
 */
const stopCharging = (stationId, sessionId) => {
  const appTopic = `APP/${stationId}`
  const mcuTopic = `MCU/${stationId}`

  const message = {
    action: 'stop_charging',
    sessionId: sessionId,
  }

  return requestResponse(appTopic, mcuTopic, message, 10000)
}

/**
 * Get charging station status
 * @param {string} stationId - Station ID
 * @returns {Promise} - Status response from MCU
 */
const getStationStatus = (stationId) => {
  const appTopic = `APP/${stationId}`
  const mcuTopic = `MCU/${stationId}`

  const message = {
    action: 'get_status',
  }

  return requestResponse(appTopic, mcuTopic, message, 5000)
}

/**
 * Send heartbeat to station
 * @param {string} stationId - Station ID
 * @returns {Promise} - Heartbeat response
 */
const sendHeartbeat = (stationId) => {
  const appTopic = `APP/${stationId}`
  const mcuTopic = `MCU/${stationId}`

  const message = {
    action: 'heartbeat',
    timestamp: Date.now(),
  }

  return requestResponse(appTopic, mcuTopic, message, 3000)
}

/**
 * Set charging power
 * @param {string} stationId - Station ID
 * @param {number} power - Power in kW
 * @returns {Promise} - Response from MCU
 */
const setChargingPower = (stationId, power) => {
  const appTopic = `APP/${stationId}`
  const mcuTopic = `MCU/${stationId}`

  const message = {
    action: 'set_power',
    power: power,
  }

  return requestResponse(appTopic, mcuTopic, message, 5000)
}

/**
 * Subscribe to station status updates
 * @param {string} stationId - Station ID
 * @param {function} callback - Callback function(topic, message)
 */
const subscribeToStationStatus = (stationId, callback) => {
  const statusTopic = `MCU/${stationId}/status`
  subscribe(statusTopic, callback)
}

/**
 * Unsubscribe from station status updates
 * @param {string} stationId - Station ID
 */
const unsubscribeFromStationStatus = (stationId) => {
  const statusTopic = `MCU/${stationId}/status`
  unsubscribe(statusTopic)
}

/**
 * Publish station command (fire and forget)
 * @param {string} stationId - Station ID
 * @param {string} command - Command type
 * @param {object} data - Command data
 * @returns {Promise} - Publish result
 */
const publishStationCommand = (stationId, command, data = {}) => {
  const topic = `APP/${stationId}`
  const message = {
    action: command,
    ...data,
    timestamp: Date.now(),
  }

  return publish(topic, message)
}

/**
 * Emergency stop all charging
 * @param {string} stationId - Station ID
 * @returns {Promise} - Response from MCU
 */
const emergencyStop = (stationId) => {
  const appTopic = `APP/${stationId}`
  const mcuTopic = `MCU/${stationId}`

  const message = {
    action: 'emergency_stop',
    reason: 'manual_emergency',
  }

  return requestResponse(appTopic, mcuTopic, message, 2000)
}

module.exports = {
  publish,
  subscribe,
  unsubscribe,
  requestResponse,
  isConnected,
  startCharging,
  stopCharging,
  getStationStatus,
  sendHeartbeat,
  setChargingPower,
  subscribeToStationStatus,
  unsubscribeFromStationStatus,
  publishStationCommand,
  emergencyStop,
}
