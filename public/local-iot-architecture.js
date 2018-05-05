const connectButton = document.getElementById('mqtt-connect')
const publishButton = document.getElementById('mqtt-publish')
const logTextarea = document.getElementById('log')
const statusBarLeft = document.getElementById('status-bar-left')
const statusBarRight = document.getElementById('status-bar-right')
const visualization = document.getElementById('visualization')
const currentTemperature = document.getElementById('current-temperature')
const currentHumidity = document.getElementById('current-humidity')
const currentLightIntensity = document.getElementById('current-light-intensity')
const temperatureChartContext = document.getElementById('temperature-chart').getContext('2d')
const humidityChartContext = document.getElementById('humidity-chart').getContext('2d')
const lightIntensityChartContext = document.getElementById('light-intensity-chart').getContext('2d')

let client, visualizationOpen = false
/* States and MQTT topics setup */
const temperatureTopic = 'sensor/temperature'
let temperatureState

const humidityTopic = 'sensor/humidity'
let humidityState

const lightIntensityTopic = 'sensor/light-intensity'
let lightIntensityState

let temperatureChart = new Chart(temperatureChartContext, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Data',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0)',
      pointRadius: 0,
      pointBorderColor: 'white',
      pointBackgroundColor: 'white',
      pointHoverRadius: 3,
      pointHoverBorderColor: 'white',
      pointHoverBackgroundColor: 'white',
      data: []
    }]
  },
  options: {
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        display: false
      }],
      yAxes: [{
        display: false
      }]
    },
    responsive: true,
    maintainAspectRatio: true
  }
})

let humidityChart = new Chart(humidityChartContext, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Data',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0)',
      pointRadius: 0,
      pointBorderColor: 'white',
      pointBackgroundColor: 'white',
      pointHoverRadius: 3,
      pointHoverBorderColor: 'white',
      pointHoverBackgroundColor: 'white',
      data: []
    }]
  },
  options: {
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        display: false
      }],
      yAxes: [{
        display: false
      }]
    },
    responsive: true,
    maintainAspectRatio: true
  }
})

let lightIntensityChart = new Chart(lightIntensityChartContext, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Data',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0)',
      pointRadius: 0,
      pointBorderColor: 'white',
      pointBackgroundColor: 'white',
      pointHoverRadius: 3,
      pointHoverBorderColor: 'white',
      pointHoverBackgroundColor: 'white',
      data: []
    }]
  },
  options: {
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        display: false
      }],
      yAxes: [{
        display: false
      }]
    },
    responsive: true,
    maintainAspectRatio: true
  }
})

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

    statusBarRight.innerHTML = options.clientId + ' 🔐'
    logToTextarea('connected to ' + brokerIp)
    console.log('connected to ' + brokerIp)
  })

  client.on('message', function (topic, message) {
    if (topic === temperatureTopic) {
      temperatureState = String(message)
      logToTextarea(temperatureState)
      console.log('temperature', temperatureState)
      updateChart(temperatureChart, JSON.parse(temperatureState).timestamp, JSON.parse(temperatureState).value)
      currentTemperature.innerHTML = JSON.parse(temperatureState).value
    } else if (topic === humidityTopic) {
      humidityState = String(message)
      logToTextarea(humidityState)
      console.log('humidity', humidityState)
      updateChart(humidityChart, JSON.parse(humidityState).timestamp, JSON.parse(humidityState).value)
      currentHumidity.innerHTML = JSON.parse(humidityState).value
    } else if (topic === lightIntensityTopic) {
      lightIntensityState = String(message)
      logToTextarea(lightIntensityState)
      console.log('light-intensity', lightIntensityState)
      updateChart(lightIntensityChart, JSON.parse(lightIntensityState).timestamp, JSON.parse(lightIntensityState).value)
      currentLightIntensity.innerHTML = JSON.parse(lightIntensityState).value
    }
  })
}

function logToTextarea (log) {
  let logTextareaContent = log + '\n\n' + logTextarea.value
  logTextarea.value = logTextareaContent
}

statusBarLeft.onclick = function () {
  if (visualizationOpen == false) {
    visualization.style.marginLeft = '0'
    statusBarLeft.innerHTML = '&gt;'
    statusBarLeft.style.color = 'white'
    statusBarRight.style.color = 'white'
    visualizationOpen = true
  } else if (visualizationOpen == true) {
    visualization.style.marginLeft = '-100vw'
    statusBarLeft.innerHTML = '&lt;'
    statusBarLeft.style.color = 'blue'
    statusBarRight.style.color = 'blue'
    visualizationOpen = false
  }
}

function updateChart (chart, label, data) {
  chart.data.labels.push(label)
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(data)
  })
  chart.update()
}