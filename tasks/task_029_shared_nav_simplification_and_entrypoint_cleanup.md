# Task 029: Shared Nav Simplification And Entrypoint Cleanup

## Status
Complete

## Depends On
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`
- `tasks/task_027_public_browse_queries_and_viewer_profile_lookup.md`
- `tasks/task_028_public_fundraisers_and_communities_index_pages.md`

## Description
Simplify the shared public navbar to the approved `Profile` / `Communities` / `Fundraisers` / `Sign in` or `Sign out` model, hide `Profile` when no public profile slug exists for the signed-in viewer, and update home-page discovery entry points to target the new browse pages.

## Expected Files Affected
- `src/app/**`
- `src/presentation/auth/**`
- `src/presentation/shared/**`
- `src/presentation/home/**`
- `src/presentation/fundraisers/**`
- `src/presentation/communities/**`
- `src/presentation/profiles/**`
- `tests/presentation/**`
- `tests/presentation/api/route-handlers.test.ts`
- `tasks/task_029_shared_nav_simplification_and_entrypoint_cleanup.md`

## Acceptance Criteria
- The shared shell shows only `Profile`, `Communities`, `Fundraisers`, and `Sign in`/`Sign out`.
- `Profile` appears only when a signed-in viewer has a resolvable public profile slug.
- Desktop and mobile navigation use the same item set and ordering rules.
- Home-page primary discovery entry points target `/fundraisers` and `/communities` instead of deep-linking directly to seeded detail pages.
- Existing public pages continue to render inside the shared shell using the new navigation model.
- Updated presentation and API tests no longer depend on removed legacy navbar items.

## Tests Required
- `npm test -- tests/presentation/shared/public-site-shell.test.tsx tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Completion Summary
- Added a shared presentation helper that resolves both the authenticated browser-session viewer and that viewer's public profile slug, then updated all public routes to pass the resolved `viewerProfileSlug` into `PublicSiteShell`.
- Simplified `PublicSiteShell` to the approved nav model for both desktop and mobile, removing the old discovery-heavy items and only rendering `Profile` when a signed-in viewer actually has a public profile route.
- Updated the home page to use `/fundraisers` and `/communities` as primary browse entry points, and refreshed the affected presentation/API tests to align with the new shell behavior and expanded seeded community set.

## Verification
- `npm test -- tests/presentation/shared/public-site-shell.test.tsx tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- `npm run lint` still emits the pre-existing `@next/next/no-img-element` warning on the fundraiser hero image, but there are no lint errors and Task 029 did not add new warnings.
- The shared shell now depends on `viewerProfileSlug` only for public-profile navigation; the underlying auth/session contract remains unchanged.
- The home page still keeps a featured direct link to Avery's public profile, but the primary browse CTAs now point to `/fundraisers` and `/communities` as requested.
