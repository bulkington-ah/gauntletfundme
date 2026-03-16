# Task 002: Core Models

## Status
Ready

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
