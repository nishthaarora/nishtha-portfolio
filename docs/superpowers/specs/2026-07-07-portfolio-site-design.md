# Portfolio Site — Design Spec

Date: 2026-07-07

## Purpose

A personal portfolio site showcasing resume and projects, self-deployed end-to-end
(infra, config, CI/CD, hosting) as a hands-on learning exercise and interview talking
point. Includes an AI chatbox (Ask tab) that answers visitor questions about Nishtha
using her resume as context.

## Goals

- Live, TLS-secured site reachable via a free subdomain now, custom domain later.
- Entire deployment pipeline is self-built and free: no paid hosting, no paid CI/CD.
- Deployment stack demonstrates real infra skills: IaC (Terraform), configuration
  management (Ansible), containerization (Docker), CI/CD (GitHub Actions), CDN/security
  (Cloudflare), and operational concerns (rollback, monitoring, hardening).
- Ask tab: a simple LLM-backed chatbox that answers questions about Nishtha using her
  resume as context, on a free-tier LLM API, with no RAG/vector-store infrastructure.

## Non-Goals

- No CMS or dynamic content editing UI — resume/project data lives in typed data files
  in the repo, edited via git commits.
- No remote Terraform state/locking — single-VM personal project, local state is fine.
- No RAG pipeline, vector database, or chunking/retrieval infrastructure for the
  chatbox — the resume is small enough to pass as full context on every request.
- No Kubernetes — a single Docker Compose stack on one VM is sufficient at this scale.

## Architecture

