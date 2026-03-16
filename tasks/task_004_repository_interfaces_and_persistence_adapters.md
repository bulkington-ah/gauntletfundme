# Task 004: Repository Interfaces and Persistence Adapters

## Status
Complete

## Depends On
- `tasks/task_002_core_models.md`
- `tasks/task_003_api_layer.md`

## Description
Introduce repository interfaces at the application boundary and provide infrastructure persistence adapters that support the current read and follow-write flows while preserving modular layer boundaries.

## Expected Files Affected
- `src/application/**`
- `src/infrastructure/persistence/**`
- `src/presentation/api/**`
- `tests/application/**`
- `tests/infrastructure/**`
- `tests/presentation/**`
- `README.md`

## Acceptance Criteria
- Core read and write access patterns are abstracted behind application-facing repository interfaces.
- Infrastructure adapters implement repository behavior without leaking database details into presentation or domain.
- Public read flows run through repository adapters.
- Follow writes are persisted with idempotent behavior and self-follow protection.
- Runtime persistence uses a PostgreSQL connection configured by environment.

## Tests Required
- Application tests for follow orchestration and guardrails.
- Infrastructure adapter tests for repository behavior.
- Route handler tests for HTTP contract mapping.

## Notes
- This task keeps auth session lookup on the static demo gateway until the authentication milestone introduces real session persistence.
- Prototype catalog data is used as bootstrap seed content for local persistence setup.

## Completion Summary
- Completed on 2026-03-16.
- Added application-layer repository interface surfaces, including module-oriented persistence ports and expanded engagement ports for follow ownership lookup and idempotent follow creation.
- Added PostgreSQL persistence infrastructure using `pg`, including:
  - environment-backed pool creation via `DATABASE_URL`
  - bootstrap flow that creates schema when missing and seeds prototype catalog data
  - a Postgres adapter that powers public profile/fundraiser/community reads and follow lookups/writes
- Updated application composition to default to the new Postgres adapter while still allowing explicit dependency injection for tests.
- Converted follow use-case behavior from placeholder `not_implemented` to persisted behavior with:
  - `success` result carrying follow id and creation state
  - `forbidden` for self-follow attempts
  - idempotent writes via repository-level `createFollowIfAbsent`
- Updated presentation follow route contract to return:
  - `201` for new follows
  - `200` for already-following requests
  - `403` for self-follow attempts
- Added lazy API composition in presentation to avoid eager runtime bootstrapping during test module imports.
- Added infrastructure integration tests for the Postgres adapter using `pg-mem`.
- Added environment documentation and `.env.example` for `DATABASE_URL`.

## Verification
- `npm test -- tests/application/engagement/follow-target.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Runtime now expects `DATABASE_URL`; if it is missing, the default application composition will throw during first repository usage.
- Session resolution remains intentionally static (`x-demo-session`) until the authentication milestone introduces real session storage.
- Bootstrap seeding is idempotent by primary key and intended for prototype/dev flows; production migration and seed strategy should be revisited before deployment hardening.
