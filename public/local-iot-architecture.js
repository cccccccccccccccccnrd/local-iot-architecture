const connectButton = document.getElementById('mqtt-connect')
const publishButton = document.getElementById('mqtt-publish')
const logTextarea = document.getElementById('log')
const connectedAs = document.getElementById('connected-as')
const connectedTo = document.getElementById('connected-to')
const visualization = document.getElementById('visualization')

let client, visualizationOpen = false

const temperatureTopic = 'sensor/temperature'
let temperatureState

const humidityTopic = 'sensor/humidity'
let humidityState

publishButton.onclick = function () {
  const topic = document.getElementById('mqtt-topic').value
  const message = document.getElementById('mqtt-message').value

  client.publish(topic, message)
  logToTextarea('published ' + message + ' in ' + topic)
  console.log('published ' + message + ' in ' + topic)
}

connectButton.onclick = function () {
  const brokerIp = document.getElementById('mqtt-broker-ip').value
  const username = document.getElementById('mqtt-broker-username').value
  const password = document.getElementById('mqtt-broker-password').value
  console.log(username, password)
  const options = {
    clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
    username: username,
    password: password
  }

  client = mqtt.connect('mqtt://' + brokerIp, options)
  logToTextarea('connecting to ' + brokerIp + '...')
  console.log('connecting to ' + brokerIp + '...')

  client.on('connect', function () {
    client.subscribe('sensor/#')

    connectedTo.innerHTML = brokerIp
    connectedAs.innerHTML = options.clientId + ' 🤟'
    logToTextarea('connected to ' + brokerIp)
    console.log('connected to ' + brokerIp)
  })

  client.on('message', function (topic, message) {
    if (topic == temperatureTopic) {
      temperatureState = String(message)
      logToTextarea(temperatureState)
      console.log('temperature', temperatureState)
    } else if (topic == humidityTopic) {
      humidityState = String(message)
      logToTextarea(humidityState)
      console.log('humidity', humidityState)
    }
  })
}

connectedAs.onclick = function () {
  if (visualizationOpen == false) {
    
  }
}

function logToTextarea (log) {
  let logTextareaContent = log + '\n\n' + logTextarea.value
  logTextarea.value = logTextareaContent
}