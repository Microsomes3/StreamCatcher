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

WORKDIR /APP

COPY package.json .
COPY index.js .

RUN npm install


CMD ["node", "index.js"]