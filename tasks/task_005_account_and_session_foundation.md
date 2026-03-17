# Task 005: Account and Session Foundation

## Status
Complete

## Depends On
- `tasks/task_004_repository_interfaces_and_persistence_adapters.md`

## Description
Implement the first-pass account and session foundation for MVP auth flows, including sign up, login, logout, and session lookup, and wire role-aware identity to application use cases that require authentication.

## Expected Files Affected
- `src/application/accounts/**`
- `src/infrastructure/auth/**`
- `src/presentation/api/**`
- `src/app/api/**`
- `tests/application/**/accounts/**`
- `tests/infrastructure/auth/**`
- `tests/presentation/**`

## Acceptance Criteria
- Users can create accounts and receive sessions.
- Users can login with credentials and receive sessions.
- Users can logout and invalidate sessions.
- Session lookup resolves authenticated identity by token.
- Protected use cases can consume role-aware viewer identity through a shared session gateway.
- Roles remain constrained to `supporter`, `organizer`, `moderator`, and `admin`.

## Tests Required
- Auth flow tests for sign up, login, logout, and session lookup.
- Authorization-adjacent tests proving protected use cases resolve identity via the auth-backed session gateway.

## Notes
- This task introduces foundational auth behavior and intentionally does not add full cookie/session middleware yet.
- Protected routes currently consume explicit session tokens from the `x-session-token` header.

## Completion Summary
- Completed on 2026-03-16.
- Added an `application/accounts` module with explicit contracts, ports, and use cases for `signUp`, `login`, `logout`, and `getSession`.
- Added a Postgres-backed auth adapter in infrastructure that:
  - reads and writes users
  - stores password credentials with scrypt hashing
  - creates and invalidates session tokens
  - resolves session tokens to role-aware viewer identities
- Added auth schema support (`auth_credentials`, `auth_sessions`) and loader exports under `src/infrastructure/auth/schema/`.
- Updated the application composition root to expose auth entry points and default session lookup to the Postgres auth adapter.
- Added presentation-layer auth route handlers and Next.js route files for:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/session`
- Switched protected follow routing to use `x-session-token` instead of the earlier demo header and updated response metadata accordingly.
- Added targeted application, infrastructure, and presentation tests for auth flows and session-backed route behavior.

## Verification
- `npm test -- tests/application/accounts/auth-flows.test.ts tests/infrastructure/auth/postgres-account-auth-repository.test.ts tests/presentation/api/auth-route-handlers.test.ts tests/presentation/api/route-handlers.test.ts tests/application/engagement/follow-target.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Session token transport is currently header-based (`x-session-token`) for API clarity and testability; cookie/session middleware can be layered in later without changing application use-case contracts.
- Password hashing uses Node `scrypt` in the auth adapter; credential policy remains intentionally minimal for MVP.
- The static demo session gateway still exists for focused tests and backward-compatible stubbing, but runtime auth now defaults to the Postgres-backed repository.
