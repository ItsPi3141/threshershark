FROM node:22-slim

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    xvfb \
    git python3 gcc g++ make \
    fonts-quicksand \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -fv

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./ /opt/app

RUN npm install
CMD ["npm", "run", "prod"]