require('dotenv').config()
const MAM = require('./includes/mam.client.js')
const IOTA = require('iota.lib.js')

const iotaProvider = new IOTA({ provider: 'https://field.deviota.com:443' })
const iotaSeed = process.env.IOTA_SEED

let mamState = MAM.init(iotaProvider, iotaSeed)

async function publishToTangle (data) {
  const message = MAM.create(mamState, data)

  mamState = message.state

  console.log('iota-mam-root: ', message.root)
  console.log('iota-mam-address: ', message.address)
  await MAM.attach(message.payload, message.address)
    .then((error) => {
      console.log(error)
    })
}

module.exports = {
  publishToTangle
}
