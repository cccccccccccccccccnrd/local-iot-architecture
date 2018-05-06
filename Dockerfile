FROM node:latest as builder

ADD ./ .

RUN npm install

EXPOSE 3000
EXPOSE 3001

CMD node index