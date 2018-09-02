const express = require('express')

function serve (port) {
  const settings = {
    port,
    staticPath: __dirname + '/public'
  }
  const server = express()

  server.use(express.static(settings.staticPath))
  server.listen(settings.port)

  console.log(`http-server serving on port ${settings.port}`)

  return server
}

module.exports = {
  serve
}