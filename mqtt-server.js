require('dotenv').config()
const mosca = require('mosca')
const mqtt = require('mqtt')

const server = new mosca.Server({
  http: {
    port: 3001,
    bundle: true,
    static: __dirname
  },
  persistence: {
    factory: mosca.persistence.Memory
  }
})

server.on('ready', () => {
  server.authenticate = (client, username, password, callback) => {
    let authorized = (username === process.env.MQTT_USERNAME && String(password) === process.env.MQTT_PASSWORD)
    if (authorized) {
      client.user = username
      callback(null, authorized)
    } else {
      console.log(`not authorized username ${ username } tried to connect`)
    }
  }
  console.log('mqtt-server is running on port', 3001)
})

server.on('clientConnected', (client) => {
  console.log(`${ Date.now() } client connected ${ client.id }`)
})

server.on('clientDisconnected', (client) => {
  console.log(`${ Date.now() } client disconnected ${ client.id }`)
})

/* MQTT client setup */
const client = mqtt.connect('mqtt://127.0.0.1', {
  clientId: 'broker-client-' + Math.random().toString(16).substr(2, 8),
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
})

client.on('connect', () => {
  client.subscribe('actor/#')
})

module.exports = {
  server,
  client
}
