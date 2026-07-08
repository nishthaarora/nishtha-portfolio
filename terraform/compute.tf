resource "google_compute_address" "portfolio_static_ip" {
  name   = "portfolio-static-ip"
  region = var.region
}

resource "google_compute_instance" "portfolio_vm" {
  name         = "portfolio-vm"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = ["portfolio-vm"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = google_compute_network.portfolio_vpc.name
    subnetwork = google_compute_subnetwork.portfolio_subnet.id
    access_config {
      nat_ip = google_compute_address.portfolio_static_ip.address
    }
  }

  metadata = {
    ssh-keys = "ubuntu:${file(var.ssh_public_key_path)}"
  }
}
