# Task 017: MVP End-to-End Validation and Polish

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_011_post_and_comment_creation.md`
- `tasks/task_012_mocked_donation_intent_flow.md`
- `tasks/task_013_reporting_workflow.md`
- `tasks/task_014_moderator_action_flow.md`
- `tasks/task_015_analytics_instrumentation.md`
- `tasks/task_016_deployment_baseline_and_production_hardening.md`

## Description
Validate the end-to-end MVP journey flow and apply final polish documentation for known limitations and integration expectations.

## Expected Files Affected
- `tests/e2e/**`
- `README.md`
- `tasks/**`

## Acceptance Criteria
- Main journey is covered end-to-end across browse/authenticated engagement/moderation lifecycle.
- Regression checks pass for previously completed milestone features.
- Remaining scope limits are documented clearly for handoff/demo readiness.

## Tests Required
- E2E test for main user flow.
- Full regression suite (`test`, `lint`, `build`).

## Notes
- E2E uses pg-mem-backed persistence with seeded catalog data plus static demo sessions to validate integrated flow behavior.

## Completion Summary
- Completed on 2026-03-16.
- Added a new end-to-end journey test:
  - `tests/e2e/mvp-user-journeys.test.ts`
  - covers public browse, follow, comment, donation intent start, report submission, moderator resolution, and public visibility revalidation
- Added README polish section for known MVP limitations:
  - header-based auth integration caveat
  - mocked payment boundary
  - no-op analytics provider default
  - moderation history scope cut
- Re-ran full regression checks for all completed milestone flows.

## Verification
- `npm test -- tests/e2e/mvp-user-journeys.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The end-to-end flow is currently validated at application API level (with real persistence adapters in pg-mem) rather than browser-automation level.
- If future browser E2E tooling is introduced (Playwright/Cypress), this test can serve as the canonical journey blueprint.
