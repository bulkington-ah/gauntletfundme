# Task 020: Public Page Derived View Models and Demo Seed

## Status
Pending

## Depends On
- `tasks/task_019_webawesome_foundation_and_public_shell.md`

## Description
Expand public-content query responses and demo seed density so redesigned public pages can render richer stats, lists, and highlights without schema changes.

## Expected Files Affected
- `src/application/**`
- `src/infrastructure/persistence/**`
- `src/infrastructure/demo-data/**`
- `tests/application/**`
- `tests/infrastructure/**`
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`

## Acceptance Criteria
- Public fundraiser, community, and profile responses expose the derived stats required by the redesign.
- A shared fundraiser summary shape is introduced where the same data is reused across pages.
- Demo seed data is rich enough to populate supporter lists, leaderboard entries, profile highlights, and activity sections.
- No schema migration is introduced for this task.

## Tests Required
- targeted public-content application tests
- targeted Postgres repository integration tests
