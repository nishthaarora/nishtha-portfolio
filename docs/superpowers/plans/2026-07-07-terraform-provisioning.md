# Terraform Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provision a free-tier Oracle Cloud ARM VM with networking and a locked-down
firewall, using Terraform, so later phases (Ansible, CI/CD) have a reachable box to
configure and deploy to.

**Architecture:** A `terraform/` directory in the repo defines an Oracle Cloud VCN,
subnet, internet gateway, route table, and security list (firewall), plus a single
`VM.Standard.A1.Flex` "Always Free" ARM compute instance inside that subnet. State is
local (no remote backend — single-VM personal project). A wrapper script retries
`terraform apply` on Oracle's transient "out of host capacity" errors.

**Tech Stack:** Terraform >= 1.5, OCI Terraform provider (`oracle/oci` ~> 5.0), Oracle
Cloud Infrastructure Free Tier, OCI CLI (for verification only, not required by
Terraform itself), bash (retry wrapper).

## Global Constraints

- Zero ongoing cost: only Oracle "Always Free" resources are used (VM.Standard.A1.Flex,
  block storage within free limits, VCN/networking are free).
- Firewall: only ports 22, 80, 443 are open. Port 22 is restricted to the operator's own
  IP. Ports 80/443 are restricted to Cloudflare's published IPv4 ranges (per the design
  spec's Cloudflare-in-front-of-VM architecture).
- No remote Terraform state or locking — local state file is acceptable for this
  single-VM personal project (per spec Non-Goals).
- Oracle free-tier ARM capacity is often unavailable in popular regions; provisioning
  must be retried with backoff rather than failing outright on the first attempt.

---

## File Structure

```
nishtha-portfolio/
└── terraform/
    ├── PREREQUISITES.md        # OCI account/API-key/SSH-key setup steps (manual, one-time)
    ├── versions.tf             # Terraform + provider version constraints
    ├── provider.tf             # OCI provider configuration
    ├── variables.tf            # All input variables
    ├── network.tf              # VCN, subnet, internet gateway, route table, security list
    ├── compute.tf              # The ARM compute instance
    ├── outputs.tf              # instance_public_ip output
    ├── terraform.tfvars.example
    ├── retry-apply.sh          # Wrapper: retries `terraform apply` on capacity errors
    └── .gitignore              # Ignores tfvars, state, .terraform/
```

---

### Task 1: Oracle Cloud Account, API Key, and SSH Key Setup

**Files:**
- Create: `terraform/PREREQUISITES.md`
- Create: `terraform/.gitignore`

**Interfaces:**
- Produces: a working `~/.oci/config` file (outside the repo) that Task 2's OCI
  provider will reference via `var.private_key_path`; an SSH keypair at
  `~/.ssh/oci_portfolio_vm{,.pub}` that Task 4's compute instance will use for
  `ssh_authorized_keys`.

This task has no application code — it documents and performs the one-time account
setup that every later Terraform task depends on. Nothing here is committed to the
repo except the documentation and gitignore.

- [ ] **Step 1: Sign up for Oracle Cloud Free Tier**

Go to https://www.oracle.com/cloud/free/ and create an account. Oracle requires a
credit card for identity verification even for free-tier usage — it will not be
charged as long as you stay within Always Free limits. Choose a home region close to
you; note it, you'll need it in `terraform.tfvars` later (e.g. `us-ashburn-1`).

- [ ] **Step 2: Note your Tenancy OCID**

In the OCI Console: click your profile icon (top right) → **Tenancy: <name>**. Copy
the **OCID** shown (starts with `ocid1.tenancy.oc1..`). You'll need this for
`tenancy_ocid` in `terraform.tfvars`.

- [ ] **Step 3: Note your User OCID**

In the OCI Console: profile icon → **User Settings**. Copy the **OCID** shown (starts
with `ocid1.user.oc1..`). You'll need this for `user_ocid` in `terraform.tfvars`.

- [ ] **Step 4: Note your (root) Compartment OCID**

In the OCI Console: **User Settings** page shows a "Tenancy" breadcrumb, or go to
**Identity & Security → Compartments** — the root compartment's OCID is the same as
your Tenancy OCID from Step 2. You'll use this for `compartment_ocid`.

