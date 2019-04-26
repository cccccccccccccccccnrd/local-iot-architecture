require('dotenv').config()
const five = require('johnny-five')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const PiCamera = require('pi-camera')
const Datastore = require('nedb')

const db = new Datastore({ filename: `${process.env.LOGS_PATH}/readings`, autoload: true })

const topics = {
  bundledReadings: 'utils/bundled-readings',
  history: 'utils/history',
  oxygenpump: 'actor/oxygenpump',
  waterpump: 'actor/waterpump',
  temperature: 'sensor/temperature',
  humidity: 'sensor/temperature',
  lightIntensity: 'sensor/light-intensity',
  waterTemperature: 'sensor/water-temperature',
  waterElectricalConductivity: 'sensor/water-electrical-conductivity'
}

let states = {
  oxygenpump: false,
  waterpump: false,
  temperature: 0,
  humidity: 0,
  lightIntensity: 0,
  waterTemperature: 0,
  waterElectricalConductivity: 0
}

let devices = {
  dht11: null,
  photocell: null,
  relayOxygenpump: null,
  relayWaterpump: null,
  additionalArduino: null,
  camera: null
}

const board = new five.Board({
  port: '/dev/arduino01'
})

const additionalArduinoPort = new SerialPort('/dev/arduino02', {
  baudRate: 115200
})

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
  db,
  devices,
  topics,
  states
}
