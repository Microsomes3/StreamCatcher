packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "griffinbuilder" {
    ami_name = "gostreambuilder-v21"
    source_ami = "ami-0c6c29c5125214c77"
    region = "us-east-1"
    instance_type = "t4g.micro"
    ssh_username = "ubuntu"
}


variable "R2AccessKey" {
}
variable "R2SecretKey" {
}


build {
  name    = "build-gostreambuilder"
  sources = [
    "source.amazon-ebs.griffinbuilder"
  ]  

   
    provisioner "file" {
        source = "bin/godwn"
        destination = "/home/ubuntu/godwn"
    }


     provisioner "file" {
        source = ".env"
        destination = "/home/ubuntu/.env"
    }

     provisioner "file" {
        source = "bin/goapi.service"
        destination = "/home/ubuntu/goapi.service"
    }

  provisioner "shell" {

 
  inline = [
  "sudo apt-get update",
    "sleep 10",
    "sudo apt-get install -y python3-pip",
    "sleep 10",
    "sudo pip install yt-dlp",
    "sudo apt-get install -y unzip",
    "sudo apt-get install -y screen",
    "sudo apt-get install -y golang",
    "sudo apt-get install ffmpeg -y",
    "sudo chmod +x /home/ubuntu/godwn",
    "sudo mv /home/ubuntu/goapi.service /etc/systemd/system/goapi.service",
    "sudo systemctl daemon-reload",
    "sudo systemctl enable goapi.service",
    "sudo systemctl start goapi.service",

    ]
}




}