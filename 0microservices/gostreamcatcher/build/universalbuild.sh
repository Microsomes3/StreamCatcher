#!/bin/bash

sudo apt-get update

sudo useradd -m -s /bin/bash ubuntu
sudo chown -R ubuntu:ubuntu /home/ubuntu

sleep 10
sudo apt-get install -y python3-pip
sleep 10
sudo pip install yt-dlp
sudo apt-get install -y unzip
sudo apt-get install -y screen
sudo apt-get install -y golang
sudo apt-get install -y wget

sudo wget "https://scrapes69.s3.eu-west-1.amazonaws.com/gostreamcatcher/.env" -O /home/ubuntu/.env
sudo wget "https://scrapes69.s3.eu-west-1.amazonaws.com/gostreamcatcher/godwn" -O /home/ubuntu/godwn
sudo wget "https://scrapes69.s3.eu-west-1.amazonaws.com/gostreamcatcher/goapi.service" -O /home/ubuntu/goapi.service

sudo apt-get install ffmpeg -y
sudo chmod +x /home/ubuntu/godwn
sudo mv /home/ubuntu/goapi.service /etc/systemd/system/goapi.service
sudo systemctl daemon-reload
sudo systemctl enable goapi.service
sudo systemctl start goapi.service