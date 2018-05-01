const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')
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

  lcd = new five.LCD({
    pins: [7, 8, 9, 10, 11, 12],
    backlight: 6,
    rows: 2,
    cols: 16
  })

  dht11 = new five.Multi({
    controller: 'DHT11_I2C_NANO_BACKPACK'
  })

  dht11.on('change', function () {
    console.log('celsius:', this.thermometer.celsius)
    console.log('fahrenheit:', this.thermometer.fahrenheit)
    console.log('kelvin:', this.thermometer.kelvin)
    console.log('relative humidity:', this.hygrometer.relativeHumidity)
  })

  /* Actor states and MQTT topics setup */
  const waterpumpTopic = 'lifecycle/actor/waterpump'
  let waterpumpState = false

  const lifecycleTopic = 'lifecycle/actor/lifecycle'
  let lifecycleState = 'cool'

  /* Mosca websocket server setup */
  const moscaServerSettings = {
    http: {
      port: 3001,
      bundle: true,
      static: './'
    }
  }
  const moscaServer = new mosca.Server(moscaServerSettings)

  moscaServer.on('ready', function () {
    console.log('mqtt server is running on port', moscaServerSettings.http.port)
  })

  moscaServer.on('clientConnected', function (client) {
    console.log('client connected', client.id);
  });

  /* MQTT client setup */
  const options = {
    clientId: 'broker-client-' + Math.random().toString(16).substr(2, 8)
  }
  const client = mqtt.connect('mqtt://127.0.0.1', options)

  client.on('connect', function () {
    client.subscribe('lifecycle/#')
  })

  /* MQTT message handeling */
  client.on('message', function (topic, message) {    
    if (topic == waterpumpTopic) {
      if (message == 'toggle') {
        waterpumpState = !waterpumpState

        if (waterpumpState) {
          lcd.clear().print('Waterpump is on')
        } else {
          lcd.clear().print('Waterpump is off')
        }

        console.log('waterpump state:', waterpumpState)
      } else {
        console.log('invalid message')
      }
    } else if (topic == lifecycleTopic) {
      lifecycleState = message
      lcd.clear().home().print('lifecycle is ...')
      lcd.cursor(1, 0).print(lifecycleState)

      console.log('lifecycle state:', String.fromCharCode.apply(null, lifecycleState))
    } else {
      console.log('invalid topic')
    }
  })

  this.repl.inject({
    lcd: lcd
  })
})