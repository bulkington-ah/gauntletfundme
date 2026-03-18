# Task 048: Prototype Reset Clears Supporter Digest Cursor

## Status
Complete

## Depends On
- `tasks/task_038_manual_prototype_reset_page.md`
- `tasks/task_047_supporter_digest_ai.md`

## Description
Patch the manual prototype reset flow so it explicitly clears `supporter_digest_state` during reset. For the current repro date of March 18, 2026, the seeded digest-driving activity from March 16, 2026 is still inside the digest's first-view seven-day window, so clearing the cursor should be enough to make `/digest` repopulate after `/prototype/reset` without changing demo timestamps.

## Expected Files Affected
- `src/infrastructure/persistence/postgres/postgres-prototype-data-reset-repository.ts`
- `tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts`
- `tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`

## Acceptance Criteria
- `PrototypeDataResetRepository.resetPrototypeData()` deletes rows from `supporter_digest_state` when that table exists.
- After a seeded supporter records a digest view and advances `last_viewed_at`, running `/prototype/reset` removes that digest cursor state.
- After reset, a fresh digest query for the seeded supporter returns seeded highlights again instead of the empty "Nothing new yet" state.
- No public route, API, or UI contract changes are introduced for `/prototype/reset`, `/digest`, or `POST /api/engagement/digest-views`.

## Tests Required
- Extend the reset repository persistence test to verify digest state is cleared by reset.
- Add a focused Postgres-backed regression test that:
  1. seeds prototype data
  2. records a digest view for `user_supporter_jordan`
  3. runs reset
  4. confirms `findSupporterDigestStateByUserId("user_supporter_jordan")` returns `null`
  5. confirms the seeded digest query is non-empty again
- Run targeted verification:
  - `npm test -- tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`

## Assumptions
- This is a scoped bug fix, not a broader demo-data freshness change.
- We are intentionally not rebasing prototype seed timestamps in this task.
- A follow-up task can revisit dynamic demo timestamps once the fixed March 16, 2026 seed activity ages out of the digest window.

## Completion Summary
- Completed on 2026-03-18.
- Updated the Postgres prototype reset repository to explicitly delete `supporter_digest_state` during manual reset instead of relying on seeded user deletion to clear digest cursors indirectly.
- Added reset-repository coverage proving a recorded digest cursor for `user_supporter_jordan` is removed by reset.
- Added a Postgres-backed regression test that records a digest view, confirms the digest is empty before reset, runs reset, and verifies the seeded digest returns highlights again afterward.

## Verification
- `npm test -- tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`
- `npm run lint`

## Handoff Notes
- This fix intentionally keeps the prototype catalog timestamps static. It solves the current March 18, 2026 repro by clearing the digest cursor, but a future task may still be needed once the fixed March 16, 2026 seed activity ages out of the digest's seven-day first-view window.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`, unchanged by this task.
