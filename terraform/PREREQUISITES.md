# Terraform Prerequisites (Google Cloud)

One-time manual setup completed before any `terraform apply`:

1. GCP account created; project `nishtha-portfolio-26` created (project IDs are
   globally unique — the plain `nishtha-portfolio` was taken).
2. `gcloud` CLI installed and initialized (`gcloud init`), active project set with
   `gcloud config set project nishtha-portfolio-26`.
3. Billing account created and linked to the project (required even for Always Free
   usage; no charge as long as usage stays within free-tier limits).
4. Compute Engine API enabled (`gcloud services enable compute.googleapis.com`).
5. Service account `terraform-portfolio` created with `roles/compute.admin`.
6. Service account key downloaded to `~/.gcp/terraform-portfolio-key.json`
   (generate a separate key per machine you use — do not copy this file between
   machines).
7. Verified with `gcloud compute instances list --project=nishtha-portfolio-26`
   (returns `Listed 0 items.` before any VM exists — confirms auth works).
8. SSH keypair at `~/.ssh/oci_portfolio_vm{,.pub}` (reused from the original Oracle
   setup — cloud-agnostic) and operator's public IP (`curl -s ifconfig.me`) for the
   firewall rule.

All of the above (project ID, credentials file path, region, SSH public key path,
admin IP) go into `terraform/terraform.tfvars`, which is gitignored and never
committed. See `terraform.tfvars.example` for the format.
