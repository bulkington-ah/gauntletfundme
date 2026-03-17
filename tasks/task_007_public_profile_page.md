# Task 007: Public Profile Page

## Status
Complete

## Depends On
- `tasks/task_003_api_layer.md`
- `tasks/task_004_repository_interfaces_and_persistence_adapters.md`
- `tasks/task_006_ownership_and_authorization_policies.md`

## Description
Implement a public profile page that loads a profile by slug, renders supporter/organizer identity context, and surfaces connected entities like fundraisers and communities without requiring authentication.

## Expected Files Affected
- `src/app/profiles/**`
- `src/presentation/profiles/**`
- `tests/presentation/profiles/**`
- `tests/application/public-content/**` (query coverage reused/verified)

## Acceptance Criteria
- A profile can be fetched by slug and rendered on a dedicated page route.
- The page clearly presents profile identity context (`profileType` and `role`).
- Connected fundraisers and communities are shown with navigation links.
- Not-found and invalid slug outcomes render clear public-facing states.

## Tests Required
- Profile page render tests for success and failure states.
- Application query tests confirming profile retrieval behavior.

## Notes
- This task reuses the existing `getPublicProfileBySlug` application query instead of introducing new profile-specific application services.
- Links to fundraisers and communities are rendered now even though their full page experiences are implemented in subsequent milestone tasks.

## Completion Summary
- Completed on 2026-03-16.
- Added a presentation profiles module with:
  - `buildPublicProfilePageModel` for slug-based page model resolution from the application API
  - `PublicProfilePage` UI component for success, invalid request, and not-found states
- Added a new Next.js page route at `/profiles/[slug]` that:
  - creates application API dependencies
  - fetches profile data by slug
  - renders the public profile page model
- The success state now surfaces:
  - profile identity context (`profileType`, `role`, bio, follower count)
  - connected fundraiser links
  - connected community links
- Added presentation tests covering:
  - page model mapping from profile query responses
  - success UI rendering and connected links
  - invalid request and not-found UI states
- Verified existing application query tests continue covering slug-based public profile retrieval behavior.

## Verification
- `npm test -- tests/presentation/profiles/public-profile-page.test.tsx tests/application/public-content/public-content-queries.test.ts tests/presentation/home/placeholder-home-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The profile page currently uses inline styles in the presentation component to keep the scope focused and avoid introducing a broader styling refactor.
- The route depends on the existing application composition root and repository-backed profile query pipeline established in Milestone 2 and 3 tasks.
