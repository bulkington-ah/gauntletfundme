# Task 009: Public Community Page and Discussion Feed

## Status
Complete

## Depends On
- `tasks/task_003_api_layer.md`
- `tasks/task_004_repository_interfaces_and_persistence_adapters.md`
- `tasks/task_007_public_profile_page.md`
- `tasks/task_008_public_fundraiser_page.md`

## Description
Implement the public community page with discovery-friendly metadata, visible discussion feed entries, nested comment visibility, and connected profile/fundraiser links.

## Expected Files Affected
- `src/app/communities/**`
- `src/presentation/communities/**`
- `tests/presentation/communities/**`
- `tests/application/public-content/**` (query coverage verified)

## Acceptance Criteria
- A community can be fetched by slug and rendered at a dedicated page route.
- Public visitors can read community details, posts, and comments without auth.
- Connected profile and fundraiser links are visible on the community surface.
- Invalid and not-found slug states are handled clearly.

## Tests Required
- Community page render tests for success/failure states and nested discussion content.
- Application query tests validating community discussion mapping behavior.

## Notes
- The page is intentionally read-first and does not include authenticated posting/comment creation controls yet.
- Discussion rendering uses existing `getPublicCommunityBySlug` application query output to avoid bypassing application-layer boundaries.

## Completion Summary
- Completed on 2026-03-16.
- Added a presentation communities module with:
  - `buildPublicCommunityPageModel` for slug-based page model loading
  - `PublicCommunityPage` component for success, invalid request, and not-found states
- Added a new Next.js route page at `/communities/[slug]` that composes the application API and renders the page model.
- Success rendering now includes:
  - community details (name, description, visibility, follower count)
  - owner context with optional profile link
  - featured fundraiser context with link
  - discussion feed posts with nested comment visibility
- Added presentation tests covering:
  - page model mapping
  - success rendering for posts and comments
  - invalid request and not-found handling
- Verified existing application community query tests continue to cover discussion mapping behavior.

## Verification
- `npm test -- tests/presentation/communities/public-community-page.test.tsx tests/application/public-content/public-content-queries.test.ts tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The community page currently focuses on public read visibility; authenticated creation/moderation controls are intentionally deferred to later engagement and moderation milestone tasks.
- Discussion dates are rendered using `toLocaleDateString("en-US")` in presentation logic for readable public output and can be centralized later if a shared display formatting layer is introduced.
