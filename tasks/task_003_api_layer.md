# Task 003: API Layer

## Status
Ready

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
