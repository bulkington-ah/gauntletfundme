# Task 056: AWS Demo Deploy Internet Egress

## Status
Complete

## Depends On
- `tasks/task_018_aws_terraform_app_runner_rds.md`
- `tasks/task_047_supporter_digest_ai.md`

## Description
Extend the AWS Terraform deployment baseline so the App Runner service keeps private RDS connectivity while also gaining NAT-backed outbound internet access for Supporter Digest AI. Document the two-phase ECR bootstrap and full apply flow for an internal demo environment that still exposes the prototype reset tooling intentionally.

## Expected Files Affected
- `infra/terraform/**`
- `README.md`
- `tasks/task_056_aws_demo_deploy_internet_egress.md`

## Acceptance Criteria
- Terraform provisions public subnets, internet gateway routing, and a NAT gateway while keeping RDS and the App Runner VPC connector in private subnets.
- App Runner VPC connector egress allows private PostgreSQL and DNS traffic inside the VPC plus outbound HTTPS for OpenAI calls.
- Operator docs describe the ECR bootstrap step before the first image push and the follow-up full Terraform apply flow.
- Docs explicitly call out that `/prototype/reset` remains open only for this internal demo and must not be treated as public-launch ready.

## Tests Required
- `terraform fmt -check`
- `terraform init`
- `terraform validate`
- `terraform plan -var="app_image_tag=<tag>" -var="openai_api_key_secret_arn=<secret-arn>"`
- `npm run build`
- `npm test`

## Completion Summary
- Completed on 2026-03-18.
- Extended the Terraform baseline in `infra/terraform` with:
  - two public subnets
  - an internet gateway and public route table
  - a single NAT gateway for private-subnet outbound internet access
  - a private route to the NAT gateway so the App Runner VPC connector can keep private RDS access while also reaching OpenAI over HTTPS
- Narrowed App Runner VPC connector egress rules to the traffic this demo deploy needs:
  - PostgreSQL inside the VPC
  - TCP and UDP DNS inside the VPC
  - outbound HTTPS to the public internet
- Updated the root README and Terraform operator README to document:
  - the required AWS credentials, image tag, and `OPENAI_API_KEY` secret ARN inputs
  - the two-phase ECR bootstrap then full Terraform apply flow
  - the internal-demo caveat that `/prototype/reset` remains publicly callable and must not be treated as public-launch ready

## Verification
- `terraform -chdir=infra/terraform fmt`
- `terraform -chdir=infra/terraform fmt -check`
- `terraform -chdir=infra/terraform init`
- `terraform -chdir=infra/terraform validate`
- `terraform -chdir=infra/terraform plan -input=false -var='app_image_tag=local-test'`
- `npm test`
- `npm run build`

## Handoff Notes
- Terraform `apply` was not run in this task, so no AWS resources were created and no post-deploy smoke checks were executed.
- An actual deployment still needs a real `OPENAI_API_KEY` Secrets Manager ARN passed through `openai_api_key_secret_arn`.
- `terraform init` and `terraform validate` needed to run outside the sandbox in this environment so Terraform could reach the provider registry and execute the AWS provider plugin successfully.
- The single NAT gateway is intentional for this internal demo to keep cost and scope down; it remains a single-AZ egress dependency.
