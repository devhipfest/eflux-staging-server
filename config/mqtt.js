const mqtt = require('mqtt')

// const client = mqtt.connect({
//   host: 'possum.lmq.cloudamqp.com',
//   port: 1883,
//   username: 'zzhxledv:zzhxledv',
//   password: 'XHkKAHE03dOa0d4iBbpoPcaPWyl6l-c5',
//   protocol: 'mqtt',
// })

const client = mqtt.connect('mqtt://14.225.212.157', {
  port: 1883,
  username: 'mqttuser',
  password: 'testmqtt01',
  protocol: 'mqtt',
})

client.on('connect', () => {
  console.log('Connected to CloudAMQP MQTT!')

  client.subscribe('MCU/123456789', (err) => {
    if (err) console.log('SUBSCRIBE ERROR:', err)
    else console.log('Subscribed to charging/#')
  })
})

client.on('error', (err) => {
  console.error('MQTT Error:', err)
})

client.on('message', (topic, message) => {
  console.log('MQTT RECEIVED:', topic, message.toString())

  // Fake response for testing
  if (topic === 'charging/test') {
    client.publish(
      'charging/result',
      JSON.stringify({
        pw: '22kw',
        charger: 'AH-01',
        startedAt: new Date().getTime(),
        endAt: new Date().getTime() + 10000,
        status: 'active',
      }),
    )
  }
})

module.exports = client
