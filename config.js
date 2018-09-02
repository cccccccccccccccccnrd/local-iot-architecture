const five = require('johnny-five')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

let devices = {}

const iotaMamTopic = 'utils/iota-mam'

const oxygenpumpTopic = 'actor/oxygenpump'
let oxygenpumpState = false

const temperatureTopic = 'sensor/temperature'
let temperatureState = 000

const humidityTopic = 'sensor/humidity'
let humidityState = 000

const lightIntensityTopic = 'sensor/light-intensity'
let lightIntensityState = 000

const waterTemperatureTopic = 'sensor/water-temperature'
let waterTemperatureState = 000

const waterElectricalConductivityTopic = 'sensor/water-electrical-conductivity'
let waterElectricalConductivityState = 000

const board = new five.Board({
  port: '/dev/ttyACM1'
})

const additionalArduinoPort = new SerialPort('/dev/ttyACM0', {
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

  devices.additionalArduino = additionalArduinoPort.pipe(new Readline())
}

function get (device) {
  if (device == 'dht11') return devices.dht11
  if (device == 'photocell') return devices.photocell
  if (device == 'relayOxygenpump') return devices.relayOxygenpump
  if (device == 'additionalArduino') return devices.additionalArduino
  else {
    throw Error(`Could not find ${device}`)
  }
}

module.exports = {
  init,
  get,
  board,
  additionalArduino,
  devices,
  iotaMamTopic,
  oxygenpumpTopic,
  oxygenpumpState,
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