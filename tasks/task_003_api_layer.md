# Task 003: API Layer

## Status
Complete

## Depends On
- `tasks/task_001_project_scaffold.md`
- `tasks/task_002_core_models.md`

## Description
Establish the initial application API layer and route structure that future features will use. This task should introduce application entry points, request and response shapes, and the first route handlers or server actions for safe read access, without implementing the full product UI.

## Expected Files Affected
- `src/presentation/**`
- `src/application/**`
- `src/domain/**` for shared request or response types only if needed
- `src/infrastructure/**`
- `tests/application/**`
- `tests/presentation/**`

## Acceptance Criteria
- The repository has a clear pattern for how presentation code calls application-layer use cases.
- Initial public read routes or handlers exist for resource lookup by slug, even if they return seeded or placeholder data.
- Authorization-aware write entry points are structured but not fully implemented beyond what is needed to prove the pattern.
- Route handlers do not reach directly into infrastructure code without going through application-layer boundaries.
- API naming and module structure align with `docs/architecture.md` and `docs/architecture_rules.md`.

## Tests Required
- Route or handler smoke tests for the initial read endpoints.
- Application-layer tests confirming request orchestration and boundary separation.

## Notes
- Keep this task focused on API structure and boundaries, not finished business workflows.
- Prefer a small number of representative endpoints over a broad incomplete surface.

## Completion Summary
- Completed on 2026-03-16.
- Added application-layer query use cases, DTOs, and ports for public slug-based reads across profiles, fundraisers, and communities, plus an auth-aware `followTarget` command surface that intentionally stops short of persistence.
- Added seeded infrastructure adapters for public content reads and mock session resolution so the API layer can return stable placeholder data without coupling presentation code directly to infrastructure.
- Added presentation-layer API handlers under `src/presentation/api/` and thin Next route files under `src/app/api/` for:
  - `GET /api/public/profiles/[slug]`
  - `GET /api/public/fundraisers/[slug]`
  - `GET /api/public/communities/[slug]`
  - `POST /api/engagement/follows`
- Added targeted application and route smoke tests that cover request orchestration, seeded read responses, and the placeholder auth/write boundary.

## Verification
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/application/engagement/follow-target.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Public read routes currently use static seeded data from `src/infrastructure/demo-data/`; later tasks can replace those adapters with repositories without changing the route contract.
- The follow command is intentionally auth-aware but non-persistent. It returns a placeholder `501` response after validating the viewer and target to prove the command path and authorization boundary.
- The placeholder write route expects the demo session header `x-demo-session`; supported seeded values live in the infrastructure demo data and should be replaced once real auth/session wiring exists.
