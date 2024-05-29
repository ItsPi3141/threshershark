FROM node:22.2.0-alpine3.19
RUN apk add make gcc g++ git python3 xvfb chromium

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./ /opt/app

RUN npm install
CMD ["npm", "run", "prod"]