- [ ] **Step 5: Generate an API signing keypair**

```bash
mkdir -p ~/.oci
openssl genrsa -out ~/.oci/oci_api_key.pem 2048
chmod 600 ~/.oci/oci_api_key.pem
openssl rsa -pubout -in ~/.oci/oci_api_key.pem -out ~/.oci/oci_api_key_public.pem
```

- [ ] **Step 6: Upload the public API key to OCI and get the fingerprint**

In the OCI Console: profile icon → **User Settings** → **API Keys** → **Add API Key**
→ **Paste Public Key** → paste the contents of `~/.oci/oci_api_key_public.pem` →
**Add**. OCI displays a **Fingerprint** (format `xx:xx:xx:...`) — copy it, you'll need
it for `fingerprint` in `terraform.tfvars`.

- [ ] **Step 7: Install the OCI CLI and verify access**

```bash
brew install oci-cli
oci setup config
```

When prompted, use the same values from Steps 2–6 (tenancy OCID, user OCID, region,
and point it at `~/.oci/oci_api_key.pem`). Then verify:

```bash
oci iam region list --config-file ~/.oci/config
```

Expected: a JSON array of Oracle Cloud regions is printed (confirms your credentials
work).

- [ ] **Step 8: Generate a dedicated SSH keypair for the VM**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oci_portfolio_vm -N ""
```

This creates `~/.ssh/oci_portfolio_vm` (private) and `~/.ssh/oci_portfolio_vm.pub`
(public). Terraform will inject the public key into the VM in Task 4.

- [ ] **Step 9: Find your own public IP (for the SSH firewall rule)**

```bash
curl -s ifconfig.me
```

Note this IP — you'll use it as `admin_ssh_cidr` (as `<your-ip>/32`) in
`terraform.tfvars` in Task 3, so only your machine can SSH into the VM.

- [ ] **Step 10: Write the prerequisites doc and gitignore**

Create `terraform/PREREQUISITES.md`:

```markdown
# Terraform Prerequisites

One-time manual setup completed before any `terraform apply`:

1. Oracle Cloud Free Tier account created.
2. Tenancy OCID, User OCID, and root Compartment OCID noted from the OCI Console.
3. API signing keypair generated at `~/.oci/oci_api_key.pem` /
   `~/.oci/oci_api_key_public.pem`, public key uploaded to OCI, fingerprint noted.
4. OCI CLI installed and verified with `oci iam region list`.
5. Dedicated SSH keypair generated at `~/.ssh/oci_portfolio_vm{,.pub}` for VM access.
6. Operator's public IP noted (via `curl -s ifconfig.me`) for the SSH firewall rule.

All of the above values (tenancy OCID, user OCID, compartment OCID, fingerprint,
region, SSH public key path, admin IP) go into `terraform/terraform.tfvars`, which is
gitignored and never committed. See `terraform.tfvars.example` for the format.
```

Create `terraform/.gitignore`:

```
terraform.tfvars
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl
```

- [ ] **Step 11: Commit**

```bash
cd nishtha-portfolio
git add terraform/PREREQUISITES.md terraform/.gitignore
git commit -m "Add Terraform prerequisites doc and gitignore"
```

---

### Task 2: Terraform Provider and Variable Scaffolding

**Files:**
- Create: `terraform/versions.tf`
- Create: `terraform/provider.tf`
- Create: `terraform/variables.tf`
- Create: `terraform/terraform.tfvars.example`

**Interfaces:**
- Consumes: the `~/.oci/config` values and SSH key path from Task 1.
- Produces: `var.tenancy_ocid`, `var.user_ocid`, `var.fingerprint`,
  `var.private_key_path`, `var.region`, `var.compartment_ocid`,
  `var.ssh_public_key_path`, `var.admin_ssh_cidr` — consumed by Tasks 3 and 4.

- [ ] **Step 1: Write versions.tf**

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}
```

- [ ] **Step 2: Write provider.tf**

```hcl
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}
```

- [ ] **Step 3: Write variables.tf**

```hcl
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
  description = "OCI region (e.g. us-ashburn-1)"
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
```

