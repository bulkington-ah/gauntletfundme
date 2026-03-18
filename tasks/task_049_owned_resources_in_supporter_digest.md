# Task 049: Owned Resources In Supporter Digest

## Status
Complete

## Depends On
- `tasks/task_047_supporter_digest_ai.md`
- `tasks/task_048_prototype_reset_clears_supporter_digest_cursor.md`

## Description
Expand supporter digest sourcing so authenticated viewers see digest highlights for owned fundraisers and communities in addition to explicitly followed ones. This keeps self-follow forbidden for profile, fundraiser, and community relationships while making organizer accounts receive meaningful digest updates about the resources they run.

## Expected Files Affected
- `src/infrastructure/persistence/postgres/postgres-public-content-engagement-repository.ts`
- `tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`

## Acceptance Criteria
- Digest fundraiser activity includes fundraisers the viewer owns, even if the viewer does not follow them.
- Digest community organizer updates and discussion bursts include communities the viewer owns, even if the viewer does not follow them.
- Existing self-follow restrictions and viewer follow-state behavior remain unchanged for public pages and follow controls.
- Seeded organizer account `avery.organizer@example.com` receives a non-empty digest after prototype reset without requiring synthetic self-follow rows.

## Tests Required
- Update Postgres digest query coverage to reflect followed-or-owned sourcing.
- Add a Postgres-backed regression test proving the organizer seed account gets digest highlights from owned fundraiser and community activity.
- Run targeted verification:
  - `npm test -- tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/application/engagement/supporter-digest.test.ts`

## Assumptions
- This is a digest-sourcing change only; it does not alter follow permissions, follower counts, or public follow-state presentation.
- Owned resources should behave as implicit digest subscriptions for their organizer.

## Completion Summary
- Completed on 2026-03-18.
- Expanded the Postgres-backed digest source queries so fundraisers and communities owned by the current viewer are treated as implicit digest sources alongside explicit follows.
- Preserved the existing self-follow rules and public follow-state behavior, so organizer-owned targets still render as owned instead of followed and follower counts remain unchanged.
- Added a Postgres-backed organizer regression proving Avery receives digest highlights from owned fundraiser and community activity without self-follow rows.

## Verification
- `npm test -- tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/application/engagement/supporter-digest.test.ts`
- `npm run lint`

## Handoff Notes
- This change is intentionally limited to digest sourcing. Owners still cannot explicitly follow their own profile, fundraiser, or community.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`, unchanged by this task.
