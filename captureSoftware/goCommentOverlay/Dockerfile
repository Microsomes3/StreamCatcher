FROM amazonlinux:latest

RUN yum update -y
# RUN yum install -y golang
RUN yum install -y gcc
RUN yum install -y wget
RUN yum install -y tar
RUN yum install -y wget
RUN yum install -y python3-pip
RUN pip3 install yt-dlp

WORKDIR /APP

ADD ffmpegb /APP
RUN cp ffmpeg /bin/ffmpeg
RUN cp ffprobe /bin/ffprobe

# COPY ytarchive /APP/

# COPY ytarchive /bin/ytarchive

COPY . .

# RUN go mod download
# RUN go mod verify
# RUN go build -o mathapp

COPY ./gocommentoverlay /APP/stgo

ENV DISPLAY=:99

CMD ["./gocommentoverlay"]
