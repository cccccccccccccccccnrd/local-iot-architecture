const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')
const Oled = require('oled-js')
const font = require('oled-font-5x7')
const express = require('express')

/* http-server setup */
const httpServerSettings = {
  port: 3000,
  staticPath: 'public'
}
const httpServer = express()

httpServer.use(express.static(httpServerSettings.staticPath))
httpServer.listen(httpServerSettings.port)
console.log('http server is running on port', httpServerSettings.port)

/* Arduino setup */
const board = new five.Board()

board.on('ready', function () {
  
  oled = new Oled(board, five, {
    width: 128,
    height: 64,
    address: 0x3C
  })
  oled.clearDisplay()
  oled.update()

  dht11 = new five.Multi({
    controller: 'DHT11_I2C_NANO_BACKPACK'
  })

  light = new five.Light({
    pin: 'A0',
    freq: 1000
  })

  /* States and MQTT topics setup */
  const waterpumpTopic = 'actor/waterpump'
  let waterpumpState = false

  const lifecycleTopic = 'actor/lifecycle'
  let lifecycleState = 'cool'

  const temperatureTopic = 'sensor/temperature'
  let temperatureState

  const humidityTopic = 'sensor/humidity'
  let humidityState

  const lightIntensityTopic = 'sensor/light-intensity'
  let lightIntensityState

  /* Mosca websocket server setup */
  const moscaServerSettings = {
    http: {
      port: 3001,
      bundle: true,
      static: './'
    }
  }
  const moscaServer = new mosca.Server(moscaServerSettings)

  let authenticate = function(client, username, password, callback) {
    let authorized = (username === 'c' && String(password) === 'ccc')
    if (authorized) {
      client.user = username
      callback(null, authorized)
    } else {
      console.log('not authorized username ' + username + ' tried to connect')
    }
  }

  moscaServer.on('ready', function () {
    moscaServer.authenticate = authenticate
    console.log('mqtt server is running on port', moscaServerSettings.http.port)
  })

  moscaServer.on('clientConnected', function (client) {
    console.log('client connected', client.id);
  });

  /* MQTT client setup */
  const options = {
    clientId: 'broker-client-' + Math.random().toString(16).substr(2, 8),
    username: 'c',
    password: 'ccc'
  }
  const client = mqtt.connect('mqtt://127.0.0.1', options)

  client.on('connect', function () {
    client.subscribe('actor/#')
  })

  /* MQTT publish handeling */
  dht11.on('change', function () {
    temperatureState = {
      'type': 'temperature',
      'value': String(this.thermometer.celsius),
      'timestamp': Date.now()
    }
    oled.setCursor(0, 0)
    oled.writeString(font, 1, 'temperature: ' + temperatureState.value + ' C', 1, true, 2)
    client.publish(temperatureTopic, JSON.stringify(temperatureState))
    console.log('temperature state:', JSON.stringify(temperatureState))

    humidityState = {
      'type': 'humidity',
      'value': String(this.hygrometer.relativeHumidity),
      'timestamp': Date.now()
    }
    oled.setCursor(0, 12)
    oled.writeString(font, 1, 'humidity: ' + humidityState.value + ' %', 1, true, 2)
    client.publish(humidityTopic, JSON.stringify(humidityState))
    console.log('humidity state:', JSON.stringify(humidityState))
  })

  light.on('data', function() {
    lightIntensitiyState = {
      'type': 'light-intensity',
      'value': String(this.level),
      'timestamp': Date.now()
    }
    oled.setCursor(0, 30)
    oled.writeString(font, 1, 'light: ' + lightIntensitiyState.value + ' %', 1, true, 2)
    client.publish(lightIntensityTopic, JSON.stringify(lightIntensitiyState))
    console.log('light-intensitiy state:', JSON.stringify(lightIntensitiyState))
  })

  /* MQTT subscribe handeling */
  client.on('message', function (topic, message) {
    if (topic == waterpumpTopic) {
      if (message == 'toggle') {
        waterpumpState = !waterpumpState
        if (waterpumpState) {
        } else {
        }
        console.log('waterpump state:', waterpumpState)
      } else {
        console.log('invalid message')
      }
    } else if (topic == lifecycleTopic) {
      lifecycleState = message
      console.log('lifecycle state:', String.fromCharCode.apply(null, lifecycleState))
    } else {
      console.log('invalid topic')
    }
  })
})