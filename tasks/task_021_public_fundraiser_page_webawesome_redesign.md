# Task 021: Public Fundraiser Page Web Awesome Redesign

## Status
Complete

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

## Completion Summary
- Completed on 2026-03-17.
- Rebuilt the public fundraiser page in [src/presentation/fundraisers/public-fundraiser-page.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.tsx) to use the shared public shell, CSS modules, and the richer Task 020 fundraiser response fields.
- Replaced the old inline-style scaffold with a screenshot-inspired two-column layout: oversized title, large hero media frame, organizer strip, long-form story section, bottom action row, gradient promo band, and a sticky support sidebar.
- Kept the functional product paths intact:
  - Donate entry still points to the existing mocked checkout route
  - organizer and community links still navigate to their connected public pages
  - unsupported actions such as Share, React, and supporter sorting remain visual placeholders only
- Added a repo-owned local hero illustration in [public/fundraiser-hero-warm-meals.svg](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/public/fundraiser-hero-warm-meals.svg) so the fundraiser page no longer depends on external imagery.
- Restyled the invalid-request and not-found states inside the same shell so the page no longer falls back to the earlier plain white cards.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm run build`

## Handoff Notes
- The redesigned fundraiser page now consumes the richer support metrics and recent supporter feed added in Task 020, but it still labels those metrics as prototype support activity rather than real payments.
- The shared navbar and shell remain unchanged in this task; Tasks 022 and 023 can reuse the same foundation while adopting page-specific layouts for community and profile.
- Playwright-based browser validation and responsive polish are still planned for Task 024, so any cross-page visual tuning should wait for that final pass unless a blocker is discovered sooner.
