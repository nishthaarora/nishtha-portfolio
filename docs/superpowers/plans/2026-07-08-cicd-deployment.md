# CI/CD Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up GitHub Actions so every push to `main` automatically builds the app's
Docker image, pushes it to `ghcr.io`, and deploys it to the GCP VM via SSH — with a
working Nginx reverse proxy in front of the app container so the deploy is actually
reachable.

**Architecture:** A GitHub Actions workflow runs on `push` to `main`: install deps →
typecheck/lint → build the app → build a Docker image tagged with both `latest` and
the commit SHA → push both tags to GitHub Container Registry → SSH into the VM →
update `.env`'s `IMAGE_TAG` → `docker compose pull && up -d`. A dedicated,
narrowly-scoped SSH deploy key (separate from your personal SSH key) authorizes the
GitHub Actions runner to reach the VM.

**Tech Stack:** GitHub Actions, Docker Buildx, GitHub Container Registry (ghcr.io),
`appleboy/ssh-action` (or a plain `ssh` step) for the deploy, Nginx (already installed
by Ansible).

## Global Constraints

- No secrets in the repo: the deploy SSH private key and any future API keys are
  GitHub Actions secrets only, never committed.
- Images are tagged with both `latest` and the git commit SHA (per the design spec's
  rollback mechanism) — never only `latest`.
- The GitHub Actions runner is x86_64 and the GCP VM is x86_64 (`e2-micro`) — no
  cross-compilation needed, unlike the original Oracle ARM plan.
- Deploys only happen on push to `main` — no deploys from other branches or PRs.

---

## File Structure

```
nishtha-portfolio/
├── .github/workflows/deploy.yml   # The CI/CD pipeline itself
└── ansible/
    └── tasks/nginx.yml            # Modified: adds the reverse-proxy site config
```

---

### Task 1: Nginx Reverse Proxy to the App Container

**Files:**
- Modify: `ansible/tasks/nginx.yml`

**Interfaces:**
- Consumes: nothing new — assumes the app container will eventually listen on
  `localhost:3000` (per `docker-compose.yml`'s `ports: "3000:3000"` from the app
  skeleton phase).
- Produces: Nginx configured to forward all traffic on port 80 to `localhost:3000`.

- [ ] **Step 1: Add a reverse-proxy site config task**

Add this to the end of `ansible/tasks/nginx.yml`:

```yaml
- name: Configure Nginx as a reverse proxy to the app container
  copy:
    dest: /etc/nginx/sites-available/portfolio
    content: |
      server {
          listen 80;
          server_name _;

          location / {
              proxy_pass http://localhost:3000;
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
          }
      }
  notify: Reload nginx

- name: Enable the portfolio site
  file:
    src: /etc/nginx/sites-available/portfolio
    dest: /etc/nginx/sites-enabled/portfolio
    state: link
  notify: Reload nginx

- name: Disable the default Nginx site
  file:
    path: /etc/nginx/sites-enabled/default
    state: absent
  notify: Reload nginx
```

**What this does:** replaces Nginx's default "Welcome to nginx" page with a config
that forwards every request to whatever is listening on `localhost:3000` — which is
exactly where Docker Compose will expose the app container. The `proxy_set_header`
lines preserve the original client IP and protocol information for the app to see
(otherwise the app would think every request came from `localhost`, since that's
technically true from its point of view — Nginx is the one actually receiving the
public request).

- [ ] **Step 2: Add the reload handler to playbook.yml**

Add to the `handlers:` section of `ansible/playbook.yml`:

```yaml
    - name: Reload nginx
      systemd:
        name: nginx
        state: reloaded
```

- [ ] **Step 3: Run the playbook**

```bash
cd ansible
ansible-playbook playbook.yml
```

