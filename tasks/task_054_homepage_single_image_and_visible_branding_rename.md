# Task 054: Homepage Single Image and Visible Branding Rename

## Status
Complete

## Depends On
- `tasks/task_019_webawesome_foundation_and_public_shell.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`
- `tasks/task_029_shared_nav_simplification_and_entrypoint_cleanup.md`

## Description
Simplify the homepage so the shared public shell renders only the supplied image in the page body, and rename the visible product branding from `GoFundMe V2` / `gofundme v2` to `gauntletfundme`.

## Expected Files Affected
- `src/app/layout.tsx`
- `src/presentation/home/placeholder-home-page.tsx`
- `src/presentation/home/placeholder-home-page.module.css`
- `src/presentation/shared/public-site-shell.tsx`
- `src/presentation/shared/public-site-shell.module.css`
- `src/presentation/auth/login-page.tsx`
- `tests/presentation/home/placeholder-home-page.test.tsx`
- `tests/presentation/shared/public-site-shell.test.tsx`
- `tests/presentation/auth/login-page.test.tsx`
- `public/homepage-hero.png`
- `tasks/task_054_homepage_single_image_and_visible_branding_rename.md`

## Acceptance Criteria
- The homepage keeps the shared public shell header.
- The homepage body renders only the supplied image.
- The previous homepage eyebrow, heading, lead copy, CTA buttons, and browse cards are removed.
- The shared shell brand renders `gauntletfundme`.
- The login page heading renders `Sign in to gauntletfundme`.
- The browser title is `gauntletfundme`.
- No application, domain, API, infrastructure, cookie, analytics-event, or health-route identifier changes are introduced.

## Tests Required
- `npm test -- tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/shared/public-site-shell.test.tsx tests/presentation/auth/login-page.test.tsx`
- `npm run lint`
- `npm run build`

## Notes
- Use `next/image` with the local asset so the homepage does not add a new `no-img-element` lint warning.
- Keep the branding rename scoped to visible UI and metadata only.

## Completion Summary
- Completed on 2026-03-18.
- Replaced the homepage hero copy, CTA buttons, and browse cards with a single responsive local image rendered inside the existing shared public shell.
- Renamed the visible shared-shell brand, login page heading, and document title to `gauntletfundme` without changing internal technical identifiers.
- Added the supplied homepage image to `public/homepage-hero.png` and updated presentation tests to cover the simplified homepage and renamed visible branding.

## Verification
- `npm test -- tests/presentation/home/placeholder-home-page.test.tsx tests/presentation/shared/public-site-shell.test.tsx tests/presentation/auth/login-page.test.tsx`
- `npm run lint`
- `npm run build`

## Handoff Notes
- This task intentionally leaves internal identifiers such as `gofundme_v2_session`, `gofundme_v2:open-donation-form`, and the health route service label unchanged.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`; Task 054 uses `next/image` for the homepage and does not change fundraiser rendering.
