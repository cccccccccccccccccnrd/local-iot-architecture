const chalk = require('chalk')
const setup = require('./config')
const httpServer = require('./http-server')
const mqttServer = require('./mqtt-server')
const iotaMam = require('./iota-mam')

httpServer.serve(3000)
mqttServer.serve(3001)

setup.board.on('ready', function () {
  setup.init()

  let latestReadings = {}

  /* Timed actors */
  setInterval(() => {
    const now = new Date()

    if ((now.getHours() === 8-2 && now.getMinutes() === 55) ||
        (now.getHours() === 14-2 && now.getMinutes() === 55) ||
        (now.getHours() === 22-2 && now.getMinutes() === 55)) {
      setup.oxygenpumpState = !setup.oxygenpumpState
      setup.get('relayOxygenpump').open()
      console.log('oxygenpump:', setup.oxygenpumpState)
      setTimeout(() => {
        setup.oxygenpumpState = !setup.oxygenpumpState
        setup.get('relayOxygenpump').close()
        console.log('oxygenpump:', setup.oxygenpumpState)
      }, 5 * 60000)
    }

    if ((now.getHours() === 9-2 && now.getMinutes() === 00) ||
        (now.getHours() === 15-2 && now.getMinutes() === 00) ||
        (now.getHours() === 23-2 && now.getMinutes() === 00)) {
      setup.waterpumpState = !setup.waterpumpState
      setup.get('relayWaterpump').open()
      console.log('waterpump:', setup.waterpumpState)
      setTimeout(() => {
        setup.waterpumpState = !setup.waterpumpState
        setup.get('relayWaterpump').close()
        console.log('waterpump:', setup.waterpumpState)
      }, 1 * 60000)
    }
  }, 60000)

  /* Interval MQTT publish */
  setInterval(() => {
    let bundledReadings = {}
    bundledReadings.readings = Object.values(latestReadings)
    bundledReadings.image = 'base64-string'
    bundledReadings.timestamp = Date.now()

    // iotaMam.publishToTangle(JSON.stringify(bundledReadings))
    mqttServer.get('client').publish(setup.iotaMamTopic, JSON.stringify(bundledReadings))
    console.log(`READINGS / ${bundledReadings.timestamp}: ${chalk.inverse(JSON.stringify(bundledReadings))}`)
  }, 60000 * 1)

  /* MQTT publish */
  setup.get('dht11').on('change', function () {
    setup.temperatureState = {
      'type': 'temperature',
      'value': this.thermometer.celsius,
      'timestamp': Date.now()
    }
    mqttServer.get('client').publish(setup.temperatureTopic, JSON.stringify(setup.temperatureState))
    latestReadings.temperature = setup.temperatureState

    setup.humidityState = {
      'type': 'humidity',
      'value': this.hygrometer.relativeHumidity,
      'timestamp': Date.now()
    }
    mqttServer.get('client').publish(setup.humidityTopic, JSON.stringify(setup.humidityState))
    latestReadings.humidity = setup.humidityState
  })

  setup.get('photocell').on('data', function () {
    setup.lightIntensityState = {
      'type': 'light-intensity',
      'value': Math.floor(100 - this.level * 100),
      'timestamp': Date.now()
    }
    mqttServer.get('client').publish(setup.lightIntensityTopic, JSON.stringify(setup.lightIntensityState))
    latestReadings.lightIntensity = setup.lightIntensityState
  })

  setup.get('additionalArduino').on('data', function (data) {
    if (!data.startsWith('{')) return

    setup.waterTemperatureState = {
      'type': 'water-temperature',
      'value': Math.floor(JSON.parse(data.toString()).temperature),
      'timestamp': Date.now()
    }
    mqttServer.get('client').publish(setup.waterTemperatureTopic, JSON.stringify(setup.waterTemperatureState))
    latestReadings.waterTemperature = setup.waterTemperatureState

    setup.waterElectricalConductivityState = {
      'type': 'electrical-conductivity',
      'value': Math.floor(JSON.parse(data.toString()).ec),
      'timestamp': Date.now()
    }
    mqttServer.get('client').publish(setup.waterElectricalConductivityTopic, JSON.stringify(setup.waterElectricalConductivityState))
    latestReadings.waterElectricalConductivity = setup.waterElectricalConductivityState
  })

  /* MQTT subscribe */
  mqttServer.get('client').on('message', function (topic, message) {
    if (topic === setup.oxygenpumpTopic) {
      if (message == 'toggle') {
        setup.oxygenpumpState = !setup.oxygenpumpState

        if (setup.oxygenpumpState) {
          setup.get('relayOxygenpump').open()
          console.log('oxygenpump:', setup.oxygenpumpState)
        } else {
          setup.get('relayOxygenpump').close()
          console.log('oxygenpump:', setup.oxygenpumpState)
        }
      } else if (Number.isInteger(Number(message))) {
        setup.oxygenpumpState = !setup.oxygenpumpState

        if (setup.oxygenpumpState) {
          setup.get('relayOxygenpump').open()
          console.log(`oxygenpump: ${setup.oxygenpumpState} open for ${Number(message)}`)
          
          setTimeout(() => {
            setup.oxygenpumpState = !setup.oxygenpumpState
            setup.get('relayOxygenpump').close()
            console.log(`oxygenpump: ${setup.oxygenpumpState}`)
          }, String(message))
        }
      }
    } else if (topic === setup.waterpumpTopic) {
      if (message == 'flushlol') {
        setup.waterpumpState = !setup.waterpumpState

        if (setup.waterpumpState) {
          setup.get('relayWaterpump').open()
          console.log(`waterpump got flushed lol: ${setup.waterpumpState}`)
          
          setTimeout(() => {
            setup.waterpumpState = !setup.waterpumpState
            setup.get('relayWaterpump').close()
            console.log(`waterpump: ${setup.waterpumpState}`)
          }, 1 * 60000)
        }
      }
    } else console.log('invalid topic')
  })
})
