packer {
  required_plugins {
    hcloud = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/hcloud"
    }
  }

  builders {
    type = "hcloud"
    token = "YOUR API KEY"
    image = "ubuntu-22.04"
    location = "nbg1"
    server_type = "cx11"
    ssh_username = "root"
  }
}
