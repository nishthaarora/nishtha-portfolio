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
