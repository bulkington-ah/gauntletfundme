# Task 025: Browser Session Cookie And Demo Login Seed

## Status
Complete

## Depends On
- `tasks/task_024_playwright_public_surface_validation_and_polish.md`

## Description
Add a real browser-session transport for the existing native auth flow, make protected write routes accept cookie-backed sessions, and seed reusable demo login credentials for the prototype catalog users.

## Expected Files Affected
- `src/presentation/auth/**`
- `src/presentation/api/auth/**`
- `src/presentation/api/discussion/**`
- `src/presentation/api/engagement/**`
- `src/presentation/api/moderation/**`
- `src/infrastructure/auth/**`
- `tests/presentation/api/**`
- `tests/infrastructure/auth/**`
- `tasks/task_025_browser_session_cookie_and_demo_login_seed.md`

## Acceptance Criteria
- `POST /api/auth/login` sets the `gofundme_v2_session` cookie on success while preserving the existing JSON response body.
- `POST /api/auth/logout` clears the browser session cookie and accepts either the cookie or the `x-session-token` header.
- `GET /api/auth/session` prefers the browser session cookie and falls back to the `x-session-token` header.
- Protected write route handlers accept browser-session cookies in addition to the existing header transport.
- Demo login credentials exist for Avery, Jordan, and Morgan with the shared prototype password `Prototype123!`.

## Tests Required
- `npm test -- tests/presentation/api/auth-route-handlers.test.ts tests/presentation/api/route-handlers.test.ts tests/infrastructure/auth/postgres-account-auth-repository.test.ts`
- `npm run build`

## Completion Summary
- Added a shared presentation-layer browser session contract for the `gofundme_v2_session` cookie, including cookie creation, clearing, and request token resolution that prefers cookies before falling back to the legacy `x-session-token` header.
- Updated the auth JSON route handlers so login and signup now set the browser session cookie, logout clears it, and session lookup reads from the new shared resolver. Updated all protected discussion, engagement, and moderation write handlers to use the same cookie-aware token resolution path without changing their response contracts.
- Extended the Postgres auth repository bootstrap to seed idempotent demo credentials for the existing prototype users Avery, Jordan, and Morgan with the shared password `Prototype123!`, and tightened auth schema initialization so repeated repository instances do not rerun the auth DDL unnecessarily.

## Verification
- `npm test -- tests/presentation/api/auth-route-handlers.test.ts tests/presentation/api/route-handlers.test.ts tests/infrastructure/auth/postgres-account-auth-repository.test.ts`
- `npm run build`

## Handoff Notes
- The legacy `x-session-token` header remains supported so existing tests and internal callers continue to work while the browser flow migrates to cookies in Task 026.
- The demo credentials are seeded in infrastructure and should be documented for local development in the README during the login-page task, but they are intentionally not surfaced in any public UI.
- Signup now also sets the browser session cookie for transport consistency, even though this rollout does not add a public signup page.
