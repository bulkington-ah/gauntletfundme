# Task 016: Deployment Baseline and Production Hardening

## Status
Complete

## Depends On
- `tasks/task_001_project_scaffold.md`
- `tasks/task_002_core_models.md`
- `tasks/task_015_analytics_instrumentation.md`

## Description
Prepare the application for production-like deployment with container packaging, health checks, runtime environment baseline configuration, and deployment hardening guidance.

## Expected Files Affected
- `Dockerfile`
- `.dockerignore`
- `next.config.ts`
- `src/app/api/health/route.ts`
- `README.md`
- `harness/**`
- `.env.example`
- `tests/**`

## Acceptance Criteria
- Application can be packaged and built as a production image.
- Runtime configuration and secret handling expectations are documented.
- Health endpoint exists for deployment/liveness checks.
- Deployment smoke test is executable and verified.

## Tests Required
- Production build verification.
- Health route smoke test.
- Container build and startup smoke check.

## Notes
- Container image uses Next.js standalone output for lean runtime packaging.
- Runtime secret handling remains external to code via managed environment configuration.

## Completion Summary
- Completed on 2026-03-16.
- Added production deployment artifacts:
  - multi-stage `Dockerfile` for build/runtime separation
  - `.dockerignore` to trim build context
  - Next standalone output configuration (`output: "standalone"`)
- Added runtime health endpoint:
  - `GET /api/health`
- Added route-level health test coverage.
- Expanded environment baseline docs with runtime `PORT` and `HOSTNAME`.
- Added deployment hardening checklist under `harness/deployment_hardening.md`.
- Updated README with deployment baseline instructions, health endpoint details, and managed secret guidance.

## Verification
- `npm test`
- `npm run lint`
- `npm run build`
- `docker build -t gofundme-v2:local .`
- `docker run -d --name gofundme-v2-smoke -p 3000:3000 gofundme-v2:local`
- `docker exec gofundme-v2-smoke wget -qO- http://127.0.0.1:3000/api/health`
- `docker rm -f gofundme-v2-smoke`

## Handoff Notes
- The Docker image builds and starts without bundling local secrets; `DATABASE_URL` is expected at runtime.
- Health checks can target `/api/health` for startup/readiness probes in AWS deployment environments.
