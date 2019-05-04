require('dotenv').config()
const setup = require('./config')
const httpServer = require('./http-server')
const mqtt = require('./mqtt-server')
// const iotaMam = require('./iota-mam')

httpServer.serve(3000)

console.log(setup.devices.camera)
setup.devices.camera.set('output', `${ process.env.LOGS_PATH }/cool.jpg`)

setup.board.on('ready', () => {
  setup.init()

  publishAndRetainHistory()

  let latestReadings = {}

  /* Timed actors */
  setInterval(() => {
    const now = new Date()

    if ((now.getHours() === 8 && now.getMinutes() === 55) ||
        (now.getHours() === 14 && now.getMinutes() === 55) ||
        (now.getHours() === 22 && now.getMinutes() === 55)) {
      setup.states.oxygenpump = !setup.states.oxygenpump
      setup.devices.relayOxygenpump.open()
      console.log('oxygenpump:', setup.states.oxygenpump)

      setTimeout(() => {
        setup.states.oxygenpump = !setup.states.oxygenpump
        setup.devices.relayOxygenpump.close()
        console.log('oxygenpump:', setup.states.oxygenpump)
      }, 5 * 60000)
    }

    if ((now.getHours() === 9 && now.getMinutes() === 0) ||
        (now.getHours() === 15 && now.getMinutes() === 0) ||
        (now.getHours() === 23 && now.getMinutes() === 0)) {
      setup.states.waterpump = !setup.states.waterpump
      setup.devices.relayWaterpump.open()
      console.log('waterpump:', setup.states.waterpump)

      setTimeout(() => {
        setup.states.waterpump = !setup.states.waterpump
        setup.devices.relayWaterpump.close()
        console.log('waterpump:', setup.states.waterpump)
      }, 2 * 60000)
    }

    if ((now.getHours() === 10 && now.getMinutes() === 0) ||
        (now.getHours() === 22 && now.getMinutes() === 0)) {
      const timestamp = Date.now()

      let bundledReadings = {}
      bundledReadings.readings = Object.values(latestReadings)
      bundledReadings.timestamp = timestamp

      setup.db.insert(bundledReadings)
      publishAndRetainHistory()

      setup.devices.camera.set('output', `${ process.env.LOGS_PATH }/${ timestamp }.jpg`)
      setup.devices.camera.snap()
        .then(result => {
          console.log(`logs ${timestamp} saved`)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }, 60000)

  /* Interval MQTT publish */
  setInterval(() => {
    let bundledReadings = {}
    bundledReadings.readings = Object.values(latestReadings)
    bundledReadings.timestamp = Date.now()

    // iotaMam.publishToTangle(JSON.stringify(bundledReadings))
    
    mqtt.server.publish({
      topic: setup.topics.bundledReadings,
      payload: JSON.stringify(bundledReadings)
    })

    console.log(JSON.stringify(bundledReadings))
  }, 60000 * 1)

  /* MQTT publish */
  setup.devices.dht11.on('change', function () {
    setup.states.temperature = {
      type: 'temperature',
      value: this.thermometer.celsius,
      timestamp: Date.now()
    }

    mqtt.server.publish({
      topic: setup.topics.temperature,
      payload: JSON.stringify(setup.states.temperature)
    })

    latestReadings.temperature = setup.states.temperature

    setup.states.humidity = {
      type: 'humidity',
      value: this.hygrometer.relativeHumidity,
      timestamp: Date.now()
    }

    mqtt.server.publish({
      topic: setup.topics.humidity,
      payload: JSON.stringify(setup.states.humidity)
    })

    latestReadings.humidity = setup.states.humidity
  })

  setup.devices.photocell.on('data', function () {
    setup.states.lightIntensity = {
      type: 'light-intensity',
      value: Math.floor(100 - this.level * 100),
      timestamp: Date.now()
    }

    mqtt.server.publish({
      topic: setup.topics.lightIntensity,
      payload: JSON.stringify(setup.states.lightIntensity)
    })

    latestReadings.lightIntensity = setup.states.lightIntensity
  })

  setup.devices.additionalArduino.on('data', function (data) {
    if (!data.startsWith('{')) return

    setup.states.waterTemperature = {
      type: 'water-temperature',
      value: Math.floor(JSON.parse(data.toString()).temperature),
      timestamp: Date.now()
    }

    mqtt.server.publish({
      topic: setup.topics.waterTemperature,
      payload: JSON.stringify(setup.states.waterTemperature)
    })

    latestReadings.waterTemperature = setup.states.waterTemperature

    setup.states.waterElectricalConductivity = {
      type: 'electrical-conductivity',
      value: Math.floor(JSON.parse(data.toString()).ec),
      timestamp: Date.now()
    }

    mqtt.server.publish({
      topic: setup.topics.waterElectricalConductivity,
      payload: JSON.stringify(setup.states.waterElectricalConductivity)
    })

    latestReadings.waterElectricalConductivity = setup.states.waterElectricalConductivity
  })

  /* MQTT subscribe */
  mqtt.client.on('message', (topicBuffer, messageBuffer) => {
    const topic = String(topicBuffer)
    const message = String(messageBuffer)

    if (topic === setup.topics.oxygenpump) {
      if (message === 'toggle') {
        setup.states.oxygenpump = !setup.states.oxygenpump

        if (setup.states.oxygenpump) {
          setup.devices.relayOxygenpump.open()
          console.log('oxygenpump:', setup.states.oxygenpump)
        } else {
          setup.devices.relayOxygenpump.close()
          console.log('oxygenpump:', setup.states.oxygenpump)
        }
      } else if (Number.isInteger(Number(message))) {
        setup.states.oxygenpump = !setup.states.oxygenpump

        if (setup.states.oxygenpump) {
          setup.devices.relayOxygenpump.open()
          console.log(`oxygenpump: ${setup.states.oxygenpump} open for ${Number(message)}`)

          setTimeout(() => {
            setup.states.oxygenpump = !setup.states.oxygenpump
            setup.devices.relayOxygenpump.close()
            console.log(`oxygenpump: ${setup.states.oxygenpump}`)
          }, String(message))
        }
      }
    } else if (topic === setup.topics.waterpump) {
      if (message === 'flushlol') {
        setup.states.waterpump = !setup.states.waterpump

        if (setup.states.waterpump) {
          setup.devices.relayWaterpump.open()
          console.log(`waterpump got flushed lol: ${setup.states.waterpump}`)

          setTimeout(() => {
            setup.states.waterpump = !setup.states.waterpump
            setup.devices.relayWaterpump.close()
            console.log(`waterpump: ${setup.states.waterpump}`)
          }, 2 * 60000)
        }
      }
    } else console.log('invalid topic')
  })
})

function publishAndRetainHistory () {
  setup.db.find({}).sort({ timestamp: 1 }).exec((error, history) => {
    if (error) {
      console.error(error)
    }

    mqtt.server.publish({ topic: setup.topics.history, payload: JSON.stringify(history), retain: true }, () => {
      console.log(JSON.stringify(history))
    })
  })
}
