const five = require('johnny-five')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

function init () {
  const dht11 = new five.Multi({
    controller: 'DHT11_I2C_NANO_BACKPACK'
  })
  
  const photocell = new five.Light({
    pin: 'A3',
    freq: 2000
  })
  
  const relayOxygenpump = new five.Relay({
    pin: 7,
    type: 'NC'
  })

  module.exports = {
    dht11,
    photocell,
    relayOxygenpump
  }
}

const board = new five.Board({
  port: '/dev/ttyACM1'
})

const additionalArduinoPort = new SerialPort('/dev/ttyACM0', {
  baudRate: 115200
})

const additionalArduino = additionalArduinoPort.pipe(new Readline())

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

module.exports = {
  init,
  board,
  additionalArduinoPort,
  additionalArduino,
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