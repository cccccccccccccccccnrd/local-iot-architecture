## Local Internet of Things architecture
Clear and simple architecture to setup a local Internet of Things environment in [Node.js](https://nodejs.org/en/). (Interactive Application, technical seminar)

### Abstract
With this technical seminar I want to explore and document a clear and secure way of setting up a local interconnected architecture of machines, actors and humans (Internet of Things). My focus lies on creating a local, closed system, to provide data protection and security. In the end the architecture should be a part of a distributed system of multiple architectures, which on occasion may share information between each other.

In this technical seminar I will continue working on a project called 'Lifecycle' where we are working on decentralized indoor food production with computer aided aquaponics. Nevertheless the environment's architecture can be used for all kind of different purposes.

### Architecture
```
Web application -> Raspberry Pi -> Arduino -> Actor/Sensor
Actor/Sensor -> Arduino -> Raspberry Pi -> Web application

Web application (html, css, vanilla js, mqtt.js)
Raspberry Pi (Raspbian, Node.js, Mosca, Johnny-Five)  
Arduino (StandardFirmataPlus)
```

### Resources
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Mosca](https://github.com/mcollina/mosca)
- [Node Serialport](https://github.com/node-serialport/node-serialport)
- [Johnny-Five](https://github.com/rwaldron/johnny-five)
- [DHT11 setup](http://johnny-five.io/examples/multi-DHT11_I2C_NANO_BACKPACK)
- [Arduino Nano DHT11 setup firmware](https://github.com/rwaldron/johnny-five/blob/master/firmwares/dht_i2c_nano_backpack.ino)
- [Arduino StandardFirmataPlus firmware](https://github.com/firmata/arduino/blob/master/examples/StandardFirmataPlus/StandardFirmataPlus.ino)
- [CH340 driver for macOS](https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver)
