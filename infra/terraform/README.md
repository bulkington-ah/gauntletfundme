# Terraform AWS Baseline

This Terraform package provisions a production-shaped AWS baseline for this repository:

- Amazon ECR repository for the Next.js container image
- AWS App Runner service for runtime hosting
- VPC private networking and connector egress for App Runner
- Private PostgreSQL RDS instance reachable only from the App Runner VPC connector
- NAT-backed outbound HTTPS access so the App Runner service can call OpenAI for Supporter Digest AI

## Scope and Defaults

- Environment scope: production-only baseline
- AWS region default: `us-east-1`
- Deployment model: controlled release via explicit `app_image_tag`
- Terraform state: local state for this first task (temporary)

## Prerequisites

- Terraform `>= 1.5.0`
- AWS credentials configured in the shell environment
- Docker image built locally and ready to push to the provisioned ECR repository
- `OPENAI_API_KEY` stored in AWS Secrets Manager and available as a secret ARN for `openai_api_key_secret_arn`

## Usage

From this directory:

```bash
terraform fmt -check
terraform init
terraform validate
terraform apply -target=aws_ecr_repository.app -var="app_image_tag=bootstrap" -var="openai_api_key_secret_arn=<secret-arn>"
# read ecr_repository_url from terraform output, then push <image-tag> to that repository
terraform plan -var="app_image_tag=<image-tag>" -var="openai_api_key_secret_arn=<secret-arn>"
terraform apply -var="app_image_tag=<image-tag>" -var="openai_api_key_secret_arn=<secret-arn>"
```

After apply:

1. Read outputs:
   - `ecr_repository_url`
   - `apprunner_service_url`
   - `rds_endpoint`
2. Verify health:
   - `GET https://<apprunner_service_url>/api/health`
   - `GET https://<apprunner_service_url>/homepage-hero.png`
   - `GET https://<apprunner_service_url>/_next/image?url=%2Fhomepage-hero.png&w=3840&q=75`
   - load `https://<apprunner_service_url>/fundraisers` to confirm App Runner can reach RDS without Postgres `no encryption` failures

## Demo-Specific Caveat

- This internal demo configuration intentionally keeps `/prototype/reset` available after deploy so the catalog can be restored manually.
- Do not treat this exact setup as public-launch ready until the reset route is protected or disabled.

## Seeding Behavior with Private RDS

This application bootstraps persistence schema and prototype seed data on startup when required tables are absent. Because App Runner reaches the database through the private VPC connector, initial schema and seed bootstrapping still work with private-only RDS connectivity.

## Database Connection TLS

- The Terraform-managed App Runner `DATABASE_URL` is emitted with `?sslmode=no-verify` so the demo App Runner to RDS connection uses encrypted Postgres.
- This is the fast internal-demo path and does not perform strict certificate verification.
- If an operator manages App Runner configuration outside Terraform, they should append the same query suffix to the deployed `DATABASE_URL` before restarting the service.

## AI Runtime Configuration

- `OPENAI_API_KEY` should be stored in AWS Secrets Manager and passed to App Runner through `runtime_environment_secrets`.
- `OPENAI_DIGEST_MODEL` and `OPENAI_DIGEST_TIMEOUT_MS` are standard App Runner runtime environment variables.
- App Runner outbound traffic flows through the VPC connector; the Terraform NAT gateway and private-subnet default route keep outbound HTTPS available for OpenAI requests while RDS stays private.
- Updating the referenced secret value requires a service redeploy before the new value is visible in the running container.

## Local State Caveat

Local Terraform state is used intentionally for this first delivery to keep setup friction low. A follow-up infrastructure task should migrate to remote state with S3 backend and DynamoDB locking before collaborative production operations.
