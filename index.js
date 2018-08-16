require('dotenv').config()
const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const express = require('express')
const MAM = require('./includes/mam.client.js')
const IOTA = require('iota.lib.js')

/* HTTP server setup */
const httpServerSettings = {
  port: 3000,
  staticPath: __dirname + '/public'
}
const httpServer = express()

httpServer.use(express.static(httpServerSettings.staticPath))
httpServer.listen(httpServerSettings.port)
console.log('http server is running on http://localhost:' + httpServerSettings.port)

/* Microcontroller and sensor setup */
const board = new five.Board({
  port: '/dev/ttyACM1'
})

board.on('ready', function () {

  dht11 = new five.Multi({
    controller: 'DHT11_I2C_NANO_BACKPACK'
  })

  photocell = new five.Light({
    pin: 'A3',
    freq: 2000
  })

  relayLight = new five.Relay({
    pin: 7,
    type: 'NC'
  })

  relayWaterpump = new five.Relay({
    pin: 6,
    type: 'NC'
  })

  const additionalArduinoPort = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200
  })
  const additionalArduino = additionalArduinoPort.pipe(new Readline())

  /* States and MQTT topics setup */
  const lightTopic = 'actor/light'
  let lightState = true

  const waterpumpTopic = 'actor/waterpump'
  let waterpumpState = false

  const temperatureTopic = 'sensor/temperature'
  let temperatureState

  const humidityTopic = 'sensor/humidity'
  let humidityState

  const lightIntensityTopic = 'sensor/light-intensity'
  let lightIntensityState

  const waterTemperatureTopic = 'sensor/water-temperature'
  let waterTemperatureState

  const waterElectricalConductivityTopic = 'sensor/water-electrical-conductivity'
  let waterElectricalConductivityState

  /* Mosca websocket server setup */
  const moscaServerSettings = {
    http: {
      port: 3001,
      bundle: true,
      static: './'
    }
  }
  const moscaServer = new mosca.Server(moscaServerSettings)

  let authenticate = function (client, username, password, callback) {
    let authorized = (username === process.env.MQTT_USERNAME && String(password) === process.env.MQTT_PASSWORD)
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
  })

  /* MQTT client setup */
  const options = {
    clientId: 'broker-client-' + Math.random().toString(16).substr(2, 8),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  }
  const client = mqtt.connect('mqtt://127.0.0.1', options)

  client.on('connect', function () {
    client.subscribe('actor/#')
  })

  /* MQTT publish handeling */
  dht11.on('change', function () {
    temperatureState = {
      'type': 'temperature',
      'value': this.thermometer.celsius,
      'timestamp': Date.now()
    }
    client.publish(temperatureTopic, JSON.stringify(temperatureState))
    if (!bundledStates.temperature) bundledStates.temperature = temperatureState
    console.log(JSON.stringify(temperatureState))

    humidityState = {
      'type': 'humidity',
      'value': this.hygrometer.relativeHumidity,
      'timestamp': Date.now()
    }
    client.publish(humidityTopic, JSON.stringify(humidityState))
    if (!bundledStates.humidity) bundledStates.humidity = humidityState
    console.log(JSON.stringify(humidityState))
  })

  photocell.on('data', function () {
    lightIntensityState = {
      'type': 'light-intensity',
      'value': Math.floor(100 - this.level * 100),
      'timestamp': Date.now()
    }
    client.publish(lightIntensityTopic, JSON.stringify(lightIntensityState))
    if (!bundledStates.lightIntensity) bundledStates.lightIntensity = lightIntensityState
    console.log(JSON.stringify(lightIntensityState))
  })

  additionalArduino.on('data', function (data) {
    if (!data.startsWith('{')) return

    waterTemperatureState = {
      'type': 'water-temperature',
      'value': Math.floor(JSON.parse(data.toString()).temperature),
      'timestamp': Date.now()
    }
    client.publish(waterTemperatureTopic, JSON.stringify(waterTemperatureState))
    if (!bundledStates.waterTemperature) bundledStates.waterTemperature = waterTemperatureState
    console.log(JSON.stringify(waterTemperatureState))

    waterElectricalConductivityState = {
      'type': 'electrical-conductivity',
      'value': Math.floor(JSON.parse(data.toString()).ec),
      'timestamp': Date.now()
    }
    client.publish(waterElectricalConductivityTopic, JSON.stringify(waterElectricalConductivityState))
    if (!bundledStates.waterElectricalConductivity) bundledStates.waterElectricalConductivity = waterElectricalConductivityState
    console.log(JSON.stringify(waterElectricalConductivityState))
  })

  /* Timed MQTT publish handeling */
  setInterval(() => {
    const now = new Date()

    if (now.getHours() === 8 && now.getMinutes() === 0) {
      // cool
    }
  }, 60000)

  /* MQTT subscribe handeling */
  client.on('message', function (topic, message) {
    if (topic === lightTopic) {
      if (message == 'toggle') {
        lightState = !lightState
        if (lightState) {
          relayLight.close()
        } else {
          relayLight.open()
        }
        console.log('light-relay:', lightState)
      }
    } else if (topic === waterpumpTopic) {
      if (message == 'toggle') {
        waterpumpState = !waterpumpState
        if (waterpumpState) {
          relayWaterpump.open()
          console.log('waterpump:', waterpumpState)
        } else {
          relayWaterpump.close()
          console.log('waterpump:', waterpumpState)
        }
      } else if (message == 'half') {
        waterpumpState = !waterpumpState
        if (waterpumpState) {
          relayWaterpump.open()
          console.log('waterpump:', waterpumpState)
          setTimeout(() => {
            waterpumpState = !waterpumpState
            relayWaterpump.close()
            console.log('waterpump:', waterpumpState)
          }, 30000)
        }
      } else if (Number.isInteger(Number(message))) {
        waterpumpState = !waterpumpState
        if (waterpumpState) {
          relayWaterpump.open()
          console.log(`waterpump: ${waterpumpState} open for ${Number(message)}`)
          setTimeout(() => {
            waterpumpState = !waterpumpState
            relayWaterpump.close()
            console.log(`waterpump: ${waterpumpState}`)
          }, String(message))
        }
      }
    } else {
      console.log('invalid topic')
    }
  })

  let bundledStates = {
    timestamp: new Date.now()
  }

  setInterval((bundledStates) => {
    publishToTangle(JSON.stringify(bundledStates))
  }, 5000)

  const iotaProvider = new IOTA({ provider: 'https://wallet2.iota.town:443' })
  const iotaSeed = process.env.IOTA_SEED

  let mamState = MAM.init(iotaProvider, iotaSeed)

  async function publishToTangle (data) {
    const message = MAM.create(mamState, data)

    mamState = message.state

    console.log('Root: ', message.root)
    console.log('Address: ', message.address)
    await MAM.attach(message.payload, message.address)

    const resp = await MAM.fetch(message.root, 'public', null, console.log)
    console.log(resp)
  }
})
