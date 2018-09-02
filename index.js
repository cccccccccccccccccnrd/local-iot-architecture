const setup = require('./config')
const httpServer = require('./http-server')
const mqttServer = require('./mqtt-server')
const iotaMam = require('./iota-mam')

httpServer.serve(3000)
mqttServer.serve(3001)

setup.board.on('ready', function () {

  setup.init()

  let latestReadings = {}

  setInterval(() => {
    let bundledReadings = {}
    bundledReadings.readings = Object.values(latestReadings)
    bundledReadings.image = 'base64-string'
    bundledReadings.timestamp = Date.now()

    // iotaMam.publishToTangle(JSON.stringify(latestReadings))
    mqttServer.client.publish(iotaMamTopic, JSON.stringify(bundledReadings))
    console.log(JSON.stringify(bundledReadings))
  }, 60000 * 1)

  /* MQTT publish handeling */
  console.log(setup.dht11)
  setup.init.dht11.on('change', function () {
    setup.temperatureState = {
      'type': 'temperature',
      'value': this.thermometer.celsius,
      'timestamp': Date.now()
    }
    mqttServer.client.publish(setup.temperatureTopic, JSON.stringify(setup.temperatureState))
    latestReadings.temperature = setup.temperatureState

    setup.humidityState = {
      'type': 'humidity',
      'value': this.hygrometer.relativeHumidity,
      'timestamp': Date.now()
    }
    mqttServer.client.publish(setup.humidityTopic, JSON.stringify(setup.humidityState))
    latestReadings.humidity = setup.humidityState
  })

  setup.photocell.on('data', function () {
    setup.lightIntensityState = {
      'type': 'light-intensity',
      'value': Math.floor(100 - this.level * 100),
      'timestamp': Date.now()
    }
    mqttServer.client.publish(setup.lightIntensityTopic, JSON.stringify(setup.lightIntensityState))
    latestReadings.lightIntensity = setup.lightIntensityState
  })

  setup.additionalArduino.on('data', function (data) {
    if (!data.startsWith('{')) return

    setup.waterTemperatureState = {
      'type': 'water-temperature',
      'value': Math.floor(JSON.parse(data.toString()).temperature),
      'timestamp': Date.now()
    }
    mqttServer.client.publish(setup.waterTemperatureTopic, JSON.stringify(setup.waterTemperatureState))
    latestReadings.waterTemperature = setup.waterTemperatureState

    setup.waterElectricalConductivityState = {
      'type': 'electrical-conductivity',
      'value': Math.floor(JSON.parse(data.toString()).ec),
      'timestamp': Date.now()
    }
    mqttServer.client.publish(setup.waterElectricalConductivityTopic, JSON.stringify(setup.waterElectricalConductivityState))
    latestReadings.waterElectricalConductivity = setup.waterElectricalConductivityState
  })

  /* Timed actors handeling */
  setInterval(() => {
    const now = new Date()

    if ((now.getHours() === 12-2 && now.getMinutes() === 00) || (now.getHours() === 18-2 && now.getMinutes() === 00)) {
      setup.oxygenpumpState = !setup.oxygenpumpState
      setup.relayOxygenpump.open()
        console.log('oxygenpump:', setup.oxygenpumpState)
        setTimeout(() => {
          setup.oxygenpumpState = !setup.oxygenpumpState
          setup.relayOxygenpump.close()
          console.log('oxygenpump:', setup.oxygenpumpState)
        }, 5 * 60000)
    }
  }, 60000)

  /* MQTT subscribe handeling */
  mqttServer.client.on('message', function (topic, message) {
    if (topic === setup.oxygenpumpTopic) {
      if (message == 'toggle') {
        setup.oxygenpumpState = !setup.oxygenpumpState
        if (setup.oxygenpumpState) {
          setup.relayOxygenpump.open()
          console.log('oxygenpump:', setup.oxygenpumpState)
        } else {
          setup.relayOxygenpump.close()
          console.log('oxygenpump:', setup.oxygenpumpState)
        }
      } else if (Number.isInteger(Number(message))) {
        setup.oxygenpumpState = !setup.oxygenpumpState
        if (setup.oxygenpumpState) {
          setup.relayOxygenpump.open()
          console.log(`oxygenpump: ${setup.oxygenpumpState} open for ${Number(message)}`)
          
          setTimeout(() => {
            setup.oxygenpumpState = !setup.oxygenpumpState
            setup.relayOxygenpump.close()
            console.log(`oxygenpump: ${setup.oxygenpumpState}`)
          }, String(message))
        }
      }
    } else console.log('invalid topic')
  })
})
