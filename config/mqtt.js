const mqtt = require('mqtt')

const client = mqtt.connect({
  host: 'possum.lmq.cloudamqp.com',
  port: 1883,
  username: 'zzhxledv:zzhxledv',
  password: 'XHkKAHE03dOa0d4iBbpoPcaPWyl6l-c5',
  protocol: 'mqtt',
})

client.on('connect', () => {
  console.log('Connected to CloudAMQP MQTT!')
})

client.on('error', (err) => {
  console.error('MQTT Error:', err)
})

module.exports = client
