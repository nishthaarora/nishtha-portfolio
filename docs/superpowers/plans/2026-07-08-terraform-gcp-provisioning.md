# Terraform GCP Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provision a free-tier Google Cloud `e2-micro` VM with networking and a
locked-down firewall, using Terraform — replacing the Oracle Cloud plan, which was
blocked by persistent ARM capacity shortages (see design spec's provider note,
2026-07-08).

**Architecture:** A `terraform/` directory (same directory as the abandoned Oracle
attempt, files replaced) defines a GCP VPC, subnet, and firewall rules, plus a single
`e2-micro` "Always Free" Compute Engine instance. State is local. No retry-wrapper
script is needed here — GCP's free-tier `e2-micro` capacity has not historically shown
the same scarcity as Oracle's ARM shape, so a plain `terraform apply` is sufficient.

**Tech Stack:** Terraform >= 1.5, Google Cloud Terraform provider (`hashicorp/google`
~> 5.0), Google Cloud Free Tier, `gcloud` CLI (setup + verification only).

## Global Constraints

- Zero ongoing cost: only GCP "Always Free" resources are used — `e2-micro` shape,
  30GB standard persistent disk, in a free-tier-eligible region only (`us-west1`,
  `us-central1`, or `us-east1`).
- Firewall: only ports 22, 80, 443 are open. Port 22 restricted to the operator's own
  IP. Ports 80/443 restricted to Cloudflare's published IPv4 ranges.
- No remote Terraform state or locking — local state is acceptable for this
  single-VM personal project.
- The SSH keypair and admin IP from the original Task 1 (Oracle) setup are reused
  unchanged — those are cloud-agnostic.

---

## File Structure

```
nishtha-portfolio/
└── terraform/
    ├── PREREQUISITES.md        # GCP project/API/service-account setup (replaces Oracle version)
    ├── versions.tf             # Terraform + provider version constraints
    ├── provider.tf             # Google provider configuration
    ├── variables.tf            # All input variables
    ├── network.tf              # VPC, subnet, firewall rules
    ├── compute.tf              # The e2-micro instance
    ├── outputs.tf              # instance_public_ip output
    ├── terraform.tfvars.example
    └── .gitignore              # Ignores tfvars, state, .terraform/, service account key
```

The old Oracle-specific `compute.tf` and `network.tf` content is fully replaced (not
appended). `retry-apply.sh` is removed — it was Oracle-capacity-specific and provides
no value against GCP.

---

### Task 1: GCP Project, API, and Credentials Setup

**Files:**
- Modify: `terraform/PREREQUISITES.md` (replace Oracle content with GCP steps)
- Modify: `terraform/.gitignore` (add GCP service account key pattern)

**Interfaces:**
- Produces: an authenticated `gcloud` CLI session and a service account JSON key file
  (outside the repo) that Task 2's Google provider will reference via
  `var.credentials_file`.

- [ ] **Step 1: Create a GCP account and project**

Go to https://console.cloud.google.com/ (sign in with a Google account — free tier
requires a credit card for verification, same as Oracle, but won't be charged as long
as you stay within Always Free limits). Create a new project, e.g. `nishtha-portfolio`.
Note the **Project ID** (not the display name — the unique ID shown under it, e.g.
`nishtha-portfolio-123456`).

- [ ] **Step 2: Install the gcloud CLI**

```bash
brew install --cask google-cloud-sdk
gcloud init
```

Follow the prompts to log in and select the project you just created.

- [ ] **Step 3: Enable the Compute Engine API**

```bash
gcloud services enable compute.googleapis.com --project=<your-project-id>
```

- [ ] **Step 4: Create a service account for Terraform**

```bash
gcloud iam service-accounts create terraform-portfolio \
  --display-name="Terraform Portfolio Deployer" \
  --project=<your-project-id>
```

- [ ] **Step 5: Grant it the Compute Admin role**

```bash
gcloud projects add-iam-policy-binding <your-project-id> \
  --member="serviceAccount:terraform-portfolio@<your-project-id>.iam.gserviceaccount.com" \
  --role="roles/compute.admin"
```

- [ ] **Step 6: Generate and download a key for the service account**

```bash
mkdir -p ~/.gcp
gcloud iam service-accounts keys create ~/.gcp/terraform-portfolio-key.json \
  --iam-account=terraform-portfolio@<your-project-id>.iam.gserviceaccount.com
chmod 600 ~/.gcp/terraform-portfolio-key.json
```

This JSON key is a credential, equivalent in sensitivity to the Oracle API private key
— it stays in `~/.gcp/`, never in the repo, and (per the earlier machine-separation
decision) only ever generated on your personal laptop.

- [ ] **Step 7: Verify credentials work**

