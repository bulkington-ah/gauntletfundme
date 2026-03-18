# Task 037: Fundraiser Follow Controls

## Status
Complete

## Depends On
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_033_real_system_wide_donation_flow.md`
- `tasks/task_035_public_detail_viewer_follow_state.md`
- `tasks/task_036_profile_and_community_follow_controls.md`

## Description
Add the same reusable follow/unfollow control to the fundraiser detail page, placing it in the primary support CTA groups while preserving the existing donate/share flow.

## Expected Files Affected
- `src/presentation/engagement/**`
- `src/presentation/fundraisers/**`
- `tests/presentation/fundraisers/**`
- `tests/presentation/engagement/**`

## Acceptance Criteria
- The fundraiser detail page shows a working follow/unfollow control for non-owner viewers.
- Anonymous clicks redirect to login with the fundraiser page as `next`.
- Self-owned fundraiser pages hide the control.
- Existing donation and share interactions remain unchanged.
- Regression coverage confirms working follow UI across profile, community, and fundraiser detail pages.

## Tests Required
- Fundraiser page presentation tests
- Shared follow-control regression tests if the shared component contract changes
- Final targeted `lint` and `build` verification for the integrated follow UI work

## Completion Summary
- Completed on 2026-03-18.
- Extended the fundraiser page-model builder and route page to pass viewer-specific follow state through to the detail surface.
- Added the shared `FollowTargetControl` to the fundraiser mobile support card and sidebar support card, preserving the existing donate/share CTA rows elsewhere on the page.
- Added fundraiser presentation coverage for the new follow controls and for hiding them on self-owned fundraiser pages.
- Re-ran integrated read-model, route-handler, and page-level regression tests plus `lint` and `build` for the combined follow UI changes.

## Verification
- `npm test -- tests/presentation/engagement/follow-target-control.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/infrastructure/public-content/static-public-content-repository.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/route-handlers.test.ts tests/presentation/engagement/follow-target-control.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm run lint`
- `npm run build`

## Handoff Notes
- `npm run lint` still reports the existing `@next/next/no-img-element` warning for the static fundraiser hero image in `src/presentation/fundraisers/public-fundraiser-page.tsx`; this task did not change that behavior.
- The fundraiser page intentionally renders the follow control only in the mobile and sidebar support CTA groups so the main story action row stays focused on donate/share.
