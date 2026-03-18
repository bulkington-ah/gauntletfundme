# Task 026: Dedicated Login Page And Shell Auth State

## Status
Complete

## Depends On
- `tasks/task_025_browser_session_cookie_and_demo_login_seed.md`

## Description
Add a dedicated `/login` page for the seeded prototype accounts and make the shared public shell reflect signed-out versus signed-in browser session state using the existing server-side session lookup use case.

## Expected Files Affected
- `src/app/login/**`
- `src/app/page.tsx`
- `src/app/fundraisers/**`
- `src/app/communities/**`
- `src/app/profiles/**`
- `src/presentation/auth/**`
- `src/presentation/shared/**`
- `src/presentation/home/**`
- `src/presentation/fundraisers/**`
- `src/presentation/communities/**`
- `src/presentation/profiles/**`
- `tests/presentation/auth/**`
- `tests/presentation/shared/**`
- `README.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`

## Acceptance Criteria
- `/login` renders an email/password sign-in form with pending, invalid-credential, and generic request error states.
- Authenticated requests to `/login` redirect away to a safe internal `next` path or `/`.
- The public shell receives an explicit `returnTo` path and shows a sign-in link when anonymous.
- The public shell shows the signed-in viewer role plus a working sign-out control when authenticated.
- Home, fundraiser, community, and profile routes all resolve browser-session viewer state on the server and pass it into the shared shell.
- The README documents the seeded prototype login credentials without exposing them in the UI.

## Tests Required
- `npm test -- tests/presentation/shared/public-site-shell.test.tsx tests/presentation/auth/login-page.test.tsx tests/presentation/auth/login-navigation.test.ts tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`
- Playwright browser validation against the local app for login redirect-back, session cookie creation, and sign-out cookie clearing

## Completion Summary
- Added a dedicated `/login` route backed by a new presentation-layer login page and client form. The form submits to the existing `POST /api/auth/login` endpoint, surfaces invalid credential and generic request errors, and redirects to a sanitized internal `next` path on success.
- Introduced shared presentation helpers for safe login navigation and server-side browser-session viewer lookup, then updated the home, fundraiser, community, and profile route pages to resolve the authenticated viewer through the existing `getSession` application use case before rendering the shared shell.
- Made `PublicSiteShell` auth-aware with an explicit `returnTo` prop, signed-out `Sign in` links, signed-in role badges, and a client-side sign-out button that calls `POST /api/auth/logout` and refreshes the current route. Updated the README to document the real browser cookie flow and the seeded local demo credentials.

## Verification
- `npm test -- tests/presentation/shared/public-site-shell.test.tsx tests/presentation/auth/login-page.test.tsx tests/presentation/auth/login-navigation.test.ts tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`
- Playwright CLI browser validation against `http://127.0.0.1:3010`:
  - opened `/login?next=/fundraisers/warm-meals-2026`
  - signed in with `avery.organizer@example.com` / `Prototype123!`
  - confirmed redirect to `/fundraisers/warm-meals-2026`
  - confirmed organizer shell state and `gofundme_v2_session` cookie presence
  - clicked `Sign out`
  - confirmed the shell returned to `Sign in` state on the same fundraiser page and the cookie list was empty

## Handoff Notes
- The public shell uses only the viewer role for signed-in state as planned; display-name expansion can be added later without changing the transport or route plumbing.
- `npm run lint` still emits the pre-existing `@next/next/no-img-element` warning on the fundraiser hero image, but there are no lint errors and the login flow changes did not introduce new warnings.
- Public signup UI remains intentionally deferred even though the signup API now participates in the same cookie-backed browser session transport as login.