```bash
gcloud auth activate-service-account --key-file=~/.gcp/terraform-portfolio-key.json
gcloud compute instances list --project=<your-project-id>
```

Expected: an empty list (`Listed 0 items.`) rather than an authentication error — this
confirms the service account can talk to the Compute Engine API.

- [ ] **Step 8: You already have an SSH keypair and admin IP from the Oracle setup**

Reuse `~/.ssh/oci_portfolio_vm{,.pub}` (rename mentally to "portfolio VM key" — no
need to regenerate) and the admin IP you found via `curl -s ifconfig.me`. If your IP
has changed since then, re-run that command and use the new value in Task 3.

- [ ] **Step 9: Rewrite PREREQUISITES.md for GCP**

Replace the contents of `terraform/PREREQUISITES.md` with:

```markdown
# Terraform Prerequisites (Google Cloud)

One-time manual setup completed before any `terraform apply`:

1. GCP account and project created; Project ID noted.
2. `gcloud` CLI installed and initialized (`gcloud init`).
3. Compute Engine API enabled for the project.
4. Service account `terraform-portfolio` created with `roles/compute.admin`.
5. Service account key downloaded to `~/.gcp/terraform-portfolio-key.json`
   (generate a separate key per machine you use — do not copy this file between
   machines; revoke and regenerate per-machine if ever needed).
6. Verified with `gcloud compute instances list`.
7. SSH keypair at `~/.ssh/oci_portfolio_vm{,.pub}` (reused from the original Oracle
   setup) and operator's public IP (`curl -s ifconfig.me`) for the firewall rule.

All of the above (project ID, credentials file path, region, SSH public key path,
admin IP) go into `terraform/terraform.tfvars`, which is gitignored and never
committed. See `terraform.tfvars.example` for the format.
```

- [ ] **Step 10: Update .gitignore**

Add this line to `terraform/.gitignore`:

```
*.json
```

(This is broad on purpose — it ensures no service account key or other credential
JSON file is ever accidentally committed from the `terraform/` directory.)

- [ ] **Step 11: Commit**

```bash
git add terraform/PREREQUISITES.md terraform/.gitignore
git commit -m "Replace Oracle prerequisites with GCP setup steps"
```

---

### Task 2: Terraform Provider and Variable Scaffolding (GCP)

**Files:**
- Modify: `terraform/versions.tf`
- Modify: `terraform/provider.tf`
- Modify: `terraform/variables.tf` (replace Oracle-specific variables; keep
  `ssh_public_key_path`, `admin_ssh_cidr`, `cloudflare_ipv4_cidrs` as-is)
- Modify: `terraform/terraform.tfvars.example`

**Interfaces:**
- Produces: `var.project_id`, `var.region`, `var.zone`, `var.credentials_file`,
  `var.ssh_public_key_path`, `var.admin_ssh_cidr`, `var.cloudflare_ipv4_cidrs` —
  consumed by Tasks 3 and 4.

- [ ] **Step 1: Replace versions.tf**

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}
```

- [ ] **Step 2: Replace provider.tf**

```hcl
provider "google" {
  project     = var.project_id
  region      = var.region
  zone        = var.zone
  credentials = file(var.credentials_file)
}
```

- [ ] **Step 3: Replace the Oracle-specific variables in variables.tf**

Remove `tenancy_ocid`, `user_ocid`, `fingerprint`, `private_key_path`,
`compartment_ocid`. Replace with:

```hcl
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
```

Keep `ssh_public_key_path`, `admin_ssh_cidr`, and `cloudflare_ipv4_cidrs` unchanged
from the Oracle version — these are cloud-agnostic.

- [ ] **Step 4: Replace terraform.tfvars.example**

```hcl
project_id           = "nishtha-portfolio-123456"
region               = "us-central1"
zone                 = "us-central1-a"
credentials_file     = "~/.gcp/terraform-portfolio-key.json"
ssh_public_key_path  = "~/.ssh/oci_portfolio_vm.pub"
admin_ssh_cidr       = "203.0.113.5/32"
```

- [ ] **Step 5: Update your real terraform.tfvars**

```bash
cd terraform
```

Edit `terraform.tfvars` (already exists from the Oracle attempt) — remove the Oracle
keys, add `project_id`, `region`, `zone`, `credentials_file` with your real values.
Keep your existing `ssh_public_key_path` and `admin_ssh_cidr` lines as-is.

- [ ] **Step 6: Re-initialize Terraform (provider changed) and validate**

```bash
rm -rf .terraform .terraform.lock.hcl
terraform init
terraform validate
```

Expected: `terraform init` reports success downloading the `hashicorp/google`
provider, and `terraform validate` reports "Success! The configuration is valid."

- [ ] **Step 7: Commit**

```bash
cd nishtha-portfolio
git add terraform/versions.tf terraform/provider.tf terraform/variables.tf terraform/terraform.tfvars.example
git commit -m "Switch Terraform provider scaffolding from Oracle to GCP"
```

---

### Task 3: Networking — VPC, Subnet, Firewall Rules (GCP)

**Files:**
- Replace: `terraform/network.tf`

**Interfaces:**
- Consumes: `var.project_id`, `var.region`, `var.admin_ssh_cidr`,
  `var.cloudflare_ipv4_cidrs` from Task 2.
- Produces: `google_compute_subnetwork.portfolio_subnet.id` and
  `google_compute_network.portfolio_vpc.name` — consumed by Task 4.

- [ ] **Step 1: Replace network.tf entirely**

```hcl
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

