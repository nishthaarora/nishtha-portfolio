# Domain and TLS via DuckDNS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get the site reachable over a real domain name with real HTTPS
(`https://nishtha.duckdns.org`), replacing the Cloudflare-based design (which required
a paid domain) with a free DuckDNS subdomain pointed directly at the VM.

**Architecture:** Terraform reserves a static external IP for the VM (so the DuckDNS
record never goes stale after a restart) and widens the firewall to allow 80/443 from
anywhere (no Cloudflare edge to restrict to anymore). DuckDNS provides a free
`nishtha.duckdns.org` A record pointed at that static IP, kept in sync by a cron job
on the VM. Certbot obtains a real Let's Encrypt certificate directly against that
domain and configures Nginx for HTTPS.

**Tech Stack:** DuckDNS (free), Certbot (already installed), a small cron job using
`curl` to DuckDNS's update API.

## Global Constraints

- No Cloudflare — this phase's whole point is replacing that dependency.
- Zero additional cost: DuckDNS is free; a GCP static IP is free as long as it stays
  attached to a running instance (it only costs money if reserved but unattached).
- Certbot must auto-renew without manual intervention (it installs a systemd timer by
  default — verify this, don't just assume it).
- The firewall change (80/443 open to 0.0.0.0/0) is a deliberate, documented
  trade-off, not an oversight — Nginx/TLS, ufw, and fail2ban are the real protection
  layers now.

---

### Task 1: Reserve a Static IP and Widen the Firewall

**Files:**
- Modify: `terraform/compute.tf` (use a reserved static IP instead of ephemeral)
- Modify: `terraform/network.tf` (widen 80/443 source ranges)
- Modify: `terraform/variables.tf` (remove `cloudflare_ipv4_cidrs`, no longer needed)

**Interfaces:**
- Produces: a static IP that survives VM restarts, referenced by the same
  `instance_public_ip` output later tasks and the DuckDNS record depend on.

- [ ] **Step 1: Add a static IP resource to compute.tf**

Add this near the top of `terraform/compute.tf`:

```hcl
resource "google_compute_address" "portfolio_static_ip" {
  name   = "portfolio-static-ip"
  region = var.region
}
```

- [ ] **Step 2: Reference it in the instance's network_interface**

In `terraform/compute.tf`, change the `access_config {}` block (currently empty,
meaning "assign an ephemeral IP") to:

```hcl
      access_config {
        nat_ip = google_compute_address.portfolio_static_ip.address
      }
```

- [ ] **Step 3: Widen the firewall rule in network.tf**

Replace the `allow_http_https_from_cloudflare` resource in `terraform/network.tf`
with:

```hcl
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
```

- [ ] **Step 4: Remove the now-unused cloudflare_ipv4_cidrs variable**

Delete the `variable "cloudflare_ipv4_cidrs" { ... }` block entirely from
`terraform/variables.tf`.

- [ ] **Step 5: Apply**

```bash
cd terraform
terraform plan
terraform apply
```

Type `yes` when prompted. Expect the static IP to be created, the instance's network
interface updated in-place, and the firewall rule replaced (destroy + create, since
the name changed from `allow-http-https-from-cloudflare` to `allow-http-https`).

**Important:** if the instance's IP changes as part of this apply (it might, since
we're changing from ephemeral to a newly-created static IP), note the new IP —
everything from here on (SSH commands, DuckDNS) uses the **new** IP.

```bash
terraform output -raw instance_public_ip
```

- [ ] **Step 6: Verify SSH still works with the (possibly new) IP**

```bash
ssh -i ~/.ssh/oci_portfolio_vm -o StrictHostKeyChecking=accept-new ubuntu@<new-ip> echo still connected
```

- [ ] **Step 7: Commit**

```bash
cd nishtha-portfolio
git add terraform/compute.tf terraform/network.tf terraform/variables.tf
git commit -m "Reserve static IP, widen firewall to public (replacing Cloudflare-restricted rule)"
```

---

### Task 2: DuckDNS Account and Domain

**Files:** none (external account setup only)

**Interfaces:**
- Produces: a DuckDNS domain (`nishtha.duckdns.org`) and a personal token, used by
  Task 3's cron job.

- [ ] **Step 1: Create a DuckDNS account**

Go to https://www.duckdns.org and sign in (via GitHub, Google, Reddit, or Twitter —
no separate password to manage).

- [ ] **Step 2: Create your subdomain**

On the DuckDNS dashboard, enter a subdomain name (e.g. `nishtha`) and click **add
domain**. This gives you `nishtha.duckdns.org`.

- [ ] **Step 3: Point it at your VM's current IP**

In the "current ip" field next to your new subdomain, enter your VM's static IP (from
Task 1's output) and click **update ip**.

- [ ] **Step 4: Note your DuckDNS token**