> **Provider note (2026-07-08):** Originally designed for Oracle Cloud's "Always Free"
> ARM tier. Switched to Google Cloud's free-tier `e2-micro` after persistent,
> multi-day "out of host capacity" errors provisioning Oracle's ARM shape in
> `us-chicago-1` (tried multiple availability domains and shape sizes; GCP's free
> region subscription was also gated behind a paid-tier upgrade on the trial account,
> unlike GCP which doesn't have this restriction). GCP's `e2-micro` is x86_64, which
> also removes the ARM cross-compilation step from CI/CD entirely.

```
Terraform (provisioning)
  - GCP VPC + subnet + firewall rules
      - 80/443 open only to Cloudflare's published IP ranges
      - 22 restricted to operator's IP where possible
  - "Always Free" e2-micro Compute Engine instance (bare Ubuntu), in a free-tier
    eligible region (us-west1 / us-central1 / us-east1)
  - Outputs: VM public IP
      │
      ▼
Ansible (configuration) — playbook run against the Terraform-output IP, idempotent
  - Installs Docker + Docker Compose
  - Installs Nginx + Certbot (Let's Encrypt) as reverse proxy / TLS termination
  - Deploys docker-compose.yml / systemd unit for the app container
  - Hardening:
      - SSH key-only auth (PasswordAuthentication no)
      - fail2ban (SSH brute-force protection)
      - ufw firewall (22/80/443 only)
      - unattended-upgrades (automatic security patches)
      │
      ▼
GitHub Actions CI/CD (x86_64 runners) — on push to main
  1. Install deps, lint, typecheck, build
  2. docker build (native x86_64 — no cross-compilation needed, since both the
     GitHub runner and the GCP VM are x86_64)
  3. Tag image with both `latest` and the git commit SHA; push both to ghcr.io
  4. SSH deploy: set IMAGE_TAG=<sha> in .env on VM → docker compose pull && up -d
      │
      ▼
GCP VM
  - App container (restart: unless-stopped) + Nginx + Let's Encrypt TLS
  - UptimeRobot free ping against the public URL for basic monitoring
      │
      ▼
Cloudflare (free tier, proxied, SSL mode: Full (strict))
  - Hides VM's real IP, free DDoS protection, caches static assets
  - Terraform's firewall rules allow 80/443 only from Cloudflare's IP ranges
      │
      ▼
Domain (Cloudflare DNS) → Cloudflare edge → VM
  - Free subdomain to start; custom domain (~$10-15/yr) addable later via same DNS setup
```

**Division of responsibility:**
- Terraform = infrastructure existence (VM, network, firewall shape)
- Ansible = infrastructure configuration (what's installed/hardened on the VM)
- GitHub Actions = application build & deployment (what's running, and which version)
- Cloudflare = edge protection (DDoS, IP hiding, caching)

**Rollback:** `docker-compose.yml` references `${IMAGE_TAG}` rather than a hardcoded
tag. To roll back, SSH into the VM, set `IMAGE_TAG` to a previous commit SHA in `.env`,
and re-run `docker compose pull && up -d`. This is a manual, on-demand action — no
automatic rollback in this phase.

**Monitoring:** UptimeRobot free tier polls the public URL. No log aggregation beyond
`docker logs` in this phase — sufficient for a single-VM personal site.

## App Structure

```
nishtha-portfolio/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # "/" → redirects to /resume (default landing tab)
│   ├── ask/page.tsx              # Ask tab — chatbox UI, calls /api/chat
│   ├── resume/page.tsx           # Resume tab (default landing route)
│   ├── portfolio/page.tsx        # Portfolio tab (projects)
│   ├── layout.tsx                # Shared layout with tab nav: Ask | Resume | Portfolio
│   └── api/chat/route.ts         # Calls Gemini API with resume context + user question
├── data/
│   ├── resume.ts                 # Typed resume data (experience, education, skills) —
│   │                              # single source of truth for both the Resume tab and
│   │                              # the Ask chatbox's LLM context
│   └── projects.ts               # Typed project list (title, description, tech, links)
├── lib/
│   └── formatResumeForPrompt.ts  # Serializes data/resume.ts into a markdown text block
│                                  # for the LLM system prompt (no separate context file)
├── components/
│   ├── TabNav.tsx                # Ask / Resume / Portfolio tab switcher
│   ├── ProjectCard.tsx
│   ├── ResumeSection.tsx
│   └── ChatBox.tsx               # Ask tab's chat UI
├── Dockerfile
├── docker-compose.yml            # references ${IMAGE_TAG}; GEMINI_API_KEY from .env
├── terraform/                    # VCN, security list, compute instance, retry-apply.sh
├── ansible/                      # playbook.yml (includes deploying the Vault-encrypted
│                                  # GEMINI_API_KEY into the VM's .env)
└── .github/workflows/deploy.yml
```

Tab order: **Ask | Resume | Portfolio**. Default route `/` redirects to `/resume`.

Content (resume + projects) lives in typed TypeScript data files, edited via git —
no CMS, no runtime data-fetching for this content.

## AI Chatbox (Ask tab)

- **Model/API**: Google Gemini API free tier (Gemini 2.0/2.5 Flash) — chosen because
  it's a durable, ongoing free tier (not a trial with an expiry), with a context window
  far larger than a resume needs, and no RAG/vector-store infra required.
- **Context strategy**: no RAG. `lib/formatResumeForPrompt.ts` serializes
  `data/resume.ts` into a markdown text block, included in full as the system prompt on
  every request, followed by the visitor's question. `data/resume.ts` remains the single
  source of truth — the Resume tab renders it as UI, the formatter renders it as prompt
  text, so the two can never drift out of sync.
- **Request flow**: `ChatBox.tsx` (client) → `POST /api/chat` (Next.js API route) →
  Gemini API (server-side call, key never exposed to the client) → response streamed/
  returned to `ChatBox.tsx`.
- **Secret handling**: `GEMINI_API_KEY` is stored as a GitHub Actions secret, encrypted
  into an Ansible Vault variable, and deployed into the VM's `.env` file (read by
  `docker-compose.yml` and injected into the app container as an environment variable).
  The key never appears in the repo in plaintext or in CI logs.

## Known Friction Points (called out explicitly, not left as surprises)

- **GCP free-tier region/zone restriction**: the `e2-micro` Always Free instance is
  only free in specific regions (`us-west1`, `us-central1`, `us-east1`) — provisioning
  outside those incurs cost. Terraform's region variable defaults to one of these.
- **Historical note**: this project originally targeted Oracle Cloud's ARM "Always
  Free" tier; see the Architecture section's provider note for why it moved to GCP.
- **VM reboot survival**: `restart: unless-stopped` in Docker Compose ensures the app
  container comes back up after host reboots/patching.

## Testing

- `npx tsc --noEmit` and lint run in CI before build.
- Manual smoke test after each deploy: hit the public URL, verify all three tabs load.
- Ansible playbook is idempotent — safe to re-run against the VM at any time to verify
  convergence (useful as a manual test after hardening changes).
