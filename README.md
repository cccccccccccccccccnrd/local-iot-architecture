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

### Installing local-iot-architecture

The environment is build with the JavaScript runtime [Node.js](https://nodejs.org).

#### Installing Node.js

To install Node.js we are using [Node Version Manager](https://github.com/creationix/nvm). It's pretty straight forward and allows you to easily switch node versions if needed.

```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Then we install the lastest node version

```shell
nvm install latest
```
> If `nvm` isn't found run your `~/.bashrc` file once.

To check your node version just

```shell
node -v
```

#### Cloning the repository

To get local-iot-architecture version 1.0.0 we clone from here

```bash
git clone git@github.com:cccccccccccccccccnrd/local-iot-architecture.git
```

and install the node modules with [npm](https://www.npmjs.com/) which came with the Node.js installation

```bash
npm install
```

#### Starting the application

To start the environment simply execute the `index.js` file with node.

```bash
node index.js
```

### Configuring local-iot-architecture

### Interface and Settings

### Resources
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Mosca](https://github.com/mcollina/mosca)
- [Node Serialport](https://github.com/node-serialport/node-serialport)
- [Johnny-Five](https://github.com/rwaldron/johnny-five)
- [DHT11 setup](http://johnny-five.io/examples/multi-DHT11_I2C_NANO_BACKPACK)
- [Arduino Nano DHT11 setup firmware](https://github.com/rwaldron/johnny-five/blob/master/firmwares/dht_i2c_nano_backpack.ino)
- [Arduino StandardFirmataPlus firmware](https://github.com/firmata/arduino/blob/master/examples/StandardFirmataPlus/StandardFirmataPlus.ino)
- [CH340 driver for macOS](https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver)
