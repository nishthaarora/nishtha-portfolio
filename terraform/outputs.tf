output "instance_public_ip" {
  description = "Public IP of the portfolio VM"
  value       = oci_core_instance.portfolio_vm.public_ip
}