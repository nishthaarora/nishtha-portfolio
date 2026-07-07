resource "oci_core_vcn" "portfolio_vcn" {
  compartment_id = var.compartment_ocid
  cidr_block     = "10.0.0.0/16"
  display_name   = "portfolio-vcn"
  dns_label      = "portfoliovcn"
}

resource "oci_core_internet_gateway" "portfolio_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "portfolio-igw"
  enabled        = true
}

resource "oci_core_route_table" "portfolio_route_table" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "portfolio-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.portfolio_igw.id
  }
}

resource "oci_core_security_list" "portfolio_security_list" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio_vcn.id
  display_name   = "portfolio-security-list"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    source   = var.admin_ssh_cidr
    protocol = "6" # TCP
    tcp_options {
      min = 22
      max = 22
    }
  }

  dynamic "ingress_security_rules" {
    for_each = var.cloudflare_ipv4_cidrs
    content {
      source   = ingress_security_rules.value
      protocol = "6"
      tcp_options {
        min = 80
        max = 80
      }
    }
  }

  dynamic "ingress_security_rules" {
    for_each = var.cloudflare_ipv4_cidrs
    content {
      source   = ingress_security_rules.value
      protocol = "6"
      tcp_options {
        min = 443
        max = 443
      }
    }
  }
}

resource "oci_core_subnet" "portfolio_subnet" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.portfolio_vcn.id
  cidr_block                 = "10.0.1.0/24"
  display_name               = "portfolio-subnet"
  dns_label                  = "portfoliosub"
  route_table_id             = oci_core_route_table.portfolio_route_table.id
  security_list_ids          = [oci_core_security_list.portfolio_security_list.id]
  prohibit_public_ip_on_vnic = false
}