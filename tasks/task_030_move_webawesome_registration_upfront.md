# Task 030: Move Web Awesome Registration Upfront

## Status
Complete

## Depends On
- `tasks/task_019_webawesome_foundation_and_public_shell.md`

## Description
Move Web Awesome component registration out of `useEffect()` so registration starts at client-module load time instead of waiting until after the first render, reducing hydration-timing risk on the public pages.

## Expected Files Affected
- `src/presentation/shared/webawesome-registry.tsx`
- `tasks/task_030_move_webawesome_registration_upfront.md`

## Acceptance Criteria
- Web Awesome registration no longer waits for `useEffect()` before starting.
- The shared layout and public pages continue to build and render without changing page markup.
- Existing presentation, build, and lint checks continue to pass.
- Any environment caveat discovered during verification is documented in handoff notes rather than widening scope.

## Tests Required
- `npm test -- tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/shared/public-site-shell.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Completion Summary
- Updated the shared Web Awesome bootstrap so registration is kicked off at client-module load time instead of inside `useEffect()`, keeping the change isolated to the presentation-layer registry.
- Preserved dynamic imports under a browser-only guard rather than switching to unconditional static imports, because direct top-level Web Awesome imports caused Node build failures and jsdom runtime errors during verification.
- Added a narrow jsdom guard so presentation tests continue to exercise the existing page markup without trying to boot unsupported custom-element internals in the test environment.

## Verification
- `npm test -- tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/shared/public-site-shell.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The working implementation is "upfront registration at module load with a browser guard", not unconditional static side-effect imports. That keeps registration earlier than `useEffect()` while avoiding `MutationObserver` / `ResizeObserver` / `ElementInternals` issues in Node and jsdom.
- A real-browser hydration recheck against the user's existing local `next dev` instance could not be conclusively automated from this environment, so any remaining hydration overlay should be revalidated manually in the user's browser before widening scope to component wrappers or markup changes.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning on the fundraiser hero image.
