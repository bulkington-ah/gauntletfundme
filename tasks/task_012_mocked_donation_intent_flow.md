# Task 012: Mocked Donation Intent Flow

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_006_ownership_and_authorization_policies.md`
- `tasks/task_008_public_fundraiser_page.md`
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_011_post_and_comment_creation.md`

## Description
Implement an authenticated, mocked donation intent flow so users can start checkout intent tracking from fundraiser context without introducing real payment collection.

## Expected Files Affected
- `src/application/engagement/**`
- `src/application/api/**`
- `src/presentation/api/engagement/**`
- `src/app/api/engagement/**`
- `src/infrastructure/persistence/postgres/**`
- `tests/application/engagement/**`
- `tests/presentation/api/**`
- `tests/infrastructure/persistence/**`

## Acceptance Criteria
- Authenticated users can start a donation intent for a fundraiser.
- Anonymous users are blocked with clear authentication guidance.
- Donation intent metadata persists with mocked `started` status and does not collect payment details.
- API responses clearly indicate mocked checkout intent behavior.

## Tests Required
- Donation intent use-case tests for validation/auth/not-found/success.
- Route tests for auth-gated donation intent creation behavior.
- Repository tests validating donation intent persistence and fundraiser count impact.

## Notes
- This flow intentionally models checkout initiation only and never processes payment data.
- Existing public fundraiser read models continue to surface aggregate `donationIntentCount`.

## Completion Summary
- Completed on 2026-03-16.
- Added `startDonationIntent` engagement use case with:
  - fundraiser slug + amount validation
  - auth gating via centralized `create_donation_intent` authorization
  - fundraiser lookup and donation intent persistence
  - success payload containing mocked checkout marker and created intent metadata
- Extended engagement ports with dedicated donation intent lookup/write interfaces.
- Wired donation intent command into `createApplicationApi` with lazy adapter resolution.
- Extended Postgres persistence adapter with:
  - `findFundraiserBySlugForDonationIntent`
  - `createDonationIntent`
- Added presentation + app route wiring for:
  - `POST /api/engagement/donation-intents`
- Added/updated tests for:
  - application donation intent use case
  - presentation donation intent route handling
  - repository donation intent persistence and fundraiser count aggregation
- Updated README implementation summary to include mocked donation intent command support.

## Verification
- `npm test -- tests/application/engagement/start-donation-intent.test.ts tests/presentation/api/route-handlers.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/auth-route-handlers.test.ts tests/application/engagement/follow-target.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Donation intent creation currently expects API clients to send the `x-session-token` header plus fundraiser slug and amount payload.
- The response includes `meta.mockedCheckout: true` to make mocked intent semantics explicit for any future frontend integration.
