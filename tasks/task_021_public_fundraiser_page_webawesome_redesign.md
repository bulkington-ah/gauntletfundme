# Task 021: Public Fundraiser Page Web Awesome Redesign

## Status
Pending

## Depends On
- `tasks/task_019_webawesome_foundation_and_public_shell.md`
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`

## Description
Rebuild the public fundraiser page to match the approved reference more closely using the shared shell, Web Awesome primitives, and CSS modules.

## Expected Files Affected
- `src/presentation/fundraisers/**`
- `src/presentation/shared/**`
- `public/**`
- `tests/presentation/fundraisers/**`
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`

## Acceptance Criteria
- The fundraiser page uses a two-column layout with a large media area and sticky support sidebar on desktop.
- Donate entry remains functional through the existing mocked checkout flow.
- Organizer and connected community links remain functional.
- Unsupported interactions remain visually present but non-misleading.

## Tests Required
- targeted fundraiser presentation tests
- `npm run build`
