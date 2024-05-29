FROM 22.2.0-alpine3.19
RUN apk add xvfb
RUN apk add chromium
RUN npm install
CMD ["npm", "start"]