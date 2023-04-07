packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "griffinbuilder" {
    ami_name = "gostreambuilder-v3"
    source_ami = "ami-0c6c29c5125214c77"
    region = "us-east-1"
    instance_type = "t4g.micro"
    ssh_username = "ubuntu"
}

build {
  name    = "build-gostreambuilder"
  sources = [
    "source.amazon-ebs.griffinbuilder"
  ]  

   
    provisioner "file" {
        source = "code.zip"
        destination = "/home/ubuntu/code.zip"
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
     "cd /home/ubuntu && unzip code.zip",
     "cd /home/ubuntu && go build main.go"
  ]
}




}