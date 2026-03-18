# Task 046: Real Analytics Persistence, Historical Backfill, and Public Dashboard

## Status
Complete

## Depends On
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_011_post_and_comment_creation.md`
- `tasks/task_015_analytics_instrumentation.md`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Description
Replace the default no-op analytics publisher with real Postgres-backed event persistence, add unfollow analytics coverage, and backfill historical analytics from persisted seeded data so the public unlinked `/analytics` dashboard is populated immediately with meaningful prototype history.

## Expected Files Affected
- `docs/plan.md`
- `src/application/analytics/**`
- `src/application/api/**`
- `src/application/engagement/**`
- `src/infrastructure/analytics/**`
- `src/infrastructure/persistence/**`
- `src/infrastructure/index.ts`
- `src/app/analytics/**`
- `src/presentation/analytics/**`
- `tests/application/analytics/**`
- `tests/application/engagement/**`
- `tests/infrastructure/**`
- `tests/presentation/**`
- `README.md`
- `tasks/task_046_real_analytics_persistence_historical_backfill_and_public_dashboard.md`

## Acceptance Criteria
- Default runtime analytics writes persist to Postgres instead of the current no-op adapter.
- Analytics persistence remains best-effort and does not fail page loads, follows, unfollows, comments, posts, or donations when analytics storage is unavailable.
- Existing analytics events for page views, follows, posts, comments, and completed donations keep their current names and payload contracts.
- Unfollow commands emit a new `engagement.unfollow.completed` event with payload `viewerUserId`, `targetType`, `targetSlug`, `removed`, and `followerCount`.
- Historical backfill populates analytics events for persisted `follows`, `posts`, `comments`, and `donations` using their original `created_at` timestamps so seeded prototype data appears on `/analytics` immediately.
- Historical backfill is idempotent and safe to run repeatedly without duplicate analytics rows.
- Historical backfill does not invent page-view or unfollow history because those events are not derivable from persisted source records.
- Backfilled follow events compute `followerCount` as of each follow row’s `created_at`, not the final present-day follower total.
- The `/analytics` dashboard is reachable without auth, is not linked from site navigation, and shows total event volume, grouped counts by event name, latest event timestamps, and the newest 100 stored events with verbatim payloads.
- The dashboard stores and displays fine-grained event timestamps, not day-only dates.

## Tests Required
- Analytics event contract tests covering the new unfollow event.
- Unfollow use-case tests asserting analytics publication on successful commands.
- Infrastructure tests for analytics schema creation, idempotent historical backfill, backfilled timestamp preservation, follower-count reconstruction for backfilled follows, grouped dashboard queries, and recent-event ordering and limits.
- Presentation tests for the `/analytics` dashboard rendering summary metrics and verbatim raw events.
- Full regression checks with `npm test`, `npm run lint`, and `npm run build`.

## Notes
- Historical backfill is derived from persisted source tables, not hard-coded synthetic analytics rows, so it works for seeded data and any existing persisted posts, comments, follows, or donations.
- `analytics_events` stores `id`, `name`, `payload`, `occurred_at`, `source_table`, and `source_record_id`, with a unique backfill index on `(name, source_table, source_record_id)` to keep replay idempotent.
- Live runtime analytics events use fresh IDs and null source metadata; only backfilled rows set `source_table` and `source_record_id`.
- The dashboard is HTML-only in this task; no separate JSON analytics endpoint was added.

## Completion Summary
- Completed on 2026-03-18.
- Replaced the default runtime analytics wiring in `createApplicationApi` with a lazy Postgres-backed repository wrapped in best-effort error handling so public reads and protected writes now persist analytics without breaking core product behavior when analytics storage fails.
- Added a real analytics repository in `src/infrastructure/analytics/` that:
  - creates and queries the `analytics_events` store
  - backfills historical follow, post, comment, and donation events from persisted source tables
  - preserves full source timestamps
  - reconstructs follower counts incrementally for backfilled follow events
- Added `engagement.unfollow.completed` event support and instrumented the unfollow application use case.
- Added a public unlinked `/analytics` dashboard page under `src/app/analytics/` and `src/presentation/analytics/` that renders summary metrics, grouped event counts, and the newest 100 verbatim events.
- Extended prototype reset behavior so resetting the seeded dataset also restores the historical analytics backfill immediately.
- Updated README and the roadmap note in `docs/plan.md` to reflect real analytics persistence and the new dashboard.

## Verification
- `npm test -- tests/application/analytics/event-contracts.test.ts tests/application/engagement/unfollow-target.test.ts tests/infrastructure/analytics/postgres-analytics-repository.test.ts tests/infrastructure/persistence/core-schema.test.ts tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts tests/presentation/analytics/public-analytics-dashboard-page.test.tsx tests/presentation/api/route-handlers.test.ts tests/e2e/mvp-user-journeys.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Historical analytics backfill currently reconstructs follows, posts, comments, and donations; page views and unfollows only exist from the moment real analytics persistence is enabled because there is no trustworthy persisted source history for them.
- The `/analytics` page intentionally remains public and renders stored payloads verbatim, including identifiers already present in the analytics contracts.
- `npm run lint` still reports the existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`; this task did not change that file.
