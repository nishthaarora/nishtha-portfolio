# Ansible VM Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the bare Ubuntu GCP VM (provisioned by Terraform) with everything
needed to run the portfolio app: Docker, Nginx, Certbot/TLS, and security hardening —
via an idempotent Ansible playbook, so the VM's state is reproducible and re-runnable
rather than a one-off manual SSH session.

**Architecture:** A single Ansible playbook (`ansible/playbook.yml`) targets the VM's
public IP (from Terraform's `instance_public_ip` output) over SSH, using roles-free,
task-based organization split across a few include files for readability. Ansible
connects as the `ubuntu` user with the same SSH key Terraform injected.

**Tech Stack:** Ansible (`ansible-core` via pipx/brew), target: Ubuntu 22.04 on GCP.

## Global Constraints

- Playbook must be idempotent — safe to re-run any time without unwanted side effects.
- Hardening is mandatory, not optional: SSH key-only auth, fail2ban, ufw (22/80/443
  only), unattended-upgrades — all four from the design spec.
- No secrets are hardcoded in the playbook — the GEMINI_API_KEY (needed later for the
  chatbox) will be handled via Ansible Vault in a later phase, not this one.
- Nginx and Certbot are installed and running, but the actual reverse-proxy config
  pointing at the app container is deferred until the app + Docker Compose file exist
  (next phase) — this phase proves the VM is *capable* of serving, not that the app is
  live yet.

---

## File Structure

```
nishtha-portfolio/
└── ansible/
    ├── inventory.ini          # Points at the VM's public IP
    ├── ansible.cfg            # Points inventory + disables host key prompt friction
    ├── playbook.yml           # Top-level playbook, includes the task files below
    └── tasks/
        ├── docker.yml         # Install Docker + Docker Compose plugin
        ├── nginx.yml          # Install Nginx, open firewall for it
        ├── certbot.yml        # Install Certbot (cert issuance deferred to a later phase — needs a real domain)
        └── hardening.yml      # SSH key-only, fail2ban, ufw, unattended-upgrades
```

---

### Task 1: Ansible Setup and Inventory

**Files:**
- Create: `ansible/inventory.ini`
- Create: `ansible/ansible.cfg`

**Interfaces:**
- Consumes: the VM's public IP (from `terraform output -raw instance_public_ip` in
  the Terraform phase) and `~/.ssh/oci_portfolio_vm` (the SSH private key).
- Produces: a working `ansible` connection to the VM, used by every later task.

- [ ] **Step 1: Install Ansible**

```bash
brew install ansible
ansible --version
```

Expected: version output, e.g. `ansible [core 2.16.x]`.

- [ ] **Step 2: Get the VM's IP**

```bash
cd terraform
terraform output -raw instance_public_ip
```

Note this IP — you'll use it in `inventory.ini`.

- [ ] **Step 3: Write ansible/inventory.ini**

```ini
[portfolio]
portfolio-vm ansible_host=34.9.96.61 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/oci_portfolio_vm
```

