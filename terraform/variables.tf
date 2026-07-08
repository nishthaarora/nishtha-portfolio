variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region (must be us-west1, us-central1, or us-east1 for free tier)"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone within the region"
  type        = string
  default     = "us-central1-a"
}

variable "credentials_file" {
  description = "Path to the GCP service account JSON key"
  type        = string
  default     = "~/.gcp/terraform-portfolio-key.json"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key injected into the VM"
  type        = string
  default     = "~/.ssh/oci_portfolio_vm.pub"
}

variable "admin_ssh_cidr" {
  description = "CIDR allowed to SSH into the VM (your IP, e.g. 203.0.113.5/32)"
  type        = string
}

variable "cloudflare_ipv4_cidrs" {
  description = "Cloudflare's published IPv4 ranges, allowed to reach 80/443. Verify periodically at https://www.cloudflare.com/ips-v4"
  type        = list(string)
  default = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ]
}