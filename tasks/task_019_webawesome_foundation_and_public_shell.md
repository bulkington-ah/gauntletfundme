# Task 019: Web Awesome Foundation and Public Shell

## Status
Complete

## Depends On
- `tasks/task_007_public_profile_page.md`
- `tasks/task_008_public_fundraiser_page.md`
- `tasks/task_009_public_community_page_and_discussion_feed.md`

## Description
Introduce Web Awesome as the shared public-surface design foundation and add a reusable public site shell with a shared navigation bar and responsive mobile menu.

## Expected Files Affected
- `package.json`
- `src/app/**`
- `src/presentation/shared/**`
- `src/presentation/home/**`
- `src/presentation/fundraisers/**`
- `src/presentation/communities/**`
- `src/presentation/profiles/**`
- `src/types/**`
- `tests/presentation/**`
- `docs/plan.md`
- `tasks/task_019_webawesome_foundation_and_public_shell.md`

## Acceptance Criteria
- Web Awesome is installed and theme styles are loaded through the shared app layout.
- A client-side component registry exists for the initial set of shared public components.
- A reusable public shell renders a shared navbar and responsive mobile navigation.
- The home page adopts the new shell and uses the shared visual foundation.
- The existing fundraiser, community, and profile pages render within the shared shell without changing their current product behavior.

## Tests Required
- `npm test -- tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx`
- `npm run build`

## Completion Summary
- Completed on 2026-03-17.
- Added Web Awesome as a dependency and introduced a shared presentation foundation for the public surface:
  - shared Web Awesome registry for the initial component set
  - global Web Awesome style import through the app layout
  - React JSX custom-element typings for TypeScript
  - a reusable `PublicSiteShell` with a shared navbar, shared CTA, and responsive mobile menu
- Reworked the placeholder home page to adopt the new shell and expose the prototype public routes directly.
- Wrapped the existing public fundraiser, community, and profile pages in the shared shell without changing their underlying product behavior, so later redesign tasks can focus on page-specific composition instead of redoing navigation.
- Added Milestone 8 and Tasks 019 through 024 to `docs/plan.md`, and created the corresponding task records so the remaining redesign work is staged one task at a time per the repo workflow.

## Verification
- `npm test -- tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx`
- `npm run build`

## Handoff Notes
- The initial attempt to use Web Awesome’s `awesome` theme failed under the current Next.js/Turbopack build because the theme CSS includes `:state(...)` selectors that this build pipeline does not parse. Task 019 therefore ships on Web Awesome’s default bundled theme entrypoint for compatibility.
- The public shell is intentionally lightweight in this task: shared navigation and shared framing are in place, while the detailed screenshot-driven redesign remains split into Tasks 020 through 024.
