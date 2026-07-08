output "instance_public_ip" {
  description = "Public IP of the portfolio VM"
  value       = google_compute_instance.portfolio_vm.network_interface[0].access_config[0].nat_ip
}