# Task 040: Community and Fundraiser Creation Flows

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_006_ownership_and_authorization_policies.md`
- `tasks/task_025_browser_session_cookie_and_demo_login_seed.md`
- `tasks/task_026_dedicated_login_page_and_shell_auth_state.md`
- `tasks/task_028_public_fundraisers_and_communities_index_pages.md`
- `tasks/task_039_explicit_fundraiser_to_community_linkage.md`

## Description
Add dedicated create flows for communities and fundraisers. The `/communities` and `/fundraisers` browse pages should show create CTAs. Authenticated viewers can open dedicated create pages, submit forms, and be redirected to the newly created public detail page. Anonymous viewers should be routed through the existing sign-in flow and returned to the correct create page after login. Created communities and fundraisers must assign the current session user as `ownerUserId`. Fundraiser creation should allow optional linking to one of the creator’s existing communities.

## Expected Files Affected
- `src/application/**`
- `src/presentation/communities/**`
- `src/presentation/fundraisers/**`
- `src/presentation/api/**`
- `src/app/communities/**`
- `src/app/fundraisers/**`
- `src/infrastructure/persistence/postgres/**`
- `tests/application/**`
- `tests/presentation/**`
- `tests/infrastructure/**`
- `tasks/task_040_community_and_fundraiser_creation_flows.md`

## Acceptance Criteria
- `/communities` renders a create CTA that links to `/communities/create` for authenticated viewers and `/login?next=/communities/create` for anonymous viewers.
- `/fundraisers` renders a create CTA that links to `/fundraisers/create` for authenticated viewers and `/login?next=/fundraisers/create` for anonymous viewers.
- Direct visits to `/communities/create` and `/fundraisers/create` by anonymous viewers redirect into the existing login flow with the correct `next` target preserved.
- Dedicated create pages exist for both resources and submit through server-backed create flows rather than client-only mock state.
- `POST /api/communities` creates a new community owned by the current session user.
- `POST /api/fundraisers` creates a new fundraiser owned by the current session user.
- Community creation persists a new `Community` with `ownerUserId` set to the current viewer, `visibility` set to `public`, and a slug derived from the submitted name.
- Fundraiser creation persists a new `Fundraiser` with `ownerUserId` set to the current viewer, `status` set to `active`, a slug derived from the submitted title, and optional `communityId` linkage when the selected community is owned by the current viewer.
- Fundraiser creation only allows linking to communities owned by the current viewer; tampered or non-owned selections are rejected on the server.
- Successful community creation redirects to `/communities/[slug]`.
- Successful fundraiser creation redirects to `/fundraisers/[slug]`.
- Newly created communities and fundraisers are returned by the existing public detail and browse queries without requiring prototype reset.
- Signed-in supporters may create communities and fundraisers in this task without changing their account role or profile type.
- Invalid input and slug collisions return predictable, user-visible errors rather than raw persistence failures.

## Tests Required
- Application tests for create-community and create-fundraiser command behavior.
- Presentation/API tests for authenticated, anonymous, invalid, forbidden, and success submission paths.
- Presentation tests for browse-page CTA behavior and create-page auth redirect behavior.
- Persistence adapter tests covering inserted community/fundraiser rows and optional fundraiser-to-community linkage.
- `npm test --` for the targeted new tests.
- `npm run build`

## Notes
- Use dedicated create pages rather than inline modals or in-page forms.
- Do not add edit flows, draft publishing flows, or account role-promotion behavior in this task.
- Fundraiser creation should offer only the current viewer’s owned communities in the optional picker.
- Slugs should be generated server-side from the submitted name or title and remain non-editable in v1.
- If analytics coverage is kept consistent with existing write flows, add events for successful community and fundraiser creation.

## Completion Summary
- Completed on 2026-03-18.
- Added new application-layer create flows for communities and fundraisers, including:
  - authenticated create commands
  - viewer-owned community lookup for fundraiser linking
  - centralized authorization policy support for `create_community` and `create_fundraiser`
  - analytics events for successful community and fundraiser creation
- Extended the Postgres public-content engagement adapter to support:
  - community creation
  - fundraiser creation
  - viewer-owned community listing
  - owner-scoped community lookup for fundraiser linkage validation
- Added new API handlers and routes:
  - `POST /api/communities`
  - `POST /api/fundraisers`
- Added dedicated protected create pages:
  - `/communities/create`
  - `/fundraisers/create`
  Both routes redirect anonymous visitors into the existing login flow with the correct `next` target.
- Updated the public browse pages so authenticated viewers can navigate directly into the new create flows and anonymous visitors are sent through login first.
- Added client-side create forms that:
  - submit to the new APIs
  - redirect to the created public detail page on success
  - show predictable inline errors for validation/conflict failures
  - reroute through login if the browser session expires during submission
- Added focused coverage for:
  - new application commands
  - analytics and authorization contracts
  - browse-page CTAs
  - create-page form behavior
  - protected create-page redirects
  - API handler behavior
  - Postgres persistence and public read visibility

## Verification
- `npm test -- tests/application/communities/create-community.test.ts tests/application/fundraisers/create-fundraiser.test.ts tests/application/analytics/event-contracts.test.ts tests/application/authorization/authorize-protected-action.test.ts tests/domain/authorization-policy.test.ts tests/presentation/communities/public-community-browse-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/presentation/communities/create-community-page.test.tsx tests/presentation/fundraisers/create-fundraiser-page.test.tsx tests/presentation/api/route-handlers.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/app/create-route-pages.test.tsx`
- `npm run build`
- `npm test -- tests/application/communities/create-community.test.ts tests/application/fundraisers/create-fundraiser.test.ts`

## Handoff Notes
- Slug conflict handling is enforced through application-layer prechecks with user-visible `409` responses; no user-editable slug control was added in this task.
- New communities are immediately public and new fundraisers are immediately active, so there is still no draft/review step before they appear in the public surface.
- Signed-in supporters can now create owned communities and fundraisers without a role/profile-type promotion; if organizer-role promotion becomes a product requirement later, it should be introduced as a separate task.
