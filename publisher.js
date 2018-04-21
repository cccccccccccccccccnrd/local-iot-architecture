const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://127.0.0.1')

let waterpumpTopic = 'lifecycle/actor/waterpump'
let waterpumpState = false

client.on('connect', function () {
  setInterval(function () {
    client.publish(waterpumpTopic, 'toggle')
    console.log('toggled waterpump')
  }, 5000)
})