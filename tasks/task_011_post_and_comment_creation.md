# Task 011: Post and Comment Creation

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_006_ownership_and_authorization_policies.md`
- `tasks/task_009_public_community_page_and_discussion_feed.md`
- `tasks/task_010_follow_and_unfollow_flows.md`

## Description
Allow authenticated users to create comments on published community posts and allow authorized owners/moderators/admins to create community posts through application-layer commands and API handlers.

## Expected Files Affected
- `src/application/discussion/**`
- `src/application/api/**`
- `src/presentation/api/discussion/**`
- `src/app/api/discussion/**`
- `src/infrastructure/persistence/postgres/**`
- `tests/application/discussion/**`
- `tests/presentation/api/**`
- `tests/infrastructure/persistence/**`

## Acceptance Criteria
- Authenticated users can create comments on published, visible posts.
- Community owners, moderators, and admins can create posts; unauthorized creators are blocked.
- Anonymous requests are blocked with clear session-header guidance.
- Invalid and not-found post/community submissions return predictable errors.

## Tests Required
- Use-case tests for create post and create comment behavior.
- Route tests for authenticated vs anonymous/forbidden submission paths.
- Repository adapter tests for persisted discussion write behavior.

## Notes
- Post creation authorization is owner-aware and uses the existing centralized `create_post` policy.
- Comment creation uses authenticated-only gating via the existing `create_comment` policy.
- New write commands intentionally return created resource summaries for immediate UI consumption.

## Completion Summary
- Completed on 2026-03-16.
- Added a new application discussion module with:
  - `createPostCommand`
  - `createCommentCommand`
  - discussion target/write ports for lookup and persistence boundaries
- Wired discussion commands into `createApplicationApi` with lazy discussion adapter resolution to avoid unnecessary DB initialization in unrelated flows/tests.
- Extended Postgres discussion persistence capabilities in the existing adapter with:
  - `findCommunityBySlugForPostCreation`
  - `findPostByIdForCommentCreation`
  - `createPost`
  - `createComment`
- Added presentation API handlers and Next routes:
  - `POST /api/discussion/posts`
  - `POST /api/discussion/comments`
- Expanded API route handler coverage to include:
  - anonymous create post/comment failures
  - organizer post creation success
  - supporter post creation forbidden case
  - authenticated comment creation success
- Added dedicated application discussion tests for create-post and create-comment use cases.
- Updated README implementation summary to include post/comment creation command support.

## Verification
- `npm test -- tests/application/discussion/create-post.test.ts tests/application/discussion/create-comment.test.ts tests/presentation/api/route-handlers.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/auth-route-handlers.test.ts`
- `npm test -- tests/application/discussion/create-post.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Discussion creation endpoints currently expose command behavior through API routes; interactive page-level form components can now integrate directly with these endpoints.
- Comment creation is limited to posts that are both `published` and `visible` at lookup time; this preserves moderation-safe write behavior for the public discussion feed.
