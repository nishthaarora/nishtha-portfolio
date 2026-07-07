# Terraform Prerequisites

One-time manual setup completed before any `terraform apply`:

1. Oracle Cloud Free Tier account created.
2. Tenancy OCID, User OCID, and root Compartment OCID noted from the OCI Console.
3. API signing keypair generated at `~/.oci/oci_api_key.pem` /
   `~/.oci/oci_api_key_public.pem`, public key uploaded to OCI, fingerprint noted.
   (Generate a separate keypair per machine you use — do not copy the private key
   between machines. Upload each machine's public key to the same OCI account.)
4. OCI CLI installed and verified with `oci iam region list`.
5. Dedicated SSH keypair generated at `~/.ssh/oci_portfolio_vm{,.pub}` for VM access.
6. Operator's public IP noted (via `curl -s ifconfig.me`) for the SSH firewall rule.

All of the above values (tenancy OCID, user OCID, compartment OCID, fingerprint,
region, SSH public key path, admin IP) go into `terraform/terraform.tfvars`, which is
gitignored and never committed. See `terraform.tfvars.example` for the format.
