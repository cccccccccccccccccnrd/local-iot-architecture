#!/bin/bash
ident=local-iot-architecture
docker stop $ident && docker rm $ident
docker run \
  -d \
  --name $ident \
  -p 3000:3000 \
  -p 3001:3001 \
  --hostname $ident \
  $ident:latest
