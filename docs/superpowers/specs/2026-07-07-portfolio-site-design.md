# Portfolio Site — Design Spec

Date: 2026-07-07

## Purpose

A personal portfolio site showcasing resume and projects, self-deployed end-to-end
(infra, config, CI/CD, hosting) as a hands-on learning exercise and interview talking
point. Future addition: an AI chatbox that answers visitor questions about Nishtha.

## Goals

- Live, TLS-secured site reachable via a free subdomain now, custom domain later.
- Entire deployment pipeline is self-built and free: no paid hosting, no paid CI/CD.
- Deployment stack demonstrates real infra skills: IaC (Terraform), configuration
  management (Ansible), containerization (Docker), CI/CD (GitHub Actions), CDN/security
  (Cloudflare), and operational concerns (rollback, monitoring, hardening).
- App structure already accommodates the future AI chatbox without rearchitecture.

## Non-Goals

- No CMS or dynamic content editing UI — resume/project data lives in typed data files
  in the repo, edited via git commits.
- No remote Terraform state/locking — single-VM personal project, local state is fine.
- The AI chatbox itself is not built in this phase — only a placeholder route/page.
- No Kubernetes — a single Docker Compose stack on one VM is sufficient at this scale.

## Architecture

```
Terraform (provisioning)
  - Oracle VCN + subnet + security list
      - 80/443 open only to Cloudflare's published IP ranges
      - 22 restricted to operator's IP where possible
  - ARM "Always Free" Compute instance (bare Ubuntu)
  - retry-apply.sh wraps `terraform apply`, retries on Oracle
    "Out of host capacity" errors with backoff
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
  2. docker buildx build --platform linux/arm64 (QEMU emulation, cross-compiling
     for the ARM64 VM from x86_64 runners)
  3. Tag image with both `latest` and the git commit SHA; push both to ghcr.io
  4. SSH deploy: set IMAGE_TAG=<sha> in .env on VM → docker compose pull && up -d
      │
      ▼
Oracle VM
  - App container (restart: unless-stopped) + Nginx + Let's Encrypt TLS
  - UptimeRobot free ping against the public URL for basic monitoring
      │
      ▼
Cloudflare (free tier, proxied, SSL mode: Full (strict))
  - Hides VM's real IP, free DDoS protection, caches static assets
  - Terraform's security list allows 80/443 only from Cloudflare's IP ranges
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
│   ├── ask/page.tsx              # Ask tab — chatbox UI (placeholder: "Coming soon")
│   ├── resume/page.tsx           # Resume tab (default landing route)
│   ├── portfolio/page.tsx        # Portfolio tab (projects)
│   ├── layout.tsx                # Shared layout with tab nav: Ask | Resume | Portfolio
│   └── api/chat/route.ts         # Placeholder API route backing Ask (stub response)
├── data/
│   ├── resume.ts                 # Typed resume data (experience, education, skills)
│   └── projects.ts               # Typed project list (title, description, tech, links)
├── components/
│   ├── TabNav.tsx                # Ask / Resume / Portfolio tab switcher
│   ├── ProjectCard.tsx
│   └── ResumeSection.tsx
├── Dockerfile
├── docker-compose.yml            # references ${IMAGE_TAG}
├── terraform/                    # VCN, security list, compute instance, retry-apply.sh
├── ansible/                      # playbook.yml
└── .github/workflows/deploy.yml
```

Tab order: **Ask | Resume | Portfolio**. Default route `/` redirects to `/resume`.
The Ask tab ships as a visible "Coming soon" placeholder (not hidden) so the site's
navigation and routing already match the final vision; the chatbox slots into the
existing `api/chat/route.ts` and `ask/page.tsx` later without structural changes.

Content (resume + projects) lives in typed TypeScript data files, edited via git —
no CMS, no runtime data-fetching for this content.

## Known Friction Points (called out explicitly, not left as surprises)

- **Oracle free-tier VM provisioning**: ARM capacity is often unavailable in popular
  regions; `retry-apply.sh` retries with backoff. May still require manual region
  changes if retries exhaust.
- **ARM64 cross-compilation**: GitHub's free runners are x86_64; images are built for
  `linux/arm64` via `docker buildx` + QEMU emulation. Slower builds, but zero extra cost.
- **VM reboot survival**: `restart: unless-stopped` in Docker Compose ensures the app
  container comes back up after host reboots/patching.

## Testing

- `npx tsc --noEmit` and lint run in CI before build.
- Manual smoke test after each deploy: hit the public URL, verify all three tabs load.
- Ansible playbook is idempotent — safe to re-run against the VM at any time to verify
  convergence (useful as a manual test after hardening changes).
