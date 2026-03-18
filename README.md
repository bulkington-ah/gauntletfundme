# GoFundMe V2

## Overview
This repository builds a donor-first GoFundMe MVP that connects public profile, fundraiser, and community surfaces. It uses a modular monolith layout in Next.js and TypeScript with explicit `presentation`, `application`, `domain`, and `infrastructure` layers.

Core planning and architecture references:
- [docs/product_spec.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/product_spec.md)
- [docs/architecture.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture.md)
- [docs/architecture_rules.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture_rules.md)
- [docs/plan.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/plan.md)

## Current Implementation
Implemented foundations currently include:
- project scaffold and test/lint/build workflow
- domain models and persistence schema for core MVP entities
- application and presentation API boundaries for public read routes
- Postgres-backed repository adapters for public reads and follow persistence
- account and session auth foundations (sign up, login, logout, session lookup)
- centralized authorization policies for owner/member/moderator/anonymous checks
- follow and unfollow commands with auth checks, self-follow protection, idempotent persistence semantics, and follower count state in API responses
- post and comment creation commands with authenticated route handlers and owner-aware post authorization
- mocked donation intent start command with authenticated API flow and tracked `started` intent persistence
- moderation report submission command with authenticated, idempotent post/comment reporting semantics
- moderator/owner report resolution actions (`hide`, `remove`, `dismiss`) with public discussion visibility updates for moderated content
- application-layer analytics instrumentation for page views, follows, post/comment creation, and donation intent starts
- public profile page route with slug-based lookup and connected fundraiser/community links
- public fundraiser page route with organizer context, story rendering, and mocked donation entry
- public community page route with discussion feed, comment visibility, and connected links
- dedicated `/login` page with browser session persistence and shared-shell signed-in state

## Environment
Copy `.env.example` to your local environment config and set:
- `DATABASE_URL`: PostgreSQL connection string used by runtime persistence adapters
- `PORT`: runtime HTTP port (default `3000`)
- `HOSTNAME`: runtime bind address (default `0.0.0.0`)

The persistence layer bootstraps schema and seeds prototype data from `src/infrastructure/demo-data/` when tables are missing, which keeps local development and tests predictable.

Browser sign-in uses the HttpOnly `gofundme_v2_session` cookie. Protected API routes still accept the legacy `x-session-token` request header for tests and non-browser callers.

## Local Development Quickstart
- Recommended workflow:
  - run PostgreSQL in Docker
  - run the Next.js app natively with Node.js for the fastest edit/reload loop
- Prerequisites:
  - Node.js 22
  - Docker Desktop
  - local port `5432` available for PostgreSQL
  - local port `3000` available for the app
- Start a local PostgreSQL instance:
  ```bash
  docker run --name gofundme-v2-postgres \
    -e POSTGRES_DB=gofundme_v2 \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    -d postgres:16
  ```
- Create `.env.local` from `.env.example`:
  ```env
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/gofundme_v2
  PORT=3000
  HOSTNAME=0.0.0.0
  ```
- Install dependencies and start the app:
  ```bash
  npm install
  npm run dev
  ```
- On first database connection, the app bootstraps its schema and seeds the prototype catalog automatically.
- Verify the app locally:
  - `http://localhost:3000/api/health`
  - `http://localhost:3000/login`
  - `http://localhost:3000/profiles/avery-johnson`
  - `http://localhost:3000/fundraisers/warm-meals-2026`
  - `http://localhost:3000/communities/neighbors-helping-neighbors`
- Seeded prototype login credentials for local development:
  - `avery.organizer@example.com` / `Prototype123!`
  - `jordan.supporter@example.com` / `Prototype123!`
  - `morgan.moderator@example.com` / `Prototype123!`
- This workflow is local-only and does not change production deployment, which remains the existing Docker image plus AWS App Runner and private RDS path.

## Common Commands
- `npm install`
- `npm run dev`
- `npm test`
- `npm run lint`
- `npm run build`

## Deployment Baseline
- The app is Dockerized with a production multi-stage `Dockerfile` and Next.js standalone output.
- Build a production image:
  - `docker build -t gofundme-v2:local .`
- Run the container with managed environment variables:
  - `docker run --rm -p 3000:3000 --env DATABASE_URL=<your-managed-db-url> gofundme-v2:local`
- Runtime health check endpoint:
  - `GET /api/health`
- Secrets guidance:
  - keep secrets in managed environment configuration (AWS ECS task definition / App Runner / Parameter Store / Secrets Manager), never in source files.

## Terraform AWS Deployment (Task 018)
- Terraform infrastructure lives in `infra/terraform`.
- Baseline provisions:
  - private-networked PostgreSQL RDS
  - ECR repository for application images
  - App Runner service with VPC connector egress to private RDS
- Controlled release model:
  - deploy explicit image tags via Terraform variable `app_image_tag`
  - auto-deploy is disabled to keep production rollouts intentional
- Core commands:
  - `cd infra/terraform`
  - `terraform fmt -check`
  - `terraform init`
  - `terraform validate`
  - `terraform plan -var="app_image_tag=<image-tag>"`
  - `terraform apply -var="app_image_tag=<image-tag>"`
- Post-deploy smoke check:
  - `GET https://<apprunner_service_url>/api/health`
- State note:
  - this first version intentionally uses local Terraform state; migrate to S3 + DynamoDB locking in a follow-up task before collaborative production operations.

## Known Limitations
- Donation flow is intentionally mocked and does not process real payments.
- Analytics publisher is currently wired to a no-op provider by default; production event delivery requires a concrete adapter implementation.
- Moderation actions update current statuses but do not yet persist a separate historical moderation event log.
- Public signup UI is still deferred even though the underlying signup API exists.

## Workflow
Work is organized into one scoped task at a time under `tasks/`, with completion expectations defined in:
- [AGENTS.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/AGENTS.md)
- [harness/architecture_checks.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/harness/architecture_checks.md)
- [harness/coding_standards.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/harness/coding_standards.md)
- [harness/deployment_hardening.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/harness/deployment_hardening.md)
