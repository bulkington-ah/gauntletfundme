# Task 028: Public Fundraisers And Communities Index Pages

## Status
Complete

## Depends On
- `tasks/task_027_public_browse_queries_and_viewer_profile_lookup.md`

## Description
Add top-level `/fundraisers` and `/communities` public browse routes that render responsive card grids of seeded public content using the new public-content list queries.

## Expected Files Affected
- `src/app/fundraisers/page.tsx`
- `src/app/communities/page.tsx`
- `src/presentation/fundraisers/**`
- `src/presentation/communities/**`
- `tests/presentation/fundraisers/**`
- `tests/presentation/communities/**`
- `tasks/task_028_public_fundraisers_and_communities_index_pages.md`

## Acceptance Criteria
- `/fundraisers` renders a public browse page backed by `listPublicFundraisers()`.
- `/communities` renders a public browse page backed by `listPublicCommunities()`.
- Both browse pages use the existing shared public shell and CSS-module styling approach.
- Fundraiser cards link to `/fundraisers/[slug]` and show title, story excerpt, support meta, and organizer/community context.
- Community cards link to `/communities/[slug]` and show name, description, follower/fundraiser counts, and owner context.
- The browse pages stay intentionally simple for v1: no search, sort UI, or filters.

## Tests Required
- `npm test -- tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx`
- `npm run build`

## Completion Summary
- Added new server-rendered browse routes at `/fundraisers` and `/communities`, each resolving the current browser-session viewer and consuming the application-layer list queries from Task 027.
- Implemented dedicated fundraiser and community browse page components with responsive card grids, whole-card links to the seeded detail pages, and lightweight summary stats that fit the existing public-shell styling.
- Added focused presentation tests covering page-model building and the card-link behavior for both browse pages.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx`
- `npm run build`

## Handoff Notes
- The shared navbar still uses the pre-Task-029 items, so these browse pages are currently reachable by direct route even though the simplified nav is not wired yet.
- Browse cards intentionally avoid nested organizer/community links so the whole card remains the primary navigation target, matching the requested click-through behavior.
- Empty states are present but the seeded catalog now has enough data that both pages render populated grids in normal local development.
