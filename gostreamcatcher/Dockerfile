FROM amazonlinux:latest

RUN yum update -y
RUN yum install -y golang
RUN yum install -y gcc
RUN yum install -y wget
RUN yum install -y tar
RUN yum install -y wget
RUN yum install -y python3-pip
RUN pip3 install yt-dlp

WORKDIR /APP

ADD ffmpeg-master-latest-linuxarm64-gpl /APP
RUN cp bin/ffmpeg /bin/ffmpeg
RUN cp bin/ffprobe /bin/ffprobe

COPY . .

RUN go mod download
RUN go mod verify
RUN go build -o mathapp

ENV DISPLAY=:99

CMD ["./mathapp"]
