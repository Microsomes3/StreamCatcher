FROM arm64v8/ubuntu:latest

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

ADD helpers /APP/helpers

COPY package.json .
COPY index.js .


RUN npm install


CMD ["node", "index.js"]