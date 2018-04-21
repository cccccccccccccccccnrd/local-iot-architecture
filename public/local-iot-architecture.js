const client = mqtt.connect('mqtt://192.168.178.51:3000')
const button = document.getElementById('mqtt-send')

button.onclick = function () {
  const topic = document.getElementById('mqtt-topic').value
  const message = document.getElementById('mqtt-message').value

  client.publish(topic, message)
}