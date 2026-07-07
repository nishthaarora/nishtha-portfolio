variable "tenancy_ocid" {
  description = "OCI tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI user OCID"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the uploaded API signing key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the OCI API private key (PEM)"
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "region" {
  description = "OCI region (e.g. us-chicago-1)"
  type        = string
}

variable "compartment_ocid" {
  description = "OCI compartment OCID to create resources in"
  type        = string
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