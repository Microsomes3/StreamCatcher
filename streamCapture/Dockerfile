FROM ubuntu:latest

RUN apt-get update -y

RUN apt-get install curl -y

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get update -y

RUN apt-get install -y nodejs

RUN apt-get install build-essential -y

RUN apt-get update -y

RUN apt-get install ffmpeg -y

RUN apt-get install wget -y

RUN apt-get install -y python3-pip

RUN pip install yt-dlp

WORKDIR /APP

COPY package.json .
COPY index.js .

ADD helpers /APP/helpers


COPY logs.js .

RUN apt-get update && apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

RUN npm install


CMD ["node", "index.js"]