- [ ] **Step 4: Write terraform.tfvars.example**

```hcl
tenancy_ocid         = "ocid1.tenancy.oc1..REPLACE_ME"
user_ocid            = "ocid1.user.oc1..REPLACE_ME"
fingerprint          = "xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx"
private_key_path     = "~/.oci/oci_api_key.pem"
region               = "us-ashburn-1"
compartment_ocid     = "ocid1.tenancy.oc1..REPLACE_ME"
ssh_public_key_path  = "~/.ssh/oci_portfolio_vm.pub"
admin_ssh_cidr       = "203.0.113.5/32"
```

- [ ] **Step 5: Copy the example to a real tfvars file and fill in your values**

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with the real values you collected in Task 1 (this file is
gitignored and will not be committed).

- [ ] **Step 6: Initialize Terraform and validate**

```bash
terraform init
terraform validate
```

Expected: `terraform init` reports "Terraform has been successfully initialized!" and
`terraform validate` reports "Success! The configuration is valid."

- [ ] **Step 7: Commit**

```bash
cd nishtha-portfolio
git add terraform/versions.tf terraform/provider.tf terraform/variables.tf terraform/terraform.tfvars.example
git commit -m "Add Terraform provider and variable scaffolding"
```

---

### Task 3: Networking — VCN, Subnet, Internet Gateway, Security List

**Files:**
- Create: `terraform/network.tf`
- Modify: `terraform/variables.tf` (add `cloudflare_ipv4_cidrs`)

**Interfaces:**
- Consumes: `var.compartment_ocid`, `var.admin_ssh_cidr` from Task 2.
- Produces: `oci_core_subnet.portfolio_subnet.id` — consumed by Task 4's compute
  instance.

- [ ] **Step 1: Add the Cloudflare CIDR variable to variables.tf**

Append to `terraform/variables.tf`:

```hcl
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
```

- [ ] **Step 2: Write network.tf**

```hcl
resource "oci_core_vcn" "portfolio_vcn" {
  compartment_id = var.compartment_ocid
  cidr_block     = "10.0.0.0/16"
  display_name   = "portfolio-vcn"
  dns_label      = "portfoliovcn"
}

resource "oci_core_internet_gateway" "portfolio_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "portfolio-igw"
  enabled        = true
}

resource "oci_core_route_table" "portfolio_route_table" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "portfolio-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.portfolio_igw.id
  }
}

resource "oci_core_security_list" "portfolio_security_list" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "portfolio-security-list"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    source   = var.admin_ssh_cidr
    protocol = "6" # TCP
    tcp_options {
      min = 22
      max = 22
    }
  }

  dynamic "ingress_security_rules" {
    for_each = var.cloudflare_ipv4_cidrs
    content {
      source   = ingress_security_rules.value
      protocol = "6"
      tcp_options {
        min = 80
        max = 80
      }
    }
  }

  dynamic "ingress_security_rules" {
    for_each = var.cloudflare_ipv4_cidrs
    content {
      source   = ingress_security_rules.value
      protocol = "6"
      tcp_options {
        min = 443
        max = 443
      }
    }
  }
}

resource "oci_core_subnet" "portfolio_subnet" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.portfolio_vcn.id
  cidr_block                 = "10.0.1.0/24"
  display_name               = "portfolio-subnet"
  dns_label                  = "portfoliosub"
  route_table_id             = oci_core_route_table.portfolio_route_table.id
  security_list_ids          = [oci_core_security_list.portfolio_security_list.id]
  prohibit_public_ip_on_vnic = false
}
```

- [ ] **Step 3: Plan and apply**

```bash
cd terraform
terraform plan
terraform apply
```

Type `yes` when prompted. Expected: apply completes with `Apply complete! Resources:
5 added, 0 changed, 0 destroyed.`

- [ ] **Step 4: Verify via OCI CLI**

```bash
oci network vcn list --compartment-id <your-compartment-ocid> --query "data[].{Name:\"display-name\",State:\"lifecycle-state\"}"
```

Expected: JSON output showing `portfolio-vcn` with state `AVAILABLE`.

- [ ] **Step 5: Commit**

