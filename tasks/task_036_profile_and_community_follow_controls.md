# Task 036: Profile and Community Follow Controls

## Status
Complete

## Depends On
- `tasks/task_022_public_community_page_webawesome_redesign.md`
- `tasks/task_023_public_profile_page_webawesome_redesign.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`
- `tasks/task_035_public_detail_viewer_follow_state.md`

## Description
Replace the current static profile and community follow buttons with a reusable presentation-layer follow control that redirects anonymous users to login, toggles follow/unfollow for signed-in users, hides on self-owned targets, and refreshes server-rendered state after success.

## Expected Files Affected
- `src/presentation/engagement/**`
- `src/presentation/profiles/**`
- `src/presentation/communities/**`
- `tests/presentation/engagement/**`
- `tests/presentation/profiles/**`
- `tests/presentation/communities/**`

## Acceptance Criteria
- The public profile hero follow button works for authenticated users and redirects anonymous users to `/login?next=<current page>`.
- The public community hero follow button works with the same behavior.
- Self-owned profile and community pages do not render the control.
- Non-auth API failures show inline error feedback and do not desync button state.

## Tests Required
- Client follow-control tests for redirect, follow, unfollow, and error states
- Profile page presentation tests
- Community page presentation tests

## Completion Summary
- Completed on 2026-03-18.
- Added a reusable client-side `FollowTargetControl` presentation component that handles anonymous login redirects, follow/unfollow POST commands, inline error states, and server refresh after successful toggles.
- Wired the shared control into the public profile and community hero action rows, replacing the previous static buttons without changing the surrounding layouts.
- Updated the profile and community page-model builders and route pages to pass viewer-aware follow state through from the public query layer.
- Added presentation tests for the shared control behaviors and for self-owned profile/community pages hiding the control entirely.

## Verification
- `npm test -- tests/presentation/engagement/follow-target-control.test.tsx tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/communities/public-community-page.test.tsx`

## Handoff Notes
- The shared follow control uses `router.refresh()` rather than optimistic counter updates, so duplicate controls on the same page stay consistent after the server refresh completes.
- Fundraiser pages do not consume the shared follow control yet; task 037 will place the same component into the fundraiser support CTA groups.
