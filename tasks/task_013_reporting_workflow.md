# Task 013: Reporting Workflow

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_006_ownership_and_authorization_policies.md`
- `tasks/task_011_post_and_comment_creation.md`
- `tasks/task_012_mocked_donation_intent_flow.md`

## Description
Allow authenticated users to submit moderation reports against posts and comments, with persisted report metadata and predictable handling for duplicate submissions.

## Expected Files Affected
- `src/application/moderation/**`
- `src/application/api/**`
- `src/domain/authorization/**`
- `src/presentation/api/moderation/**`
- `src/app/api/moderation/**`
- `src/infrastructure/persistence/postgres/**`
- `tests/application/moderation/**`
- `tests/presentation/api/**`
- `tests/infrastructure/persistence/**`
- `tests/**/authorization/**`

## Acceptance Criteria
- Authenticated users can report posts and comments.
- Invalid target types, missing fields, and missing targets are handled predictably.
- Duplicate reports from the same reporter for the same target are idempotent.
- Reports persist with reason and `submitted` status.

## Tests Required
- Report creation use-case tests for validation/auth/not-found/idempotent behavior.
- Moderation route tests for auth-gated report submission.
- Repository tests for report target lookup and idempotent report persistence.

## Notes
- Reporting auth is now represented explicitly via `report_content` in the centralized authorization policy.
- Report writes are idempotent on `(reporterUserId, targetType, targetId)` at application behavior level by lookup-before-insert semantics.

## Completion Summary
- Completed on 2026-03-16.
- Added a new moderation application module with:
  - report target/write ports
  - `submitReport` use case with validation, auth, target resolution, and idempotent persistence flow
- Extended authorization policy with `report_content` action and unauthenticated messaging.
- Wired reporting into `createApplicationApi` with lazy moderation adapter resolution.
- Extended Postgres adapter with:
  - `findReportTargetById`
  - `createReportIfAbsent`
- Added moderation API route surface:
  - `POST /api/moderation/reports`
- Added/updated tests for:
  - moderation use case behavior
  - route-level unauthorized and success report submission behavior
  - report idempotency in repository adapter
  - authorization policy/action coverage for report submissions
- Updated README summary to include moderation reporting support.

## Verification
- `npm test -- tests/application/moderation/submit-report.test.ts tests/presentation/api/route-handlers.test.ts tests/domain/authorization-policy.test.ts tests/application/authorization/authorize-protected-action.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/auth-route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Report submission currently returns `201` on first report and `200` when a duplicate report is returned idempotently.
- Reports target only `post` and `comment` entities; additional target types require extending domain enums and moderation lookup handling.
