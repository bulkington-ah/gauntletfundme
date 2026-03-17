# Task 018: AWS Terraform App Runner and Private RDS Baseline

## Status
Complete

## Depends On
- `tasks/task_016_deployment_baseline_and_production_hardening.md`
- `tasks/task_017_mvp_end_to_end_validation_and_polish.md`

## Description
Create a production-focused Terraform baseline for AWS deployment using App Runner, ECR, and a private PostgreSQL RDS instance with VPC connectivity.

## Expected Files Affected
- `infra/terraform/**`
- `README.md`
- `tasks/task_018_aws_terraform_app_runner_rds.md`

## Acceptance Criteria
- Terraform provisions VPC networking, private subnets, DB subnet group, and security groups required for private RDS access.
- Terraform provisions ECR and App Runner wired to a controlled image tag input and `/api/health` runtime health check.
- Terraform provisions private PostgreSQL RDS and injects `DATABASE_URL` to the application runtime.
- Terraform usage and deployment flow are documented for operators.
- Task follow-up notes include local state caveat and next-step remote-state migration recommendation.

## Tests Required
- `terraform fmt -check`
- `terraform init`
- `terraform validate`
- `terraform plan -var="app_image_tag=<tag>"`
- Post-apply health check against deployed App Runner URL (`GET /api/health`) when AWS credentials/environment are available.
- `npm run build`
- `npm test`

## Completion Summary
- Completed on 2026-03-16.
- Added a new Terraform baseline at `infra/terraform` with:
  - provider/runtime setup (`versions.tf`, `providers.tf`, `variables.tf`)
  - AWS infrastructure resources (`main.tf`) for VPC private networking, security groups, DB subnet group, private PostgreSQL RDS, ECR, App Runner VPC connector, App Runner service, and IAM ECR access role
  - deployment outputs (`outputs.tf`) and Terraform operator documentation (`infra/terraform/README.md`)
  - Terraform-local artifact ignore rules (`infra/terraform/.gitignore`) while keeping `.terraform.lock.hcl` under version control
- Updated root `README.md` with Terraform deployment flow, controlled image-tag release model, and temporary local-state caveat.

## Verification
- `terraform fmt -check`
- `terraform init`
- `terraform validate`
- `terraform plan -input=false -var="app_image_tag=local-test"`
- `npm run build`
- `npm test`

## Handoff Notes
- Post-apply runtime smoke check (`GET /api/health` on deployed App Runner URL) was not run in this task because Terraform `apply` was intentionally not executed.
- This task intentionally uses local Terraform state for delivery speed; migrate to S3 backend + DynamoDB locking in the next infrastructure task before collaborative production operations.
- `DATABASE_URL` is generated from Terraform-managed RDS values and injected into App Runner runtime environment variables for startup schema/seed bootstrap compatibility with private RDS.
