const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')

let waterpumpTopic = 'lifecycle/actor/waterpump'
let waterpumpState = false

/* Mosca server (MQTT server) setup */
const port = 1883
const server = new mosca.Server({ port: port })

server.on('ready', function () {
  console.log('server running on port', port)
})

server.on('clientConnected', function(client) {
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
      console.log('waterpump state:', waterpumpState)
    } else {
      console.log('invalid message')
    }
  } else {
    console.log('topic was not', waterpumpTopic)
  }
})

/* Arduino setup */
const board = new five.Board()

board.on("ready", function() {

  lcd = new five.LCD({
    pins: [7, 8, 9, 10, 11, 12],
    backlight: 6,
    rows: 2,
    cols: 16
  })

  lcd.clear().print('Waterpump:', waterpumpState)
  lcd.cursor(1, 0)

  this.repl.inject({
    lcd: lcd
  })
})