# Nishtha Arora — Portfolio

Live at **[nishthaarora.duckdns.org](https://nishthaarora.duckdns.org)**

A self-deployed portfolio site (resume, projects, and an AI-powered "Ask" chatbox)
built as an end-to-end infra/deployment learning exercise — provisioned with
Terraform, configured with Ansible, deployed via GitHub Actions CI/CD, all on a
Google Cloud free-tier VM.

## Stack

- **App**: Next.js (App Router), TypeScript
- **Infra**: Terraform (GCP VPC, firewall, `e2-micro` VM)
- **Config management**: Ansible (Docker, Nginx, Certbot, security hardening)
- **CI/CD**: GitHub Actions (build → push to `ghcr.io` → SSH deploy)
- **Domain/TLS**: DuckDNS + Let's Encrypt (via Certbot)
- **Analytics**: Google Analytics (GA4)

## Design docs

Full design spec and implementation plans are in `docs/superpowers/`.

## Local development

```bash
npm install
npm run dev
```
