# Task 034: Profile Relationship Navigation

## Status
Complete

## Depends On
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_022_public_community_page_webawesome_redesign.md`
- `tasks/task_023_public_profile_page_webawesome_redesign.md`
- `tasks/task_027_public_browse_queries_and_viewer_profile_lookup.md`
- `tasks/task_028_public_fundraisers_and_communities_index_pages.md`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Description
Add dedicated follower and following profile routes, expose public relationship members from the existing profile query pipeline, and make supported public profile references clickable anywhere they appear across the public profile, fundraiser, community, and browse surfaces.

## Expected Files Affected
- `docs/plan.md`
- `src/application/public-content/**`
- `src/infrastructure/public-content/**`
- `src/infrastructure/persistence/postgres/**`
- `src/app/profiles/**`
- `src/presentation/profiles/**`
- `src/presentation/fundraisers/**`
- `src/presentation/communities/**`
- `tests/application/public-content/**`
- `tests/infrastructure/persistence/**`
- `tests/presentation/**`
- `tasks/task_034_profile_relationship_navigation.md`

## Acceptance Criteria
- Clicking `followers` or `following` on a public profile opens a dedicated public relationship route for that profile.
- Public profile responses include follower and following member lists, and `followingCount` matches profile follows rather than all follow targets.
- Community discussion posts and comments expose author profile slugs so author identities can link to profile pages.
- Organizer, owner, supporter, and activity profile references navigate to public profile pages wherever a profile slug is available.
- Fundraiser and community browse cards keep a primary destination link to the fundraiser or community while exposing organizer or owner profile links separately.

## Tests Required
- Application public-content query tests
- Repository tests for profile relationship lists, ordering, and counts
- Presentation tests for profile, fundraiser, community, and browse navigation updates
- Public route-handler tests for additive response payload changes
- `npm run build`

## Completion Summary
- Completed on 2026-03-17.
- Extended the public-content contracts and repository snapshots so profile reads now include follower and following members, profile-only following counts, and community discussion author profile slugs. Both the static demo adapter and the Postgres adapter now return relationship lists ordered by most recent follow first.
- Added dedicated public routes at `/profiles/[slug]/followers` and `/profiles/[slug]/following` with a new shared profile-relationships presentation page, and updated the main public profile page so the relationship counters and recent activity actors now navigate to profile pages.
- Updated fundraiser, community, and browse presentation surfaces so supported organizer, owner, supporter, post-author, and comment-author profile references are clickable without breaking the primary fundraiser or community navigation paths.
- Added targeted coverage for the new relationship routes, response payload fields, and clickable profile navigation across the touched public surfaces.

## Verification
- `npm test -- tests/presentation/profiles/public-profile-page.test.tsx tests/presentation/profiles/public-profile-relationships-page.test.tsx tests/presentation/communities/public-community-page.test.tsx tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/public-community-browse-page.test.tsx tests/application/public-content/public-content-queries.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm run build`
- `npm run lint`

## Handoff Notes
- `npm run lint` passes with one existing `@next/next/no-img-element` warning on `src/presentation/fundraisers/public-fundraiser-page.tsx` for the local static fundraiser hero image.
- Relationship member rows fall back to plain text when a public profile slug is absent, but the seeded data exercised by this task all resolves to real profile links.
- The browse cards no longer use one full-card anchor so organizer and owner profile links can coexist legally with the primary fundraiser or community destination link.
