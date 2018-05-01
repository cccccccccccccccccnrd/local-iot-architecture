let client

const connectButton = document.getElementById('mqtt-connect')
const publishButton = document.getElementById('mqtt-publish')
const logTextarea = document.getElementById('log')
const connectedAs = document.getElementById('connected-as')
const connectedTo = document.getElementById('connected-to')

publishButton.onclick = function () {
  const topic = document.getElementById('mqtt-topic').value
  const message = document.getElementById('mqtt-message').value

  client.publish(topic, message)
  logToTextarea('published ' + message + ' in ' + topic)
  console.log('published ' + message + ' in ' + topic)
}

connectButton.onclick = function () {
  const brokerIp = document.getElementById('mqtt-broker-ip').value
  const options = {
    clientId: 'web-client-' + Math.random().toString(16).substr(2, 8)
  }

  client = mqtt.connect('mqtt://' + brokerIp, options)
  logToTextarea('connecting to ' + brokerIp + '...')
  console.log('connecting to ' + brokerIp + '...')

  client.on('connect', function () {
    connectedTo.innerHTML = brokerIp
    connectedAs.innerHTML = options.clientId + ' 🤟'
    logToTextarea('connected to ' + brokerIp)
    console.log('connected to ' + brokerIp)
  })
}

function logToTextarea (log) {
  let logTextareaContent = log + '\n\n' + logTextarea.value
  logTextarea.value = logTextareaContent
}