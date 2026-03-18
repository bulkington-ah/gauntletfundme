# Task 033: Real System-Wide Donation Flow

## Status
Complete

## Depends On
- `tasks/task_012_mocked_donation_intent_flow.md`
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_022_public_community_page_webawesome_redesign.md`
- `tasks/task_023_public_profile_page_webawesome_redesign.md`
- `tasks/task_032_fundraiser_support_progress_bar.md`

## Description
Replace the prototype donation intent behavior with a real persisted donation flow where supporters enter an amount, submit a donation immediately, and see the resulting donation data reflected across the fundraiser, community, and profile surfaces. The payment processor remains mocked, but donation persistence and read models become real system behavior.

## Expected Files Affected
- `docs/**`
- `src/application/**`
- `src/domain/**`
- `src/infrastructure/**`
- `src/presentation/**`
- `src/app/api/engagement/**`
- `tests/**`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Acceptance Criteria
- Clicking `Donate now` reveals a fundraiser amount form instead of linking to the old mock checkout query param.
- Submitting a valid amount creates a completed donation immediately without collecting real payment details.
- Donations persist to the database and update fundraiser totals, recent supporters, community stats, and public profile activity from database-backed reads.
- Public contracts, DTOs, and presentation copy use donation terminology rather than donation-intent terminology.
- The canonical write endpoint is `POST /api/engagement/donations`, while `POST /api/engagement/donation-intents` remains as a temporary compatibility alias.

## Tests Required
- Donation use-case tests
- Route tests for canonical and alias donation submission endpoints
- Repository tests covering persistence, aggregates, and legacy backfill
- Presentation tests for the fundraiser donation form
- End-to-end regression coverage for system-wide donation propagation

## Completion Summary
- Replaced the mocked donation-intent language in the source-of-truth docs with real donation semantics, added Task 033 to the implementation plan, and recorded this task as the scoped follow-up to Task 012.
- Introduced a real `Donation` domain model plus a canonical `submitDonation` application flow and `POST /api/engagement/donations` route, while keeping the legacy `/api/engagement/donation-intents` path as a compatibility alias to the same persisted donation behavior.
- Moved persistence, seed data, and public read models onto a real `donations` table with bootstrap-time legacy backfill from `donation_intents`, then updated fundraiser, community, and profile presentation layers to read database-backed donation totals, supporter activity, and recent donation feeds.
- Replaced the fundraiser mock checkout CTA with an inline amount form that submits completed donations, refreshes server-rendered totals, and surfaces validation, auth, and success states in the UI.

## Verification
- `npm test -- tests/application/engagement/start-donation-intent.test.ts tests/domain/core-models.test.ts tests/application/public-content/public-content-queries.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/presentation/api/route-handlers.test.ts tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test -- tests/application/analytics/event-contracts.test.ts tests/domain/authorization-policy.test.ts tests/presentation/api/auth-route-handlers.test.ts tests/presentation/communities/public-community-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/e2e/mvp-user-journeys.test.ts`
- `npm test -- tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/e2e/mvp-user-journeys.test.ts`
- `npm test -- tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`
- `npm test`

## Handoff Notes
- The legacy `startDonationIntent` application API and `/api/engagement/donation-intents` route are still present as compatibility shims; new code should use `submitDonation` and `/api/engagement/donations`.
- The persistence bootstrapper now backfills legacy `donation_intents` rows into `donations` during startup; the regression test in `tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts` covers that path.
- `npm run lint` passes with one existing `@next/next/no-img-element` warning on the fundraiser hero image in `src/presentation/fundraisers/public-fundraiser-page.tsx`.
