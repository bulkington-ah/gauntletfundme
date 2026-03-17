# Task 014: Moderator Action Flow

## Status
Complete

## Depends On
- `tasks/task_006_ownership_and_authorization_policies.md`
- `tasks/task_009_public_community_page_and_discussion_feed.md`
- `tasks/task_013_reporting_workflow.md`

## Description
Implement moderator and owner report-resolution actions that can hide/remove discussion content or dismiss reports, while preserving auditable report status changes.

## Expected Files Affected
- `src/application/moderation/**`
- `src/application/api/**`
- `src/presentation/api/moderation/**`
- `src/app/api/moderation/**`
- `src/infrastructure/persistence/postgres/**`
- `tests/application/moderation/**`
- `tests/presentation/api/**`
- `tests/infrastructure/persistence/**`
- `README.md`

## Acceptance Criteria
- Only permitted users (owner/moderator/admin) can resolve reports or change moderated content status.
- Resolution actions support `hide`, `remove`, and `dismiss`.
- Public discussion feeds no longer show content once moderation status becomes non-visible.
- Report status updates are persisted for action traceability.

## Tests Required
- Moderation action use-case tests for auth/forbidden/not-found/success paths.
- Moderation route tests for anonymous and moderator resolution paths.
- Repository tests proving moderation status changes affect public feed visibility and report status persistence.

## Notes
- `hide` maps to content `flagged` + report `actioned`.
- `remove` maps to content `removed` + report `actioned`.
- `dismiss` keeps target moderation status unchanged and sets report status to `dismissed`.

## Completion Summary
- Completed on 2026-03-16.
- Added moderation resolution use case:
  - `resolveReport`
  - validates action/report IDs
  - enforces `moderate_content` authorization with owner-aware checks
  - updates target moderation status and report status based on resolution action
- Extended moderation ports with review lookup/write contracts and moderation action enum.
- Wired moderation resolution into `createApplicationApi`.
- Extended Postgres persistence adapter with:
  - `findReportById`
  - `findReportModerationContext`
  - `setModerationStatus`
  - `setReportStatus`
- Added moderation resolution API surface:
  - `POST /api/moderation/reports/actions`
- Expanded tests for:
  - moderation resolution use case behavior
  - moderation route handler behavior
  - repository-level visibility impact after moderation actions
- Updated README implementation summary for moderator action support.

## Verification
- `npm test -- tests/application/moderation/submit-report.test.ts tests/application/moderation/resolve-report.test.ts tests/presentation/api/route-handlers.test.ts tests/presentation/api/auth-route-handlers.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/application/authorization/authorize-protected-action.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Moderator action APIs currently return deterministic status transitions for each action; if future policy needs richer audit history, add a dedicated moderation event table.
- Public discussion visibility is currently controlled by `moderation_status = 'visible'` filters in read queries; future moderation states should update those filters carefully.
