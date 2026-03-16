# Task 002: Core Models

## Status
Complete

## Depends On
- `tasks/task_001_project_scaffold.md`

## Description
Define the first-pass domain types and persistence schema for the MVP's core entities: `User`, `UserProfile`, `Fundraiser`, `Community`, `Post`, `Comment`, `Follow`, `DonationIntent`, and `Report`.

## Expected Files Affected
- `src/domain/**`
- `src/infrastructure/persistence/**`
- schema or migration files
- `tests/domain/**`
- `tests/infrastructure/**`

## Acceptance Criteria
- All core entities from `docs/product_spec.md` exist in both domain and persistence form.
- The schema supports ownership, content status, moderation status, and polymorphic follow targets.
- Roles support at least `supporter`, `organizer`, `moderator`, and `admin`.
- Naming and module placement follow `docs/architecture_rules.md`.
- The task does not yet expose public HTTP endpoints or page-level product experiences.

## Tests Required
- Domain model tests covering basic invariants and type expectations.
- Persistence smoke tests validating schema creation or repository-level setup.

## Notes
- Prefer explicit enums for target types and content status fields.
- Keep mocked donation intent data clearly separated from real payment concerns.

## Completion Summary
- Completed on 2026-03-16.
- Added first-pass domain modules for `accounts`, `profiles`, `fundraisers`, `communities`, `discussion`, `engagement`, and `moderation`, each with explicit entity types, enum-backed statuses, and small creation helpers that enforce basic invariants.
- Added a Postgres-flavored core schema under `src/infrastructure/persistence/schema/core-schema.sql` covering `User`, `UserProfile`, `Fundraiser`, `Community`, `Post`, `Comment`, `Follow`, `DonationIntent`, and `Report`, including ownership foreign keys, moderation status fields, and polymorphic follow/report target enums.
- Added infrastructure record types in `src/infrastructure/persistence/records.ts` so the persistence layer mirrors the domain model shape cleanly for later repository work.
- Added targeted Vitest coverage for domain invariants and persistence schema smoke checks.

## Verification
- `npm test -- tests/domain/core-models.test.ts tests/infrastructure/persistence/core-schema.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The persistence schema is intentionally limited to enum and table definitions; no repositories or live database wiring were added in this task.
- `core-schema.sql` uses PostgreSQL-style enums and `TIMESTAMPTZ`, which matches the architecture direction toward a managed relational database and can be converted into migrations in a later persistence task.
- The next task can build application read models or repositories against the exported domain and persistence surfaces without changing presentation code.
