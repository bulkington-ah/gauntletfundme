# Task 038: Manual Prototype Reset Page

## Status
Complete

## Depends On
- `tasks/task_004_repository_interfaces_and_persistence_adapters.md`
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- `tasks/task_025_browser_session_cookie_and_demo_login_seed.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`
- `tasks/task_035_public_detail_viewer_follow_state.md`
- `tasks/task_036_profile_and_community_follow_controls.md`
- `tasks/task_037_fundraiser_follow_controls.md`

## Description
Remove automatic prototype catalog seeding from persistence bootstrap and replace it with a hidden manual reset flow. This fixes the follow/unfollow refresh regression by ensuring deleted or changed demo rows are not silently reinserted on the next page load, while still preserving an easy way to restore the full demo dataset.

## Expected Files Affected
- `src/application/persistence/**`
- `src/infrastructure/auth/**`
- `src/infrastructure/persistence/postgres/**`
- `src/presentation/api/prototype/**`
- `src/presentation/prototype/**`
- `src/app/api/prototype/**`
- `src/app/prototype/**`
- `src/presentation/home/**`
- `src/presentation/auth/**`
- `src/presentation/profiles/**`
- `src/presentation/communities/**`
- `src/presentation/fundraisers/**`
- `tests/application/persistence/**`
- `tests/infrastructure/auth/**`
- `tests/infrastructure/persistence/**`
- `tests/presentation/api/**`
- `tests/presentation/prototype/**`
- `README.md`

## Acceptance Criteria
- `createPersistenceBootstrapper(...).ensureReady()` is schema/storage-only and no longer repopulates prototype catalog rows.
- A manual hard reset flow restores the prototype catalog and demo login credentials through a dedicated application use case and Postgres adapter.
- A hidden public page exists at `/prototype/reset` with a single `Reset prototype data` button and inline success/error feedback.
- A public `POST /api/prototype/reset` endpoint performs the reset without auth.
- Unfollowing a profile, community, or fundraiser persists across refresh until the manual reset flow is triggered.

## Tests Required
- Application use-case test for `resetPrototypeData`
- Persistence bootstrap and Postgres reset repository tests
- Auth repository regression tests for prototype credentials after manual reset
- Prototype reset API route handler and presentation tests
- Follow persistence regression coverage
- `npm run lint`
- `npm run build`

## Completion Summary
- Completed on 2026-03-18.
- Split persistence bootstrap so core schema and donation storage still initialize automatically, but prototype catalog data is no longer reseeded during repository startup.
- Added a dedicated manual reset path through `resetPrototypeData`, a Postgres reset repository, and shared auth/demo seed helpers so the app can fully restore users, content, follows, donations, reports, sessions, and prototype credentials on demand.
- Patched the reset repository to clear legacy `donation_intents` rows when that older table exists so local databases upgraded from the mocked donation intent flow no longer fail with a foreign-key violation during manual reset.
- Added the hidden `/prototype/reset` page and `POST /api/prototype/reset` endpoint with a client-side button that shows inline success and failure states.
- Updated home, login, and public error-state copy so the public surface no longer points at guaranteed seeded detail pages when the database starts empty.
- Added regression coverage proving follow removals persist across refresh and are only restored after a manual reset.

## Verification
- `npm test -- tests/application/persistence/reset-prototype-data.test.ts tests/infrastructure/persistence/postgres-bootstrap.test.ts tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/infrastructure/auth/postgres-account-auth-repository.test.ts tests/presentation/api/auth-route-handlers.test.ts tests/presentation/api/prototype-route-handlers.test.ts tests/presentation/prototype/prototype-reset-control.test.tsx tests/presentation/prototype/prototype-reset-page.test.tsx tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/e2e/mvp-user-journeys.test.ts`
- `npm test -- tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts tests/presentation/api/prototype-route-handlers.test.ts tests/presentation/prototype/prototype-reset-control.test.tsx`
- `curl -s -i -X POST http://localhost:3000/api/prototype/reset`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The hidden reset surface is intentionally public and unlinked. It is meant for prototype/demo environments only and should be revisited before any production hardening work.
- The runtime now starts with schema-only readiness. Local developers need to visit `/prototype/reset` before expecting the demo catalog or prototype login credentials to exist.
- Older local databases may still contain the pre-task-033 `donation_intents` table. Manual reset now clears that legacy data before removing seeded fundraisers and users.
