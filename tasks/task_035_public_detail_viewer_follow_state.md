# Task 035: Public Detail Viewer Follow State

## Status
Complete

## Depends On
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_025_browser_session_cookie_and_demo_login_seed.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`
- `tasks/task_027_public_browse_queries_and_viewer_profile_lookup.md`
- `tasks/task_034_profile_relationship_navigation.md`

## Description
Extend the public profile, community, and fundraiser read pipeline so detail-page queries can accept optional viewer context and return viewer-specific follow metadata without exposing raw owner IDs.

## Expected Files Affected
- `src/application/public-content/**`
- `src/infrastructure/public-content/**`
- `src/infrastructure/persistence/postgres/**`
- `src/presentation/api/public/**`
- `src/app/profiles/**`
- `src/app/communities/**`
- `src/app/fundraisers/**`
- `tests/application/public-content/**`
- `tests/infrastructure/persistence/**`
- `tests/presentation/api/**`

## Acceptance Criteria
- Detail queries accept optional `viewerUserId`.
- Profile, community, and fundraiser detail responses include `viewerFollowState` with anonymous, following, non-following, and self-owned states.
- Public JSON read routes use the existing session cookie/header to populate the same viewer-aware follow state.
- This task does not change visible follow button behavior yet.

## Tests Required
- Application public-content query tests
- Static/Postgres repository tests for viewer follow-state lookup
- Public route-handler tests for additive response payload changes

## Completion Summary
- Completed on 2026-03-18.
- Extended public detail query contracts and repository interfaces so profile, fundraiser, and community lookups accept optional `viewerUserId` context and return `viewerFollowState`.
- Implemented viewer follow-state derivation in both the static demo repository and the Postgres public-content repository, including self-owned target detection without exposing owner ids in public responses.
- Updated public detail query mappers and JSON route handlers so session-aware requests now include viewer-specific follow metadata when a valid browser cookie or session header is present.
- Added repository and route coverage for anonymous, following, and self-owned public detail reads.

## Verification
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/infrastructure/public-content/static-public-content-repository.test.ts tests/presentation/api/route-handlers.test.ts`

## Handoff Notes
- The server-rendered page models do not consume `viewerFollowState` yet; that follow-control wiring is intentionally left for the UI tasks that depend on this read-model work.
- Public detail route handlers now resolve viewer state through `getSession`, so tests and future isolated route setups should provide an `accountAuthRepository` when bypassing the default application factory.
