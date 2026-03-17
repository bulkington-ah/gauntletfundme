# Terraform AWS Baseline

This Terraform package provisions a production-shaped AWS baseline for this repository:

- Amazon ECR repository for the Next.js container image
- AWS App Runner service for runtime hosting
- VPC private networking and connector egress for App Runner
- Private PostgreSQL RDS instance reachable only from the App Runner VPC connector

## Scope and Defaults

- Environment scope: production-only baseline
- AWS region default: `us-east-1`
- Deployment model: controlled release via explicit `app_image_tag`
- Terraform state: local state for this first task (temporary)

## Prerequisites

- Terraform `>= 1.5.0`
- AWS credentials configured in the shell environment
- Docker image built and pushed to the provisioned ECR repository

## Usage

From this directory:

```bash
terraform fmt -check
terraform init
terraform validate
terraform plan -var="app_image_tag=<image-tag>"
terraform apply -var="app_image_tag=<image-tag>"
```

After apply:

1. Read outputs:
   - `ecr_repository_url`
   - `apprunner_service_url`
   - `rds_endpoint`
2. Verify health:
   - `GET https://<apprunner_service_url>/api/health`

## Seeding Behavior with Private RDS

This application bootstraps persistence schema and prototype seed data on startup when required tables are absent. Because App Runner reaches the database through the private VPC connector, initial schema and seed bootstrapping still work with private-only RDS connectivity.

## Local State Caveat

Local Terraform state is used intentionally for this first delivery to keep setup friction low. A follow-up infrastructure task should migrate to remote state with S3 backend and DynamoDB locking before collaborative production operations.
