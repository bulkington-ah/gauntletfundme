# Task 043: Community Activity Posting and Commenting

## Status
Complete

## Depends On
- `tasks/task_011_post_and_comment_creation.md`
- `tasks/task_022_public_community_page_webawesome_redesign.md`
- `tasks/task_025_browser_session_cookie_and_demo_login_seed.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`

## Description
Make the public community page activity tab functional by allowing authorized publishers to post community updates and authenticated viewers to add comments from the page itself. Remove the non-functional latest-sorting control and keep the activity feed fixed to the existing latest-first server ordering.

## Expected Files Affected
- `src/presentation/communities/**`
- `tests/presentation/communities/**`
- `tests/e2e/**`
- `tasks/task_043_community_activity_posting_and_commenting.md`

## Acceptance Criteria
- The public community activity tab no longer renders the non-functional `Sorting by: Latest` control.
- Community activity remains ordered by latest post first using the existing public community read query.
- Community owners, moderators, and admins can submit new updates from the activity tab.
- Authenticated viewers can submit comments on visible activity posts from the activity tab.
- Anonymous viewers can read activity and comments but see sign-in CTAs instead of active comment forms.
- Successful post and comment submissions refresh the route so the activity tab re-renders from the canonical server response.
- Failed post and comment submissions display predictable inline error messaging.
- No schema, persistence, or API contract changes are introduced for this task.

## Tests Required
- `tests/presentation/communities/public-community-page.test.tsx`
- `tests/e2e/mvp-user-journeys.test.ts`
- targeted `npm test -- ...` for the updated coverage
- `npm run build`

## Notes
- Reuse the existing discussion APIs at `POST /api/discussion/posts` and `POST /api/discussion/comments`.
- Keep top-level update publishing aligned with the current authorization policy rather than broadening who can create posts in this task.
- Keep sorting out of scope beyond removing the broken control and preserving the existing latest-first order.

## Completion Summary
- Completed on 2026-03-18.
- Replaced the static community activity feed rendering with an interactive client activity panel that:
  - removes the non-functional latest-sorting control
  - preserves latest-first ordering from the existing public community query
  - lets owners, moderators, and admins post updates through the existing discussion post API
  - lets authenticated viewers add comments through the existing discussion comment API
  - shows sign-in CTAs for anonymous viewers instead of active comment forms
- Added inline success and error handling for post and comment submissions and refreshes the route after successful writes so the feed re-renders from the canonical server response.
- Expanded community presentation coverage to assert:
  - the removed sort control
  - latest-first render order
  - authorized publisher visibility
  - successful post/comment submissions
  - anonymous comment sign-in prompts
  - inline submission failures
- Extended the MVP end-to-end journey to create a new community post as the organizer and verify it appears in the subsequent public community read.

## Verification
- `npm test -- tests/presentation/communities/public-community-page.test.tsx`
- `npm test -- tests/e2e/mvp-user-journeys.test.ts`
- `npm run build`
- `npm run lint`

## Handoff Notes
- `npm run lint` still reports one pre-existing Next.js warning in `src/presentation/fundraisers/public-fundraiser-page.tsx` for a raw `<img>` tag; this task did not change that file.
- The community activity tab now depends on route refreshes after successful writes rather than optimistic local list mutation, which keeps it aligned with the existing server-rendered public community read model.
