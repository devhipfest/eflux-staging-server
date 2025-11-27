const express = require('express')
const router = express.Router()
const mqttClient = require('../config/mqtt')

router.get('/', async (req, res) => {
  try {
    await mqttClient.publish('APP/123456789', JSON.stringify({ action: 'start nhé!' }))

    // Wait for response on 'charging/result'
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timeout waiting for MQTT response')),
        10000,
      )

      const messageHandler = (topic, message) => {
        if (topic === 'charging/result') {
          clearTimeout(timeout)
          mqttClient.removeListener('message', messageHandler)
          resolve(JSON.parse(message.toString()))
        }
      }

      mqttClient.on('message', messageHandler)
    })

    const result = await responsePromise
    res.json({ message: 'MQTT sent', result })
  } catch (error) {
    res.json({ message: 'MQTT sent, but no result received', error: error.message })
  }
})

module.exports = router
