require('dotenv').config()
const five = require('johnny-five')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const PiCamera = require('pi-camera')
const Datastore = require('nedb')

let devices = {
  dht11: null,
  photocell: null,
  relayOxygenpump: null,
  relayWaterpump: null,
  additionalArduino: null,
  camera: null,
  db: null
}

const bundledReadingsTopic = 'utils/bundled-readings'

const historyTopic = 'utils/history'

const oxygenpumpTopic = 'actor/oxygenpump'
let oxygenpumpState = false

const waterpumpTopic = 'actor/waterpump'
let waterpumpState = false

const temperatureTopic = 'sensor/temperature'
let temperatureState = 0

const humidityTopic = 'sensor/humidity'
let humidityState = 0

const lightIntensityTopic = 'sensor/light-intensity'
let lightIntensityState = 0

const waterTemperatureTopic = 'sensor/water-temperature'
let waterTemperatureState = 0

const waterElectricalConductivityTopic = 'sensor/water-electrical-conductivity'
let waterElectricalConductivityState = 0

const board = new five.Board({
  port: '/dev/arduino01'
})

const additionalArduinoPort = new SerialPort('/dev/arduino02', {
  baudRate: 115200
})

devices.db = new Datastore({ filename: `${process.env.LOGS_PATH}/readings`, autoload: true })

function init () {
  devices.dht11 = new five.Multi({
    controller: 'DHT11_I2C_NANO_BACKPACK'
  })

  devices.photocell = new five.Light({
    pin: 'A3',
    freq: 2000
  })

  devices.relayOxygenpump = new five.Relay({
    pin: 7,
    type: 'NC'
  })

  devices.relayWaterpump = new five.Relay({
    pin: 6,
    type: 'NC'
  })

  devices.additionalArduino = additionalArduinoPort.pipe(new Readline())

  devices.camera = new PiCamera({
    mode: 'photo',
    width: 1640,
    height: 1232,
    nopreview: true
  })
}

function get (device) {
  if (device === 'dht11') return devices.dht11
  if (device === 'photocell') return devices.photocell
  if (device === 'relayOxygenpump') return devices.relayOxygenpump
  if (device === 'relayWaterpump') return devices.relayWaterpump
  if (device === 'additionalArduino') return devices.additionalArduino
  if (device === 'camera') return devices.camera
  if (device === 'db') return db
  else {
    throw Error(`Could not find ${device}`)
  }
}

module.exports = {
  init,
  get,
  board,
  devices,
  bundledReadingsTopic,
  historyTopic,
  oxygenpumpTopic,
  oxygenpumpState,
  waterpumpTopic,
  waterpumpState,
  temperatureTopic,
  temperatureState,
  humidityTopic,
  humidityState,
  lightIntensityTopic,
  lightIntensityState,
  waterTemperatureTopic,
  waterTemperatureState,
  waterElectricalConductivityTopic,
  waterElectricalConductivityState
}