Replace `34.9.96.61` with your actual VM IP from Step 2. (This file has no secrets in
it — an IP address and a key *path*, not a key itself — so it's safe to commit.)

- [ ] **Step 4: Write ansible/ansible.cfg**

```ini
[defaults]
inventory = inventory.ini
host_key_checking = False
```

`host_key_checking = False` avoids an interactive yes/no prompt on first connection —
acceptable here since we already know this is our own freshly-provisioned VM (same
reasoning as `StrictHostKeyChecking=accept-new` used earlier with plain `ssh`).

- [ ] **Step 5: Verify connectivity**

```bash
cd ansible
ansible portfolio -m ping
```

Expected:
```
portfolio-vm | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

- [ ] **Step 6: Commit**

```bash
cd nishtha-portfolio
git add ansible/inventory.ini ansible/ansible.cfg
git commit -m "Add Ansible inventory and config for the portfolio VM"
```

---

### Task 2: Docker Installation

**Files:**
- Create: `ansible/tasks/docker.yml`
- Create: `ansible/playbook.yml`

**Interfaces:**
- Produces: a running Docker daemon and the `docker compose` plugin on the VM,
  consumed by every later phase (app deployment, CI/CD).

- [ ] **Step 1: Write ansible/tasks/docker.yml**

```yaml
- name: Install prerequisite packages
  apt:
    name:
      - ca-certificates
      - curl
      - gnupg
    state: present
    update_cache: true

- name: Create keyrings directory
  file:
    path: /etc/apt/keyrings
    state: directory
    mode: "0755"

- name: Add Docker's official GPG key
  apt_key:
    url: https://download.docker.com/linux/ubuntu/gpg
    keyring: /etc/apt/keyrings/docker.gpg
    state: present

- name: Add Docker apt repository
  apt_repository:
    repo: "deb [arch={{ ansible_architecture | regex_replace('x86_64', 'amd64') }} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
    state: present
    filename: docker

- name: Install Docker Engine and Compose plugin
  apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-compose-plugin
    state: present
    update_cache: true

- name: Add ubuntu user to docker group
  user:
    name: ubuntu
    groups: docker
    append: true

- name: Ensure Docker service is running and enabled
  systemd:
    name: docker
    state: started
    enabled: true
```

**What this does, step by step:** adds Docker's official apt repository (rather than
Ubuntu's often-outdated bundled version), installs Docker Engine plus the `docker
compose` plugin (the modern replacement for the standalone `docker-compose` binary),
adds the `ubuntu` user to the `docker` group (so you don't need `sudo` for every
`docker` command), and ensures the daemon starts on boot.

- [ ] **Step 2: Write the top-level ansible/playbook.yml**

```yaml
- name: Configure portfolio VM
  hosts: portfolio
  become: true

  tasks:
    - name: Install Docker
      import_tasks: tasks/docker.yml
```

- [ ] **Step 3: Run it**

```bash
cd ansible
ansible-playbook playbook.yml
```

Expected: a `PLAY RECAP` line showing `ok=... changed=... unreachable=0 failed=0`.

- [ ] **Step 4: Verify Docker actually works on the VM**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> docker run hello-world
```

Expected: output containing `Hello from Docker!`.

- [ ] **Step 5: Re-run the playbook to confirm idempotency**

```bash
ansible-playbook playbook.yml
```

Expected: same `PLAY RECAP`, but this time `changed=0` for the Docker tasks — proving
nothing gets needlessly redone on a second run.

- [ ] **Step 6: Commit**

```bash
cd nishtha-portfolio
git add ansible/tasks/docker.yml ansible/playbook.yml
git commit -m "Add Ansible Docker installation task"
```

---

### Task 3: Nginx and Certbot Installation

**Files:**
- Create: `ansible/tasks/nginx.yml`
- Create: `ansible/tasks/certbot.yml`
- Modify: `ansible/playbook.yml`

**Interfaces:**
- Produces: Nginx running on the VM (default page, not yet proxying to the app —
  that's wired up once the app container exists in a later phase); Certbot installed
  and ready (actual certificate issuance deferred until a real domain points at this
  VM, in the Cloudflare phase).

- [ ] **Step 1: Write ansible/tasks/nginx.yml**

```yaml
- name: Install Nginx
  apt:
    name: nginx
    state: present
    update_cache: true

- name: Ensure Nginx is running and enabled
  systemd:
    name: nginx
    state: started
    enabled: true
```

- [ ] **Step 2: Write ansible/tasks/certbot.yml**

```yaml
- name: Install Certbot and the Nginx plugin
  apt:
    name:
      - certbot
      - python3-certbot-nginx
    state: present
    update_cache: true
```

Certificate issuance (`certbot --nginx -d yourdomain.com`) is a manual, one-time
command run once a real domain resolves to this VM — that happens in the Cloudflare
phase, not here, since Certbot needs a live DNS record to validate domain ownership.

- [ ] **Step 3: Update playbook.yml to include both**

```yaml
- name: Configure portfolio VM
  hosts: portfolio
  become: true

  tasks:
    - name: Install Docker
      import_tasks: tasks/docker.yml

    - name: Install Nginx
      import_tasks: tasks/nginx.yml

    - name: Install Certbot
      import_tasks: tasks/certbot.yml
```

- [ ] **Step 4: Run and verify**

```bash
cd ansible
ansible-playbook playbook.yml
```

Then confirm Nginx is actually serving:

```bash
curl -I http://<vm-ip>
```

Expected: `HTTP/1.1 200 OK` with a `Server: nginx` header — this is Nginx's default
placeholder page. (Note: your firewall from the Terraform phase only allows port 80
from Cloudflare's IP ranges, not your own IP directly — if this `curl` from your own
machine times out, that's the firewall working as designed, not a bug. To verify
Nginx locally instead, run the `curl` command from *inside* the VM over SSH.)

- [ ] **Step 5: Commit**

```bash
cd nishtha-portfolio
git add ansible/tasks/nginx.yml ansible/tasks/certbot.yml ansible/playbook.yml
git commit -m "Add Ansible Nginx and Certbot installation tasks"
```

---

### Task 4: Security Hardening

**Files:**
- Create: `ansible/tasks/hardening.yml`
- Modify: `ansible/playbook.yml`

**Interfaces:**
- Produces: a hardened VM — the final state this plan is responsible for.

- [ ] **Step 1: Write ansible/tasks/hardening.yml**

```yaml
- name: Disable SSH password authentication
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "^#?PasswordAuthentication"
    line: "PasswordAuthentication no"
  notify: Restart sshd

- name: Install fail2ban
  apt:
    name: fail2ban
    state: present
    update_cache: true

- name: Ensure fail2ban is running and enabled
  systemd:
    name: fail2ban
    state: started
    enabled: true

- name: Install ufw
  apt:
    name: ufw
    state: present

- name: Allow SSH through ufw
  community.general.ufw:
    rule: allow
    port: "22"
    proto: tcp

- name: Allow HTTP through ufw
  community.general.ufw:
    rule: allow
    port: "80"
    proto: tcp

- name: Allow HTTPS through ufw
  community.general.ufw:
    rule: allow
    port: "443"
    proto: tcp

- name: Enable ufw
  community.general.ufw:
    state: enabled
    policy: deny

- name: Install unattended-upgrades
  apt:
    name: unattended-upgrades
    state: present
    update_cache: true

- name: Enable automatic security updates
  copy:
    dest: /etc/apt/apt.conf.d/20auto-upgrades
    content: |
      APT::Periodic::Update-Package-Lists "1";
      APT::Periodic::Unattended-Upgrade "1";
```

**Why both `ufw` and the GCP firewall rules from Terraform:** this is defense in
depth — two independent layers. The GCP firewall (cloud-level, outside the VM) is the
primary control and already restricts 80/443 to Cloudflare's ranges; `ufw`
(OS-level, inside the VM) is a second layer that would still protect the VM even if a
GCP firewall rule were ever misconfigured or accidentally too permissive. Neither
replaces the other.

- [ ] **Step 2: Add the sshd restart handler to playbook.yml**

```yaml
- name: Configure portfolio VM
  hosts: portfolio
  become: true

  tasks:
    - name: Install Docker
      import_tasks: tasks/docker.yml

    - name: Install Nginx
      import_tasks: tasks/nginx.yml

    - name: Install Certbot
      import_tasks: tasks/certbot.yml

    - name: Apply security hardening
      import_tasks: tasks/hardening.yml

  handlers:
    - name: Restart sshd
      systemd:
        name: ssh
        state: restarted
```

- [ ] **Step 3: Install the required Ansible collection for ufw tasks**

```bash
ansible-galaxy collection install community.general
```

- [ ] **Step 4: Run the playbook**

```bash
cd ansible
ansible-playbook playbook.yml
```

Expected: `PLAY RECAP` with `failed=0`.

- [ ] **Step 5: Verify hardening took effect**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "sudo ufw status && sudo systemctl status fail2ban --no-pager | head -5"
```

Expected: `ufw status` shows `Status: active` with rules for 22, 80, 443; `fail2ban`
shows `active (running)`.

- [ ] **Step 6: Confirm your SSH session still works after the sshd restart**

```bash
ssh -i ~/.ssh/oci_portfolio_vm -o StrictHostKeyChecking=accept-new ubuntu@<vm-ip> echo still connected
```

This specifically checks that disabling password auth didn't lock out key-based
access too — if this fails, you'd be locked out and would need to use the GCP
Console's browser-based SSH (which uses a different auth path) to recover.

- [ ] **Step 7: Commit**

```bash
cd nishtha-portfolio
git add ansible/tasks/hardening.yml ansible/playbook.yml
git commit -m "Add Ansible security hardening: SSH key-only, fail2ban, ufw, unattended-upgrades"
```

---

## Definition of Done

- `ansible-playbook playbook.yml` configures a bare VM into one running Docker,
  Nginx, and Certbot, with no manual SSH commands required.
- Re-running the playbook is a no-op (`changed=0`) when nothing has drifted.
- `ufw status` shows only 22/80/443 allowed; `fail2ban` is active; unattended-upgrades
  is configured; SSH password authentication is disabled.
- SSH key-based access still works after hardening (verified, not assumed).
