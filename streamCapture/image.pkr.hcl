packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "griffinbuilder" {
    ami_name = "nodestreamcatcher-v1"
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
     "sudo apt-get install curl -y",
     "sudo apt-get install ffmpeg -y",
  ]
}




}