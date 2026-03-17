variable "aws_region" {
  description = "AWS region for all infrastructure resources."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name used in resource naming and tags."
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Logical application name used in resource naming."
  type        = string
  default     = "gofundme-v2"
}

variable "app_image_tag" {
  description = "ECR image tag to deploy to App Runner (controlled release input)."
  type        = string

  validation {
    condition     = length(trimspace(var.app_image_tag)) > 0
    error_message = "app_image_tag must be a non-empty image tag value."
  }
}

variable "app_port" {
  description = "Container port exposed by the application image."
  type        = number
  default     = 3000
}

variable "app_cpu" {
  description = "App Runner vCPU units in string form (256, 512, 1024, 2048, 4096)."
  type        = string
  default     = "1024"
}

variable "app_memory" {
  description = "App Runner memory in MB string form (for example 1024, 2048, 3072)."
  type        = string
  default     = "2048"
}

variable "vpc_cidr_block" {
  description = "CIDR block for the deployment VPC."
  type        = string
  default     = "10.30.0.0/16"
}

variable "private_subnet_cidr_blocks" {
  description = "Two private subnet CIDR blocks used for RDS and App Runner VPC egress."
  type        = list(string)
  default     = ["10.30.1.0/24", "10.30.2.0/24"]

  validation {
    condition     = length(var.private_subnet_cidr_blocks) == 2
    error_message = "private_subnet_cidr_blocks must contain exactly two CIDR blocks."
  }
}

variable "database_name" {
  description = "Primary PostgreSQL database name for the application."
  type        = string
  default     = "gofundme_v2"
}

variable "database_username" {
  description = "Master database username for the RDS instance."
  type        = string
  default     = "app_user"
}

variable "database_instance_class" {
  description = "RDS instance class for PostgreSQL."
  type        = string
  default     = "db.t4g.micro"
}

variable "database_allocated_storage" {
  description = "Initial allocated storage (GiB) for the PostgreSQL instance."
  type        = number
  default     = 20
}

variable "database_max_allocated_storage" {
  description = "Autoscaling storage ceiling (GiB) for PostgreSQL."
  type        = number
  default     = 100
}

variable "database_engine_version" {
  description = "Optional PostgreSQL engine version. Leave null for AWS default."
  type        = string
  default     = null
}

variable "database_backup_retention_days" {
  description = "Number of days automated backups are retained."
  type        = number
  default     = 7
}

variable "database_multi_az" {
  description = "Whether to enable Multi-AZ RDS deployment."
  type        = bool
  default     = false
}

variable "database_deletion_protection" {
  description = "Whether to enable deletion protection on RDS."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags merged onto all managed resources."
  type        = map(string)
  default     = {}
}
