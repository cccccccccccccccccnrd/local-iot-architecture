require('dotenv').config()
const mosca = require('mosca')
const mqtt = require('mqtt')

function serve (port) {
  const settings = {
    http: {
      port,
      bundle: true,
      static: __dirname
    }
  }
  const server = new mosca.Server(settings)

  let authenticate = function (client, username, password, callback) {
    let authorized = (username === process.env.MQTT_USERNAME && String(password) === process.env.MQTT_PASSWORD)
    if (authorized) {
      client.user = username
      callback(null, authorized)
    } else {
      console.log('not authorized username ' + username + ' tried to connect')
    }
  }
  
  server.on('ready', function () {
    server.authenticate = authenticate
    console.log('mqtt-server is running on port', settings.http.port)
  })
  
  server.on('clientConnected', function (client) {
    console.log('client connected', client.id)
  })
  
  /* MQTT client setup */
  const clientSettings = {
    clientId: 'broker-client-' + Math.random().toString(16).substr(2, 8),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  }
  const client = mqtt.connect('mqtt://127.0.0.1', clientSettings)
  
  client.on('connect', function () {
    client.subscribe('actor/#')
  })

  module.exports = {
    server,
    client
  }
}

module.exports = {
  serve
}