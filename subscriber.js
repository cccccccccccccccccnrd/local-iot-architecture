const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://127.0.0.1')

client.on('connect', function () {
    client.subscribe('myTopic')
})

client.on('message', function (topic, message) {
  context = message.toString()
  console.log(context)
})