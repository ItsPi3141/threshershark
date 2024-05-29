FROM node:22.2.0-alpine3.19
RUN apk add xvfb
RUN apk add chromium

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./ /opt/app

RUN npm install
CMD ["npm", "start"]