At the top of the dashboard, there's a **token** (a UUID) — this authenticates API
calls to update your domain's IP. You'll use it in Task 3's cron job. Treat it as a
secret (don't commit it) — anyone with it could repoint your subdomain elsewhere.

- [ ] **Step 5: Verify it resolves**

```bash
dig +short nishtha.duckdns.org
```

Expected: your VM's static IP printed back.

---

### Task 3: Keep DuckDNS Updated via Cron

**Files:**
- Create: `ansible/tasks/duckdns.yml`
- Modify: `ansible/playbook.yml`

**Interfaces:**
- Consumes: your DuckDNS domain and token from Task 2 (passed as Ansible variables,
  not hardcoded).

- [ ] **Step 1: Write ansible/tasks/duckdns.yml**

```yaml
- name: Create duckdns directory
  file:
    path: /opt/duckdns
    state: directory
    mode: "0755"

- name: Write the DuckDNS update script
  copy:
    dest: /opt/duckdns/duck.sh
    mode: "0700"
    content: |
      #!/usr/bin/env bash
      curl -s "https://www.duckdns.org/update?domains={{ duckdns_subdomain }}&token={{ duckdns_token }}&ip=" > /opt/duckdns/duck.log 2>&1

- name: Schedule the DuckDNS update via cron every 5 minutes
  cron:
    name: "Update DuckDNS IP"
    minute: "*/5"
    job: "/opt/duckdns/duck.sh"
```

**What this does:** DuckDNS's update API accepts an empty `ip=` parameter to mean
"auto-detect the caller's IP" — so this script, run every 5 minutes from the VM
itself, keeps `nishtha.duckdns.org` pointed at wherever the VM actually is. Since
we're using a static IP (Task 1), this is mostly a safety net rather than something
that'll change often — but it costs nothing to have and protects against the rare
case of the static IP reservation itself changing.

- [ ] **Step 2: Add duckdns variables and the task to playbook.yml**

```yaml
- name: Configure portfolio VM
  hosts: portfolio
  become: true

  vars:
    duckdns_subdomain: "nishtha"
    duckdns_token: "{{ lookup('env', 'DUCKDNS_TOKEN') }}"

  tasks:
    - name: Install Docker
      import_tasks: tasks/docker.yml

    - name: Install Nginx
      import_tasks: tasks/nginx.yml

    - name: Install Certbot
      import_tasks: tasks/certbot.yml

    - name: Configure DuckDNS auto-update
      import_tasks: tasks/duckdns.yml

    - name: Apply security hardening
      import_tasks: tasks/hardening.yml
```

Reading the token from an environment variable (`DUCKDNS_TOKEN`) rather than hardcoding
it means it's never written into a committed file.

- [ ] **Step 3: Run the playbook with the token set**

```bash
cd ansible
DUCKDNS_TOKEN=<your-duckdns-token> ansible-playbook playbook.yml
```

- [ ] **Step 4: Verify the update actually worked**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "cat /opt/duckdns/duck.log"
```

Expected: `OK` (DuckDNS's API response on success).

- [ ] **Step 5: Commit**

```bash
cd nishtha-portfolio
git add ansible/tasks/duckdns.yml ansible/playbook.yml
git commit -m "Auto-update DuckDNS IP via cron on the VM"
```

---

### Task 4: Real TLS Certificate via Certbot

**Files:** none (this is a one-time command run on the VM, not a file change — Certbot
directly edits Nginx's config itself)

**Interfaces:**
- Produces: a working `https://nishtha.duckdns.org`, with Nginx configured by Certbot
  to redirect HTTP → HTTPS automatically.

- [ ] **Step 1: Run Certbot against the real domain**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "sudo certbot --nginx -d nishtha.duckdns.org --non-interactive --agree-tos -m your-email@example.com --redirect"
```

**What this does:** Certbot performs an HTTP-01 challenge (briefly serving a specific
file at `http://nishtha.duckdns.org/.well-known/acme-challenge/...` that Let's
Encrypt's servers fetch to confirm you control the domain), then obtains a real
certificate, edits the Nginx config it already manages (from the Ansible-configured
`/etc/nginx/sites-available/portfolio`) to add the `443 ssl` block referencing the new
certificate, and (via `--redirect`) adds a redirect from plain HTTP to HTTPS.

- [ ] **Step 2: Verify HTTPS works**

```bash
curl -I https://nishtha.duckdns.org
```

Expected: `HTTP/2 200` (or a `307` redirect to `/resume`, same as before — just now
over a real `https://` URL with a trusted certificate, not an IP address).

- [ ] **Step 3: Verify plain HTTP redirects to HTTPS**

```bash
curl -I http://nishtha.duckdns.org
```

Expected: a `301` redirect with a `Location: https://nishtha.duckdns.org/` header.

- [ ] **Step 4: Verify auto-renewal is actually configured**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "sudo systemctl list-timers | grep certbot"
```

Expected: a `certbot.timer` entry — Certbot installs this automatically on Ubuntu, but
confirming it exists (rather than assuming) is the whole point of this step.

- [ ] **Step 5: Dry-run the renewal to make sure it would actually succeed**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "sudo certbot renew --dry-run"
```

Expected: output ending in "Congratulations, all simulated renewals succeeded."

---

## Definition of Done

- `https://nishtha.duckdns.org` serves the real app with a valid, trusted TLS
  certificate (no browser warning).
- Plain `http://` requests redirect to `https://`.
- The DuckDNS record stays correct via cron, independent of manual intervention.
- Certificate auto-renewal is confirmed working via a dry run, not assumed.
- The firewall's widening to public 80/443 is documented in the spec as a deliberate
  trade-off from dropping Cloudflare, not a regression nobody decided on.
