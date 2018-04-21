const mosca = require('mosca')
const mqtt = require('mqtt')
const five = require('johnny-five')

/* Mosca server (MQTT server) setup */
const server = new mosca.Server({ port: 1883 })

server.on('ready', function () {
  console.log('Server ready')
})

/* MQTT client (publisher) setup */
const client  = mqtt.connect('mqtt://127.0.0.1')

client.on('connect', function () {
  setInterval(function () {
    client.publish('myTopic', 'Hello mqtt')
    console.log('Message Sent')
  }, 5000)
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

  lcd.clear().print('Waterpump: on')
  lcd.cursor(1, 0)

  this.repl.inject({
    lcd: lcd
  })
})