resource "google_compute_firewall" "allow_http_https_from_cloudflare" {
  name    = "allow-http-https-from-cloudflare"
  network = google_compute_network.portfolio_vpc.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = var.cloudflare_ipv4_cidrs
  target_tags   = ["portfolio-vm"]
}
```

**What changed conceptually from Oracle:** GCP splits firewall rules per-purpose
(`google_compute_firewall` resources) rather than one combined security list, and
rules apply via `target_tags` — a label you'll attach to the VM in Task 4 — rather
than being attached directly to a subnet. Same effective restriction: SSH only from
your IP, web ports only from Cloudflare.

- [ ] **Step 2: Plan and apply**

```bash
cd terraform
terraform plan
terraform apply
```

Type `yes` when prompted. Expected: `Apply complete! Resources: 4 added, 0 changed,
0 destroyed.`

- [ ] **Step 3: Verify via gcloud CLI**

```bash
gcloud compute networks list --project=<your-project-id>
```

Expected: `portfolio-vpc` listed.

- [ ] **Step 4: Commit**

```bash
cd nishtha-portfolio
git add terraform/network.tf
git commit -m "Add GCP VPC, subnet, and Cloudflare-restricted firewall rules"
```

---

### Task 4: Compute Instance (Always Free e2-micro)

**Files:**
- Replace: `terraform/compute.tf`
- Modify: `terraform/outputs.tf` (reference changes from OCI to GCP resource)

**Interfaces:**
- Consumes: `google_compute_network.portfolio_vpc.name`,
  `google_compute_subnetwork.portfolio_subnet.id` from Task 3;
  `var.ssh_public_key_path`, `var.zone` from Task 2.
- Produces: `output.instance_public_ip`.

- [ ] **Step 1: Replace compute.tf entirely**

```hcl
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
    access_config {} # ephemeral public IP
  }

  metadata = {
    ssh-keys = "ubuntu:${file(var.ssh_public_key_path)}"
  }
}
```

**What each piece does:**
- `machine_type = "e2-micro"` — GCP's Always Free shape (1 shared vCPU, 1GB RAM;
  smaller than Oracle's ARM offering, but reliably provisionable).
- `boot_disk` — 30GB standard persistent disk, within the Always Free 30GB limit.
- `access_config {}` (empty block) — this is what actually grants a public IP; a VM
  without it stays private-only.
- `metadata.ssh-keys` — GCP's equivalent of Oracle's `ssh_authorized_keys`; format is
  `"<username>:<public-key-content>"`.

- [ ] **Step 2: Replace outputs.tf**

```hcl
output "instance_public_ip" {
  description = "Public IP of the portfolio VM"
  value       = google_compute_instance.portfolio_vm.network_interface[0].access_config[0].nat_ip
}
```

- [ ] **Step 3: Plan and apply**

```bash
cd terraform
terraform plan
terraform apply
```

Type `yes` when prompted. Expected: `Apply complete! Resources: 1 added, 0 changed,
0 destroyed.` followed by `instance_public_ip = "<some IP>"`.

- [ ] **Step 4: Verify SSH access**

```bash
ssh -i ~/.ssh/oci_portfolio_vm -o StrictHostKeyChecking=accept-new ubuntu@$(terraform output -raw instance_public_ip) echo connected
```

Expected output: `connected`

- [ ] **Step 5: Commit**

```bash
cd nishtha-portfolio
git add terraform/compute.tf terraform/outputs.tf
git commit -m "Add GCP Always Free e2-micro compute instance"
```

---

## Definition of Done

- `terraform apply` provisions a GCP VPC, subnet, firewall rules, and a running
  Ubuntu VM with no manual console steps beyond the one-time account setup in Task 1.
- `ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<instance_public_ip>` succeeds.
- Only ports 22 (operator IP only), 80, and 443 (Cloudflare ranges only) are reachable
  from the internet.
- No secrets (`terraform.tfvars`, `*.tfstate`, the GCP service account key) are
  committed to git.
