# Local IoT architecture
Clear and simple architecture to setup local IoT environment in [Node.js](https://nodejs.org/en/). (technical seminar, 2. semester)

## Abstract
With this technical seminar I want to explore and document a clear and secure way of setting up a local interconnected architecture of machines, actors and humans (Internet-of-Things). My focus lies on creating a local, closed system, to provide data protection and security. In the end the architecture should be a part of a distributed system of multiple architectures, which on occasion may share information between each other.

In this technical seminar I will continue working on a project called 'Lifecycle' where we are working on decentralized indoor food production with computer aided aquaponics. Nevertheless the environment's architecture can be used for all different kind of machines, actors and humans.

For now the project plan looks like this:
- Research on open source IoT design patterns
- Implement the findings in prototypes
- Evaluate prototypes
- Clarify architecture of best working prototype (23.05.18)
- Refactor and document code
- Finishing documentation of the setup process (13.06.18)

Extra:
- Focus on front-end (web application) as Progressive Web App + Vue.js
- Base layout/ components
- Implementing Progressive Web App features
- Connecting front-end to middleware

## Architecture
```
Web application -> Raspberry Pi -> Arduino -> Actor  
Actor -> Arduino -> Raspberry Pi -> Web application  

Web application (html, css, vanilla js, mqtt.js)  
Raspberry Pi (Raspbian, Node.js, Mosca, Johnny-Five)  
Arduino (StandardFirmataPlus)
```