```bash
cd nishtha-portfolio
git add terraform/network.tf terraform/variables.tf
git commit -m "Add VCN, subnet, and security list with Cloudflare-restricted firewall"
```

---

### Task 4: Compute Instance (Always Free ARM VM)

**Files:**
- Create: `terraform/compute.tf`
- Create: `terraform/outputs.tf`

**Interfaces:**
- Consumes: `oci_core_subnet.portfolio_subnet.id` from Task 3;
  `var.ssh_public_key_path`, `var.compartment_ocid` from Task 2.
- Produces: `output.instance_public_ip` — consumed by Task 5 (Ansible inventory) and
  later CI/CD deploy steps in subsequent phases.

- [ ] **Step 1: Write compute.tf**

```hcl
data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_instance" "portfolio_vm" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domain.ad.name
  display_name        = "portfolio-vm"
  shape                = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.portfolio_subnet.id
    assign_public_ip = true
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = 50
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
  }
}

data "oci_identity_availability_domain" "ad" {
  compartment_id = var.tenancy_ocid
  ad_number      = 1
}
```

- [ ] **Step 2: Write outputs.tf**

```hcl
output "instance_public_ip" {
  description = "Public IP of the portfolio VM"
  value       = oci_core_instance.portfolio_vm.public_ip
}
```

- [ ] **Step 3: Plan and apply**

```bash
cd terraform
terraform plan
terraform apply
```

Type `yes` when prompted. Expected: `Apply complete! Resources: 2 added, 0 changed,
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
git commit -m "Add Always Free ARM compute instance"
```

---

### Task 5: Capacity-Retry Wrapper Script

**Files:**
- Create: `terraform/retry-apply.sh`

**Interfaces:**
- Consumes: the `terraform/` directory configured by Tasks 2–4.
- Produces: an executable entry point (`./retry-apply.sh`) that later becomes the
  standard way to run `terraform apply` for this project (documented in the repo
  README in a later phase).

- [ ] **Step 1: Write retry-apply.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

MAX_ATTEMPTS=10
BASE_DELAY_SECONDS=30

cd "$(dirname "$0")"

attempt=1
while (( attempt <= MAX_ATTEMPTS )); do
  echo "Attempt ${attempt}/${MAX_ATTEMPTS}: running terraform apply..."

  if terraform apply -auto-approve -input=false 2>&1 | tee /tmp/tf-apply-output.log; then
    echo "terraform apply succeeded."
    exit 0
  fi

  if grep -qi "out of host capacity\|outofcapacity" /tmp/tf-apply-output.log; then
    delay=$(( BASE_DELAY_SECONDS * attempt ))
    echo "Oracle reported insufficient capacity. Retrying in ${delay}s..."
    sleep "${delay}"
    attempt=$(( attempt + 1 ))
    continue
  fi

  echo "terraform apply failed for a reason other than capacity. Not retrying."
  exit 1
done

echo "Exhausted ${MAX_ATTEMPTS} attempts due to capacity errors. Try a different region or availability domain."
exit 1
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x terraform/retry-apply.sh
```

- [ ] **Step 3: Run it against the already-provisioned infrastructure to verify the happy path**

```bash
cd terraform
./retry-apply.sh
```

Expected: since Tasks 3–4 already applied everything, this reports `Apply complete!
Resources: 0 added, 0 changed, 0 destroyed.` on the first attempt and exits 0. (The
capacity-retry branch itself can only be exercised for real when Oracle actually
returns a capacity error — this run only verifies the script's normal-path plumbing:
argument handling, logging, and exit code.)

- [ ] **Step 4: Commit**

```bash
cd nishtha-portfolio
git add terraform/retry-apply.sh
git commit -m "Add capacity-retry wrapper for terraform apply"
```

---

## Definition of Done

- `terraform apply` (or `./retry-apply.sh`) provisions a VCN, subnet, security list,
  and a running Ubuntu ARM VM with no manual console steps beyond the one-time account
  setup in Task 1.
- `ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<instance_public_ip>` succeeds.
- Only ports 22 (operator IP only), 80, and 443 (Cloudflare ranges only) are reachable
  from the internet.
- No secrets (`terraform.tfvars`, `*.tfstate`, OCI API keys) are committed to git.
