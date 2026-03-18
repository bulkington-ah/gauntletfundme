# Task 044: Fundraiser Supporter Rail Controls

## Status
Complete

## Depends On
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_032_fundraiser_support_progress_bar.md`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Description
Make the public fundraiser supporter rail controls functional so `See all` and `See top` switch the visible donation list, while keeping the supporter list itself scrollable inside the fundraiser sidebar and mobile stacked layout.

## Expected Files Affected
- `src/presentation/fundraisers/public-fundraiser-page.tsx`
- `src/presentation/fundraisers/public-fundraiser-page.module.css`
- `src/presentation/fundraisers/fundraiser-supporter-rail.tsx`
- `tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `tasks/task_044_fundraiser_supporter_rail_controls.md`

## Acceptance Criteria
- The fundraiser page shows the first 3 newest public donations by default in the supporter rail.
- Clicking `See all` reveals the full newest-first donation list without leaving the fundraiser page.
- Clicking `See top` reveals the full donation list sorted by donation amount descending, with newer donations winning amount ties.
- The supporter list scrolls inside a bounded viewport while the footer buttons remain visible.
- The empty supporter state disables both rail buttons instead of leaving inert clickable controls.
- No route, API, domain, repository, or response-contract changes are introduced for this task.

## Tests Required
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm run build`

## Notes
- Keep the fundraiser page server-rendered and isolate the new interaction logic inside a small client component.
- Reuse the existing `recentDonations` presentation contract as the supporter rail data source.
- Treat `See top` as a donation-entry ranking, not a deduped supporter ranking.
- Do not update `docs/plan.md` for this standalone incremental task.

## Completion Summary
- Completed on 2026-03-18.
- Added [fundraiser-supporter-rail.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/fundraiser-supporter-rail.tsx) as a client-side controller for the fundraiser supporter rail so the page can switch between recent, all, and top donation views without converting the full page to a client component.
- Updated [public-fundraiser-page.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.tsx) to replace the inert `See all` and `See top` buttons with the interactive rail component while preserving the existing page model and server-rendered layout.
- Updated [public-fundraiser-page.module.css](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.module.css) with a bounded supporter-list viewport plus active and disabled footer-button states so long donation lists stay scrollable inside the sidebar and stacked mobile layout.
- Extended [public-fundraiser-page.test.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/tests/presentation/fundraisers/public-fundraiser-page.test.tsx) to verify the default recent view, `See all`, `See top`, scroll-container structure, and empty disabled state.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm run build`

## Handoff Notes
- The supporter rail now toggles among three local UI modes: default recent view, full newest-first view, and full top-donation view. Clicking an already-selected rail button returns the list to the default recent view.
- `See top` ranks donation entries by amount rather than collapsing multiple donations from the same supporter into a single aggregate row.
- The supporter rail still relies on the existing `recentDonations` prop ordering for the default and `See all` views, so any future ordering changes should happen in the same presentation contract or be updated here intentionally.
