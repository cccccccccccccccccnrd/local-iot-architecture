const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')

/* Arduino setup */
const board = new five.Board()

board.on("ready", function () {

  lcd = new five.LCD({
    pins: [7, 8, 9, 10, 11, 12],
    backlight: 6,
    rows: 2,
    cols: 16
  })

  /* Actor states and MQTT topics setup */
  const waterpumpTopic = 'lifecycle/actor/waterpump'
  let waterpumpState = false

  const schnuckTopic = 'lifecycle/actor/schnuck'
  let schnuckState = 'cool'

  /* Mosca server (MQTT server) setup */
  const settings = {
    http: {
      port: 3000,
      bundle: true,
      static: './'
    }
  }
  const server = new mosca.Server(settings)

  server.on('ready', function () {
    console.log('server is running')
  })

  server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
  });

  /* MQTT client (publisher) setup */
  const client = mqtt.connect('mqtt://127.0.0.1')

  client.on('connect', function () {
    client.subscribe(waterpumpTopic)
  })

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
    } else if (topic == schnuckTopic) {
      lcd.clear().print('Schnuck is ' + schnuckState)

      console.log('schnuck state:', schnuckState)
    } else {
      console.log('invalid topic')
    }
  })

  this.repl.inject({
    lcd: lcd
  })
})