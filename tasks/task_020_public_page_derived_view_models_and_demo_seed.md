# Task 020: Public Page Derived View Models and Demo Seed

## Status
Complete

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

## Completion Summary
- Completed on 2026-03-17.
- Extended the public-content contracts and snapshots so the redesign tasks have richer derived data without any schema changes:
  - shared public fundraiser summary shape for cards, highlights, leaderboards, and tabs
  - fundraiser support totals, supporter counts, organizer avatar data, and recent supporter rows
  - community aggregate support stats, fundraiser counts, leaderboard entries, and full fundraiser summaries
  - profile following count, inspired-supporter count, richer fundraiser summaries, and mixed recent-activity entries derived from donation and discussion data
- Added a small application-layer mapper module for consistent conversion from repository snapshots into public DTOs.
- Enriched the prototype catalog with additional supporters, organizer-owned fundraisers, follow relationships, and donation intents so the derived public views have enough density for the upcoming page redesign tasks.
- Updated both the static public-content repository and the Postgres repository to compute the new derived snapshots. While doing this, fixed a joined-row mapping issue in the Postgres adapter where joined public-discussion reads were using content row IDs instead of joined user IDs for actor identity.

## Verification
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/route-handlers.test.ts tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx`
- `npm run build`

## Handoff Notes
- No schema migration was introduced in this task; all new page-facing richness comes from query-time derivation plus richer prototype seed data.
- The existing presentation page models still only consume the earlier subset of fields. Tasks 021 through 023 can now adopt the richer contracts incrementally without needing more application or persistence changes first.
- The derived support totals are based on mocked donation intents and should continue to be labeled as prototype engagement rather than real funds raised until the product explicitly supports a real payment model.
