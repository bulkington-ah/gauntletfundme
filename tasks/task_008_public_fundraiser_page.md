# Task 008: Public Fundraiser Page

## Status
Complete

## Depends On
- `tasks/task_003_api_layer.md`
- `tasks/task_004_repository_interfaces_and_persistence_adapters.md`
- `tasks/task_007_public_profile_page.md`

## Description
Implement the public fundraiser page experience with organizer context, campaign story content, progress signals, and a clearly mocked donation entry point.

## Expected Files Affected
- `src/app/fundraisers/**`
- `src/presentation/fundraisers/**`
- `tests/presentation/fundraisers/**`
- `tests/application/public-content/**` (fundraiser query coverage)

## Acceptance Criteria
- A fundraiser can be fetched by slug and rendered on a public page.
- The page shows organizer context and campaign story content.
- Progress information is visible in a prototype-safe way.
- A donation entry point is clearly marked as mocked and non-payment.
- Connected profile/community links are visible when available.

## Tests Required
- Fundraiser page render tests for success and failure states.
- Application fundraiser query tests validating mapping behavior.

## Notes
- Donation entry is intentionally mocked and represented as a visible CTA and explanatory copy.
- Progress uses prototype-safe engagement signals (`donationIntentCount`) rather than real payment totals.

## Completion Summary
- Completed on 2026-03-16.
- Added a presentation fundraisers module with:
  - `buildPublicFundraiserPageModel` for slug-based page model resolution
  - `PublicFundraiserPage` component handling success, invalid request, and not-found states
- Added a new Next.js route page at `/fundraisers/[slug]` that fetches fundraiser data via the application API and renders the public fundraiser page model.
- Success rendering now includes:
  - fundraiser story and status/goal context
  - organizer context with optional organizer profile link
  - connected community link when present
  - prototype progress section using mocked donation intent counts
  - clearly mocked donation CTA (`Start mocked donation`) with explicit non-payment messaging
- Expanded application query tests to cover success mapping for fundraiser organizer/community context.
- Added presentation tests for:
  - fundraiser page model construction
  - success rendering with mocked donation entry
  - invalid/not-found states

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/application/public-content/public-content-queries.test.ts tests/presentation/profiles/public-profile-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The mocked donation CTA currently links to a querystring marker (`?checkout=mock`) as a visible placeholder until the dedicated donation intent surface is expanded in later tasks.
- The page keeps presentation logic in the presentation layer and reuses existing public-content application queries to preserve architecture boundaries.
