const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
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

const board = new five.Board({
  port: '/dev/ttyACM1'
})

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

  photocell = new five.Light({
    pin: 'A3',
    freq: 2000
  })

  relayLight = new five.Relay({
    pin: 7,
    type: 'NC'
  })
  
  const additionalArduinoPort = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200
  })
  const additionalArduino = additionalArduinoPort.pipe(new Readline())

  /* States and MQTT topics setup */

  const lightTopic = 'actor/light'
  let lightState = true

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
      'value': this.thermometer.celsius,
      'timestamp': Date.now()
    }
    oled.setCursor(0, 0)
    oled.writeString(font, 1, 'temperature: ' + temperatureState.value + ' C', 1, true, 2)
    client.publish(temperatureTopic, JSON.stringify(temperatureState))
    console.log(JSON.stringify(temperatureState))

    humidityState = {
      'type': 'humidity',
      'value': this.hygrometer.relativeHumidity,
      'timestamp': Date.now()
    }
    oled.setCursor(0, 12)
    oled.writeString(font, 1, 'humidity: ' + humidityState.value + ' %', 1, true, 2)
    client.publish(humidityTopic, JSON.stringify(humidityState))
    console.log(JSON.stringify(humidityState))
  })

  photocell.on('data', function() {
    lightIntensityState = {
      'type': 'light-intensity',
      'value': (100 - this.level * 100),
      'timestamp': Date.now()
    }
    oled.setCursor(0, 24)
    oled.writeString(font, 1, 'light: ' + lightIntensityState.value + ' %', 1, true, 2)
    client.publish(lightIntensityTopic, JSON.stringify(lightIntensityState))
    console.log(JSON.stringify(lightIntensityState))
  })
  
  additionalArduino.on('data', function (data) {

    console.log(data)
/*      waterTemperatureState = {
      'type': 'water-temperature',
      'value': JSON.parse(data.toString()).temperature,
      'timestamp': Date.now()
    }
    client.publish(waterTemperatureTopic, JSON.stringify(waterTemperatureState))
    console.log(JSON.stringify(waterTemperatureState))

    waterElectricalConductivityState = {
      'type': 'electrical-conductivity',
      'value': JSON.parse(data.toString()).ec,
      'timestamp': Date.now()
    }
    client.publish(waterElectricalConductivityTopic, JSON.stringify(waterElectricalConductivityState))
    console.log(JSON.stringify(waterElectricalConductivityState)) */
  })

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
    } else if (topic === lifecycleTopic) {
      lifecycleState = message
      console.log('lifecycle state:', String.fromCharCode.apply(null, lifecycleState))
    } else {
      console.log('invalid topic')
    }
  })
})