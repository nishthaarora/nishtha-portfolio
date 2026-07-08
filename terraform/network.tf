resource "google_compute_network" "portfolio_vpc" {
  name                    = "portfolio-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "portfolio_subnet" {
  name          = "portfolio-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.portfolio_vpc.id
}

resource "google_compute_firewall" "allow_ssh_from_admin" {
  name    = "allow-ssh-from-admin"
  network = google_compute_network.portfolio_vpc.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = [var.admin_ssh_cidr]
  target_tags   = ["portfolio-vm"]
}

resource "google_compute_firewall" "allow_http_https" {
  name    = "allow-http-https"
  network = google_compute_network.portfolio_vpc.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["portfolio-vm"]
}