- [ ] **Step 4: Verify (expect a connection refused, not an error — there's no app running yet)**

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "curl -I http://localhost"
```

Expected: `curl: (7) Failed to connect to localhost port 3000` — this confirms Nginx
is correctly trying to reach port 3000 and failing only because nothing is listening
there yet (no app container has been deployed). This is the correct state until
Task 4 actually deploys something.

- [ ] **Step 5: Commit**

```bash
cd nishtha-portfolio
git add ansible/tasks/nginx.yml ansible/playbook.yml
git commit -m "Configure Nginx as a reverse proxy to the app container"
```

---

### Task 2: Deploy SSH Key and GitHub Secrets

**Files:** none (GitHub repo settings + VM changes only, no new files)

**Interfaces:**
- Produces: GitHub Actions secrets (`VM_HOST`, `VM_SSH_PRIVATE_KEY`, `VM_USER`)
  consumed by the workflow in Task 3.

- [ ] **Step 1: Generate a dedicated deploy keypair (separate from your personal key)**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/portfolio_deploy_key -N "" -C "github-actions-deploy"
```

Using a separate key (not your personal `oci_portfolio_vm` key) means you can revoke
CI/CD's access independently later without losing your own SSH access.

- [ ] **Step 2: Authorize the new public key on the VM**

```bash
cat ~/.ssh/portfolio_deploy_key.pub
```

SSH into the VM with your existing key and append this to the `ubuntu` user's
authorized keys:

```bash
ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> "echo '<paste-the-public-key-here>' >> ~/.ssh/authorized_keys"
```

- [ ] **Step 3: Add GitHub Actions secrets**

In the GitHub repo: **Settings → Secrets and variables → Actions → New repository
secret**. Add three:

| Name | Value |
|---|---|
| `VM_HOST` | your VM's public IP (from `terraform output -raw instance_public_ip`) |
| `VM_USER` | `ubuntu` |
| `VM_SSH_PRIVATE_KEY` | the full contents of `~/.ssh/portfolio_deploy_key` (the private key, not `.pub`) — get it with `cat ~/.ssh/portfolio_deploy_key` |

- [ ] **Step 4: Verify the key works before wiring it into CI**

```bash
ssh -i ~/.ssh/portfolio_deploy_key -o StrictHostKeyChecking=accept-new ubuntu@<vm-ip> echo deploy-key-works
```

Expected: `deploy-key-works`

No commit for this task — everything here is either a GitHub secret (never in the
repo) or a change on the VM itself.

---

### Task 3: The GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `VM_HOST`, `VM_USER`, `VM_SSH_PRIVATE_KEY` secrets from Task 2;
  `docker-compose.yml` and `Dockerfile` from the app skeleton phase.
- Produces: a running deploy pipeline, and images published at
  `ghcr.io/nishthaarora/nishtha-portfolio`.

- [ ] **Step 1: Write .github/workflows/deploy.yml**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

env:
  IMAGE_NAME: ghcr.io/${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image_tag: ${{ steps.tag.outputs.sha }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Compute short SHA tag
        id: tag
        run: echo "sha=${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ env.IMAGE_NAME }}:latest
            ${{ env.IMAGE_NAME }}:${{ steps.tag.outputs.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VM over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USER }}
          key: ${{ secrets.VM_SSH_PRIVATE_KEY }}
          script: |
            cd ~/portfolio
            echo "IMAGE_TAG=${{ needs.build-and-push.outputs.image_tag }}" > .env
            docker compose pull
            docker compose up -d
```

**What each job does:**
- **`build-and-push`**: runs on GitHub's own x86_64 runner (no cross-compilation
  needed, unlike the abandoned Oracle ARM plan). Installs deps, typechecks, lints,
  builds — failing fast here means a broken app never reaches the Docker build step.
  `GITHUB_TOKEN` is a secret GitHub provides automatically to every workflow run — no
  setup needed — scoped just enough to push to this repo's own package registry.
  `${GITHUB_SHA::7}` is bash string-slicing syntax taking the first 7 characters of
  the full commit SHA (a common convention — short enough to be readable, long enough
  to be effectively unique).
- **`deploy`**: only runs if `build-and-push` succeeds (`needs:` establishes that
  dependency). SSHes into the VM using the Task 2 secrets, writes the new image tag
  into `.env` (overwriting it — this is the exact mechanism the rollback story
  depends on later), then tells Docker Compose to pull that image and restart.

- [ ] **Step 2: Create the deploy target directory on the VM**

The workflow assumes `~/portfolio` exists on the VM with `docker-compose.yml` in it.
Copy it there once, manually, the first time:

```bash
scp -i ~/.ssh/oci_portfolio_vm docker-compose.yml ubuntu@<vm-ip>:~/portfolio/docker-compose.yml
```

(If `~/portfolio` doesn't exist yet: `ssh -i ~/.ssh/oci_portfolio_vm ubuntu@<vm-ip> mkdir -p ~/portfolio` first.)

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions CI/CD pipeline: build, push to ghcr.io, deploy via SSH"
git push
```

Pushing this commit **immediately triggers the workflow**, since it's a push to
`main`. Watch it run in the GitHub repo's **Actions** tab.

- [ ] **Step 4: Verify the deploy actually worked**

```bash
curl -I http://<vm-ip>
```

Expected: `HTTP/1.1 200 OK` — this confirms Nginx is now successfully proxying to a
real, running app container (contrast with Task 1's expected "connection refused").

```bash
curl -s http://<vm-ip>/resume | grep -o "Nishtha Arora"
```

Expected: `Nishtha Arora` — confirms the actual deployed app is serving your real
resume content, not a stale/default page.

---

## Definition of Done

- A push to `main` automatically results in a new Docker image built, pushed to
  `ghcr.io` with both `latest` and short-SHA tags, and deployed to the VM with zero
  manual steps.
- `http://<vm-ip>` (and eventually your real domain, once Cloudflare is set up)
  serves the actual app, proxied through Nginx.
- Rollback is possible by SSHing in, changing `IMAGE_TAG` in `.env` to a previous
  short SHA, and re-running `docker compose pull && up -d` manually.
