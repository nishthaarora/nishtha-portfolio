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