let client

const connectButton = document.getElementById('mqtt-connect')
const publishButton = document.getElementById('mqtt-publish')
const logTextarea = document.getElementById('log')

publishButton.onclick = function () {
  const topic = document.getElementById('mqtt-topic').value
  const message = document.getElementById('mqtt-message').value

  client.publish(topic, message)
  logInTextarea('published ' + message + ' in ' + topic)
  console.log('published ' + message + ' in ' + topic)
}

connectButton.onclick = function () {
  const brokerIp = document.getElementById('mqtt-broker-ip').value

  const options = {
    clientId: 'local-client-' + Math.random().toString(16).substr(2, 8)
  }
  client = mqtt.connect('ws://' + brokerIp, options)
  logInTextarea('trying to connect to ' + brokerIp)
  console.log('trying to connect to', brokerIp)

  client.on('connect', function () {
    logInTextarea('connected to ' + brokerIp)
    console.log('connected to', brokerIp)
  })
}

function logInTextarea (log) {
  let logTextareaContent = log + '\n\n' + logTextarea.value
  logTextarea.value = logTextareaContent
}