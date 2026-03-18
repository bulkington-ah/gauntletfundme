# Task 027: Public Browse Queries And Viewer Profile Lookup

## Status
Complete

## Depends On
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`

## Description
Extend the public-content layer with top-level fundraiser and community browse queries, add a lightweight public-profile-slug lookup by `userId` for the shared shell, and expand the prototype seed data so browse pages have multiple communities to render.

## Expected Files Affected
- `src/application/public-content/**`
- `src/application/api/create-application-api.ts`
- `src/infrastructure/public-content/static-public-content-repository.ts`
- `src/infrastructure/persistence/postgres/postgres-public-content-engagement-repository.ts`
- `src/infrastructure/demo-data/prototype-catalog.ts`
- `tests/application/public-content/public-content-queries.test.ts`
- `tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`
- `tasks/task_027_public_browse_queries_and_viewer_profile_lookup.md`

## Acceptance Criteria
- The application layer exposes `listPublicFundraisers()`, `listPublicCommunities()`, and `getPublicProfileSlugByUserId(userId)`.
- The public-content read repository supports listing fundraiser summaries, listing community summaries, and resolving a public profile slug by `userId`.
- Fundraiser browse data is sorted active-first and then by support momentum.
- Community browse data is sorted by follower count descending and then newest first.
- The seeded prototype catalog contains multiple public communities with enough visible content and follows to support browse-card rendering.
- No schema or session contract changes are required to support the new browse reads.

## Tests Required
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`
- `npm run build`

## Completion Summary
- Added list-oriented public-content contracts and use cases for fundraiser and community browse pages, plus a lightweight `getPublicProfileSlugByUserId` query that preserves the existing `AuthenticatedViewer` shape.
- Extended both public-content repository adapters to support fundraiser lists, community lists, and public-profile-slug lookup while keeping all request orchestration in the application layer.
- Expanded the prototype catalog with two additional public communities, visible posts/comments, and follower relationships so the upcoming `/communities` browse page has multiple seeded cards and realistic derived counts.

## Verification
- `npm test -- tests/application/public-content/public-content-queries.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts`
- `npm run build`

## Handoff Notes
- Community browse data intentionally reuses the current owner-based fundraiser relationship, so each of Avery's seeded communities resolves the same fundraiser portfolio for now.
- The new profile-slug lookup is not yet wired into the shared shell; that happens in the later navigation task so Task 027 stays focused on read-model preparation.
- Browse page UI routes do not exist yet; Task 028 consumes the new list responses directly from the application API.
