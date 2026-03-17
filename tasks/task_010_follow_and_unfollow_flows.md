# Task 010: Follow and Unfollow Flows

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_006_ownership_and_authorization_policies.md`
- `tasks/task_009_public_community_page_and_discussion_feed.md`

## Description
Implement authenticated follow and unfollow relationships for profiles, fundraisers, and communities with API-level state feedback suitable for updating page-level follower state.

## Expected Files Affected
- `src/application/engagement/**`
- `src/presentation/api/engagement/**`
- `src/app/api/engagement/**`
- `src/infrastructure/persistence/postgres/**`
- `tests/application/engagement/**`
- `tests/presentation/api/**`
- `tests/infrastructure/persistence/**`

## Acceptance Criteria
- Signed-in users can follow and unfollow supported targets.
- Anonymous users are blocked with clear auth guidance.
- Follow/unfollow responses include follower state updates (`following`, `followerCount`) for client refresh behavior.
- Follow persistence remains idempotent and unfollow behavior is idempotent.

## Tests Required
- Use-case tests for follow and unfollow behavior.
- Route handler tests for auth-gated follow and unfollow actions.
- Repository adapter tests for idempotent follow/unfollow persistence behavior.

## Notes
- Unfollow authorization reuses the existing protected action policy entry for follow commands.
- Public pages remain read-focused in this task; interaction controls are exposed via API surfaces for later UI wiring.

## Completion Summary
- Completed on 2026-03-16.
- Added `unfollowTarget` application use case with:
  - auth-gated request handling
  - target resolution by slug and type
  - idempotent follow removal semantics
  - response payload including `removed`, `following`, and `followerCount`
- Extended follow flow response payload to include `following` and `followerCount`.
- Extended engagement persistence port and Postgres adapter with:
  - `removeFollowIfPresent`
  - `countFollowersForTarget`
- Added new unfollow API handler and Next route:
  - `POST /api/engagement/unfollows`
- Updated follow route payload to include follower state/count.
- Added/updated tests for:
  - follow use case response/state behavior
  - unfollow use case behavior
  - presentation route handlers for follow + unfollow
  - Postgres adapter idempotent remove + follower counting
- Updated README implementation summary to reflect both follow and unfollow support.

## Verification
- `npm test -- tests/application/engagement/follow-target.test.ts tests/application/engagement/unfollow-target.test.ts`
- `npm test -- tests/presentation/api/route-handlers.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/auth-route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Follow/unfollow APIs now return enough state for optimistic UI toggles; page-level interactive controls can consume `follow.following` and `follow.followerCount` directly.
- Unfollow remains implemented as a dedicated command endpoint (`/api/engagement/unfollows`) to keep command intent explicit and avoid method overloading at this stage.
