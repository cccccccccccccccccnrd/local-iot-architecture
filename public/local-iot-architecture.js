const login = document.getElementById('login')
const connectButton = document.getElementById('mqtt-connect')
const publishButton = document.getElementById('mqtt-publish')
const logTextarea = document.getElementById('log')
const statusBarLeft = document.getElementById('status-bar-left')
const statusBarRight = document.getElementById('status-bar-right')
const visualization = document.getElementById('visualization')
const currentTemperature = document.getElementById('current-temperature')
const temperatureChartContext = document.getElementById('temperature-chart').getContext('2d')
const currentHumidity = document.getElementById('current-humidity')
const humidityChartContext = document.getElementById('humidity-chart').getContext('2d')
const currentLightIntensity = document.getElementById('current-light-intensity')
const lightIntensityChartContext = document.getElementById('light-intensity-chart').getContext('2d')
const currentWaterTemperature = document.getElementById('current-water-temperature')
const waterTemperatureChartContext = document.getElementById('water-temperature-chart').getContext('2d')
const currentWaterElectricalConductivity = document.getElementById('current-water-electrical-conductivity')
const waterElectricalConductivityChartContext = document.getElementById('water-electrical-conductivity-chart').getContext('2d')

let client
let visualizationOpen = false, webcamLogsOpen = false

/* States and MQTT topics setup */
const iotaMamTopic = 'utils/iota-mam'
let iotaMamState

const temperatureTopic = 'sensor/temperature'
let temperatureState

const humidityTopic = 'sensor/humidity'
let humidityState

const lightIntensityTopic = 'sensor/light-intensity'
let lightIntensityState

const waterTemperatureTopic = 'sensor/water-temperature'
let waterTemperatureState

const waterElectricalConductivityTopic = 'sensor/water-electrical-conductivity'
let waterElectricalConductivityState

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

let waterTemperatureChart = new Chart(waterTemperatureChartContext, {
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

let waterElectricalConductivityChart = new Chart(waterElectricalConductivityChartContext, {
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

    logToTextarea('connected to ' + brokerIp)
    console.log('connected to ' + brokerIp)

    setTimeout(() => {
      login.style.removeProperty('height')
      statusBarRight.innerHTML = brokerIp + ' 🔐'
    }, 1200)
  })

  client.on('message', function (topic, message) {
    if (topic === temperatureTopic) {
      temperatureState = String(message)
      updateUserInterface(temperatureState, temperatureChart, currentTemperature)
    } else if (topic === humidityTopic) {
      humidityState = String(message)
      updateUserInterface(humidityState, humidityChart, currentHumidity)
    } else if (topic === lightIntensityTopic) {
      lightIntensityState = String(message)
      updateUserInterface(lightIntensityState, lightIntensityChart, currentLightIntensity)
    } else if (topic === waterTemperatureTopic) {
      waterTemperatureState = String(message)
      updateUserInterface(waterTemperatureState, waterTemperatureChart, currentWaterTemperature)
    } else if (topic === waterElectricalConductivityTopic) {
      waterElectricalConductivityState = String(message)
      updateUserInterface(waterElectricalConductivityState, waterElectricalConductivityChart, currentWaterElectricalConductivity)
    } else if (topic === iotaMamTopic) {
      iotaMamState = String(message)
      logToTextarea(iotaMamState)
      console.log(String(message))
    }
  })
}

statusBarLeft.onclick = function () {
  if (visualizationOpen == false) {
    visualization.style.marginLeft = '0'
    statusBarLeft.innerHTML = '&gt;'
    statusBarLeft.style.color = 'white'
    statusBarRight.style.color = 'white'
    visualizationOpen = true
  }  else if (visualizationOpen == true) {
    visualization.style.marginLeft = '-100vw'
    statusBarLeft.innerHTML = '&lt;'
    statusBarLeft.style.color = 'blue'
    statusBarRight.style.color = 'blue'
    visualizationOpen = false
  }
}

function updateUserInterface (state, chart, current) {
  logToTextarea(state)
  updateChart(chart, JSON.parse(state).timestamp, JSON.parse(state).value)
  current.innerHTML = JSON.parse(state).value
  console.log(state)
}

function logToTextarea (log) {
  let logTextareaContent = log + '\n\n' + logTextarea.value
  logTextarea.value = logTextareaContent
}

function updateChart (chart, label, data) {
  chart.data.labels.push(label)
  chart.data.datasets.forEach(dataset => {
    dataset.data.push(data)
  })
  chart.update()
}