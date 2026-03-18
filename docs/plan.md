# Development Plan

This plan captures the MVP's major feature and workflow tasks in dependency order. Narrow cleanup, layout polish, and other standalone incremental tasks may be tracked only in `tasks/` when their task briefs explicitly scope them that way, but the main roadmap should stay aligned with the implemented product surface.

## Milestone 1: Project Foundation

### Task 001: Project Scaffold
- Description: Initialize the application structure for a modular monolith using Next.js, TypeScript, and the layer layout defined in the architecture rules.
- Expected files affected:
  - `package.json`
  - `tsconfig.json`
  - `src/presentation/**`
  - `src/application/**`
  - `src/domain/**`
  - `src/infrastructure/**`
  - `tests/**`
  - base config files such as lint, format, and env examples
- Acceptance criteria:
  - the repository contains the expected top-level source and test directories
  - the app boots locally with a basic placeholder page
  - imports and aliases support the defined layer structure
  - no product feature behavior is implemented yet beyond a placeholder shell
- Tests required:
  - basic app startup check
  - one smoke test covering the placeholder page render

## Milestone 2: Domain, API, and Persistence Base

### Task 002: Core Models
- Description: Define the first-pass domain types and persistence schema for the MVP's core entities: `User`, `UserProfile`, `Fundraiser`, `Community`, `Post`, `Comment`, `Follow`, `DonationIntent`, and `Report`.
- Expected files affected:
  - `src/domain/**`
  - `src/infrastructure/persistence/**`
  - schema or migration files
  - `tests/domain/**`
  - `tests/infrastructure/**`
- Acceptance criteria:
  - all core entities from the product spec exist in both domain and persistence form
  - the schema supports ownership, content status, moderation status, and polymorphic follow targets
  - roles support at least `supporter`, `organizer`, `moderator`, and `admin`
  - naming and module placement follow the architecture rules
- Tests required:
  - domain model tests covering basic invariants and type expectations
  - persistence smoke tests validating schema creation or repository-level setup

### Task 003: API Layer
- Description: Establish the initial application API layer and route structure that future features will use, including safe public reads and auth-aware write entry points that prove the boundary pattern without implementing the full product UI.
- Expected files affected:
  - `src/presentation/**`
  - `src/application/**`
  - `src/domain/**` for shared request or response types only if needed
  - `src/infrastructure/**`
  - `tests/application/**`
  - `tests/presentation/**`
- Acceptance criteria:
  - the repository has a clear pattern for how presentation code calls application-layer use cases
  - initial public read routes or handlers exist for resource lookup by slug, even if they return seeded or placeholder data
  - authorization-aware write entry points are structured but not fully implemented beyond what is needed to prove the pattern
  - route handlers do not reach directly into infrastructure code without going through application-layer boundaries
- Tests required:
  - route or handler smoke tests for the initial read endpoints
  - application-layer tests confirming request orchestration and boundary separation

### Task 004: Repository Interfaces and Persistence Adapters
- Description: Introduce repository interfaces at the application boundary and provide infrastructure persistence adapters that support the current read and follow-write flows while preserving modular layer boundaries.
- Expected files affected:
  - `src/application/**`
  - `src/domain/**`
  - `src/infrastructure/persistence/**`
  - `tests/application/**`
  - `tests/infrastructure/**`
- Acceptance criteria:
  - read and write access patterns for core entities are abstracted behind clear interfaces
  - infrastructure code does not leak directly into presentation or domain
  - public read flows run through repository adapters
  - follow writes are persisted with idempotent behavior and self-follow protection
  - runtime persistence uses a PostgreSQL connection configured by environment
- Tests required:
  - repository contract tests
  - infrastructure adapter tests for repository behavior
  - route handler tests for HTTP contract mapping

## Milestone 3: Authentication and Access Control

### Task 005: Account and Session Foundation
- Description: Implement sign up, login, logout, session lookup, and role-aware identity primitives needed by protected actions.
- Expected files affected:
  - `src/application/accounts/**`
  - `src/domain/accounts/**`
  - `src/infrastructure/auth/**`
  - `src/presentation/**`
  - `tests/**/accounts/**`
- Acceptance criteria:
  - users can create an account and establish a session
  - authenticated identity is available to application-layer use cases
  - roles support at least supporter, organizer, moderator, and admin
- Tests required:
  - auth flow tests for sign up, login, logout
  - authorization tests for protected use-case entry points

### Task 006: Ownership and Authorization Policies
- Description: Add reusable authorization checks for profile editing, community management, posting, commenting, following, donation submission, community creation, fundraiser creation, and moderation.
- Expected files affected:
  - `src/application/**`
  - `src/domain/**`
  - `tests/application/**`
  - `tests/domain/**`
- Acceptance criteria:
  - protected actions consistently reject anonymous or unauthorized users
  - owners and moderators receive the correct permissions for their responsibilities
  - authorization rules are centralized and not duplicated in UI code
- Tests required:
  - policy tests for owner, member, moderator, and anonymous cases
  - endpoint or action tests confirming unauthorized access is blocked

## Milestone 4: Public Read Experience

### Task 007: Public Profile Page
- Description: Implement the public profile view for supporter and organizer identities, including profile details and connected entities.
- Expected files affected:
  - `src/presentation/profiles/**`
  - `src/application/public-content/**`
  - `tests/**/profiles/**`
- Acceptance criteria:
  - a profile can be fetched by slug
  - the page renders the identity clearly for either supporter or organizer context
  - connected content such as communities or fundraisers is surfaced without requiring login
- Tests required:
  - profile page render tests
  - application query tests for profile retrieval

### Task 008: Public Fundraiser Page
- Description: Implement the fundraiser view with organizer context, story content, and donation entry points.
- Expected files affected:
  - `src/presentation/fundraisers/**`
  - `src/application/public-content/**`
  - `tests/**/fundraisers/**`
- Acceptance criteria:
  - a fundraiser can be fetched by slug
  - the page shows organizer, story, progress, and connected community or profile links
  - the donation entry point is visible and clearly scoped to the MVP's mocked payment processor
- Tests required:
  - fundraiser page render tests
  - fundraiser query tests

### Task 009: Public Community Page and Discussion Feed
- Description: Implement the community page with public discovery, recent posts, and comment visibility.
- Expected files affected:
  - `src/presentation/communities/**`
  - `src/application/public-content/**`
  - `src/application/discussion/**`
  - `tests/**/communities/**`
  - `tests/**/discussion/**`
- Acceptance criteria:
  - a community can be fetched by slug
  - public visitors can read community details, posts, and comment threads
  - connected profile and fundraiser links are available on the page
- Tests required:
  - community page render tests
  - post and comment query tests

## Milestone 5: Authenticated Engagement

### Task 010: Follow and Unfollow Flows
- Description: Implement authenticated follow relationships for profiles, fundraisers, and communities.
- Expected files affected:
  - `src/application/engagement/**`
  - `src/domain/engagement/**`
  - `src/presentation/**`
  - `tests/**/engagement/**`
- Acceptance criteria:
  - signed-in users can follow and unfollow supported targets
  - anonymous users are redirected or blocked appropriately
  - follow counts and state update correctly on affected pages
- Tests required:
  - use-case tests for follow and unfollow behavior
  - UI or route tests for auth-gated follow actions

### Task 011: Post and Comment Creation
- Description: Allow authenticated users to create posts where appropriate and comment on community posts.
- Expected files affected:
  - `src/presentation/discussion/**`
  - `src/application/discussion/**`
  - `src/domain/discussion/**`
  - `tests/**/discussion/**`
- Acceptance criteria:
  - authenticated users can create comments
  - community owners or authorized users can create posts
  - invalid or unauthorized submissions fail with clear handling
- Tests required:
  - use-case tests for create post and create comment
  - presentation tests for authenticated and anonymous submission paths

### Task 012: Mocked Donation Intent Flow
- Description: Implement the initial mocked donation intent workflow as a tracked checkout initiation rather than a real payment flow.
- Expected files affected:
  - `src/presentation/fundraisers/**`
  - `src/application/engagement/**`
  - `src/domain/engagement/**`
  - `tests/**/engagement/**`
- Acceptance criteria:
  - authenticated users can start a donation intent from a fundraiser
  - the system stores intent metadata without collecting real payment details
  - the UI makes it clear the flow is mocked
- Tests required:
  - donation intent use-case tests
  - route or action tests confirming auth requirements

## Milestone 6: Moderation and Safety

### Task 013: Reporting Workflow
- Description: Allow users to report posts and comments for review.
- Expected files affected:
  - `src/application/moderation/**`
  - `src/domain/moderation/**`
  - `src/presentation/**`
  - `tests/**/moderation/**`
- Acceptance criteria:
  - authenticated users can submit reports against posts or comments
  - reports persist with status and reason data
  - duplicate or invalid reports are handled predictably
- Tests required:
  - report creation use-case tests
  - moderation route or action tests

### Task 014: Moderator Action Flow
- Description: Implement moderator or owner actions to hide, remove, or resolve reported discussion content.
- Expected files affected:
  - `src/application/moderation/**`
  - `src/domain/moderation/**`
  - `src/presentation/**`
  - `tests/**/moderation/**`
- Acceptance criteria:
  - only permitted roles can resolve reports or change content status
  - moderated content is no longer shown in public discussion feeds when hidden or removed
  - moderation actions are auditable through stored status changes
- Tests required:
  - moderation policy tests
  - public visibility tests for moderated content

## Milestone 7: Analytics, Validation, and Deployment

### Task 015: Analytics Instrumentation
- Description: Add analytics events for page views, follows, comment creation, completed donations, and key community interactions.
- Expected files affected:
  - `src/application/analytics/**`
  - `src/infrastructure/analytics/**`
  - `src/presentation/**`
  - `tests/**/analytics/**`
- Acceptance criteria:
  - key product actions emit events with consistent names and payloads
  - event emission is triggered from meaningful application-layer use cases
  - analytics integration does not pollute domain logic
- Tests required:
  - analytics event contract tests
  - integration tests around key tracked actions

### Task 016: Deployment Baseline and Production Hardening
- Description: Prepare the app for AWS deployment with production configuration, secrets handling, runtime health checks, and deployment packaging.
- Expected files affected:
  - Docker-related files if used
  - deployment config files
  - `src/infrastructure/**`
  - `README.md`
  - `harness/**`
- Acceptance criteria:
  - the application can run in a production-like environment with documented configuration
  - secrets are sourced from managed environment configuration rather than code
  - health checks and startup behavior support deployment confidence
- Tests required:
  - production build verification
  - smoke test for container or runtime startup

### Task 017: MVP End-to-End Validation and Polish
- Description: Close the loop on the core user journeys and address the highest-priority issues found during integration.
- Expected files affected:
  - any touched feature modules under `src/**`
  - `tests/**`
  - `README.md`
  - release or demo notes if added
- Acceptance criteria:
  - the main flows work together: browse public pages, authenticate, follow, comment, submit a donation, and moderate content
  - major UX inconsistencies or broken transitions are resolved
  - remaining scope cuts or known limitations are documented
- Tests required:
  - end-to-end tests for the main user journeys
  - regression checks for previously completed milestone features

### Task 018: AWS Terraform App Runner and Private RDS Baseline
- Description: Create a production-focused Terraform baseline for AWS deployment using App Runner, ECR, and a private PostgreSQL RDS instance with VPC connectivity.
- Expected files affected:
  - `infra/terraform/**`
  - `README.md`
  - `tasks/task_018_aws_terraform_app_runner_rds.md`
- Acceptance criteria:
  - Terraform provisions VPC networking, private subnets, and security groups required for private RDS access
  - Terraform provisions ECR and App Runner wired to a controlled image-tag input and `/api/health` runtime health check
  - Terraform provisions private PostgreSQL RDS and injects `DATABASE_URL` into the application runtime
  - Terraform usage and deployment flow are documented for operators
- Tests required:
  - `terraform fmt -check`
  - `terraform init`
  - `terraform validate`
  - `terraform plan -var="app_image_tag=<tag>"`
  - `npm run build`
  - `npm test`

## Milestone 8: Public Surface Redesign

### Task 019: Web Awesome Foundation and Public Shell
- Description: Introduce Web Awesome as the shared public-surface design foundation and add a reusable public site shell with a shared navigation bar and responsive mobile menu.
- Expected files affected:
  - `package.json`
  - `src/app/**`
  - `src/presentation/shared/**`
  - `src/presentation/home/**`
  - `src/presentation/fundraisers/**`
  - `src/presentation/communities/**`
  - `src/presentation/profiles/**`
  - `tests/presentation/**`
- Acceptance criteria:
  - Web Awesome is installed and theme styles are loaded through the shared app layout
  - a client-side component registry exists for the initial set of shared public components
  - the public shell renders a shared navbar and responsive mobile navigation
  - the home page adopts the new shared shell
  - the existing public fundraiser, community, and profile pages render within the shared shell without changing their underlying product behavior
- Tests required:
  - targeted presentation tests for home, fundraiser, community, and profile pages
  - `npm run build`

### Task 020: Public Page Derived View Models and Demo Seed
- Description: Expand public-content query responses and demo seed density so redesigned public pages can render richer stats, lists, and highlights without schema changes.
- Expected files affected:
  - `src/application/**`
  - `src/infrastructure/persistence/**`
  - `src/infrastructure/demo-data/**`
  - `tests/application/**`
  - `tests/infrastructure/**`
- Acceptance criteria:
  - public fundraiser, community, and profile responses expose the derived stats required by the redesign
  - a shared fundraiser summary shape is introduced where the same data is reused across pages
  - demo seed data is rich enough to populate supporter lists, leaderboard entries, profile highlights, and activity sections
  - no schema migration is introduced for this task
- Tests required:
  - targeted public-content application tests
  - targeted Postgres repository integration tests

### Task 021: Public Fundraiser Page Web Awesome Redesign
- Description: Rebuild the public fundraiser page to match the approved reference more closely using the shared shell, Web Awesome primitives, and CSS modules.
- Expected files affected:
  - `src/presentation/fundraisers/**`
  - `src/presentation/shared/**`
  - `public/**`
  - `tests/presentation/fundraisers/**`
- Acceptance criteria:
  - the fundraiser page uses a two-column layout with a large media area and sticky support sidebar on desktop
  - donate entry remains functional through the current MVP donation flow backed by the mocked payment processor
  - organizer and connected community links remain functional
  - unsupported interactions remain visually present but non-misleading
- Tests required:
  - targeted fundraiser presentation tests
  - `npm run build`

### Task 022: Public Community Page Web Awesome Redesign
- Description: Rebuild the public community page with a split hero, leaderboard presentation, and tabbed sections backed by derived community data.
- Expected files affected:
  - `src/presentation/communities/**`
  - `src/presentation/shared/**`
  - `tests/presentation/communities/**`
- Acceptance criteria:
  - the community page uses the shared shell and screenshot-inspired layout
  - leaderboard cards and aggregate stats render from the enriched public community response
  - tabbed Activity, Fundraisers, and About sections are present and map to supported product data
- Tests required:
  - targeted community presentation tests
  - `npm run build`

### Task 023: Public Profile Page Web Awesome Redesign
- Description: Rebuild the public profile page with header treatment, highlight cards, and a richer recent-activity section using the new shared design system.
- Expected files affected:
  - `src/presentation/profiles/**`
  - `src/presentation/shared/**`
  - `tests/presentation/profiles/**`
- Acceptance criteria:
  - the profile page uses the shared shell and a screenshot-inspired composition
  - profile counters, highlights, and recent activity render from the enriched public profile response
  - linked fundraisers and communities remain navigable
- Tests required:
  - targeted profile presentation tests
  - `npm run build`

### Task 024: Playwright Public-Surface Validation and Polish
- Description: Use Playwright CLI to validate the redesigned public surface in a real browser and apply final responsive and spacing polish.
- Expected files affected:
  - `src/presentation/**`
  - `output/playwright/**`
  - `tasks/task_024_playwright_public_surface_validation_and_polish.md`
- Acceptance criteria:
  - desktop and mobile browser checks cover home, fundraiser, community, and profile pages
  - screenshots or other CLI artifacts are captured under `output/playwright/`
  - final polish addresses the highest-priority issues found during browser validation
- Tests required:
  - Playwright CLI validation run
  - `npm test`
  - `npm run lint`
  - `npm run build`

## Milestone 9: Session-Aware Browse and Navigation

### Task 025: Browser Session Cookie And Demo Login Seed
- Description: Add a real browser-session transport for the existing auth flow, make protected write routes accept cookie-backed sessions, and seed reusable demo login credentials for the prototype catalog users.
- Expected files affected:
  - `src/presentation/auth/**`
  - `src/presentation/api/**`
  - `src/infrastructure/auth/**`
  - `tests/presentation/api/**`
  - `tests/infrastructure/auth/**`
- Acceptance criteria:
  - login sets the `gofundme_v2_session` cookie on success while preserving the existing JSON response body
  - logout clears the browser session cookie and accepts either the cookie or the legacy session header
  - session lookup and protected write routes prefer the browser cookie while still supporting the legacy header transport
  - demo login credentials exist for Avery, Jordan, and Morgan with the shared password `Prototype123!`
- Tests required:
  - targeted auth route-handler and auth repository tests
  - `npm run build`

### Task 026: Dedicated Login Page And Shell Auth State
- Description: Add a dedicated `/login` page for the seeded prototype accounts and make the shared public shell reflect signed-out versus signed-in browser session state using the existing session lookup flow.
- Expected files affected:
  - `src/app/login/**`
  - `src/presentation/auth/**`
  - `src/presentation/shared/**`
  - `src/presentation/home/**`
  - `tests/presentation/auth/**`
  - `tests/presentation/shared/**`
  - `README.md`
- Acceptance criteria:
  - `/login` renders an email/password sign-in form with pending, invalid-credential, and generic request error states
  - authenticated requests to `/login` redirect away to a safe internal `next` path or `/`
  - the public shell shows `Sign in` when anonymous and signed-in role plus sign-out controls when authenticated
  - home, fundraiser, community, and profile routes all resolve browser-session viewer state on the server and pass it into the shared shell
- Tests required:
  - targeted presentation tests for login and public shell state
  - `npm test`
  - `npm run lint`
  - `npm run build`

### Task 027: Public Browse Queries And Viewer Profile Lookup
- Description: Extend the public-content layer with top-level fundraiser and community browse queries, add a lightweight public-profile-slug lookup by `userId` for the shared shell, and expand the prototype seed data so browse pages have multiple communities to render.
- Expected files affected:
  - `src/application/public-content/**`
  - `src/application/api/create-application-api.ts`
  - `src/infrastructure/public-content/**`
  - `src/infrastructure/demo-data/**`
  - `tests/application/public-content/**`
  - `tests/infrastructure/**`
- Acceptance criteria:
  - the application layer exposes `listPublicFundraisers()`, `listPublicCommunities()`, and `getPublicProfileSlugByUserId(userId)`
  - fundraiser browse data is sorted active-first and then by support momentum
  - community browse data is sorted by follower count descending and then newest first
  - seeded prototype data is rich enough to support browse-card rendering
- Tests required:
  - targeted public-content query tests
  - targeted Postgres repository tests
  - `npm run build`

### Task 028: Public Fundraisers And Communities Index Pages
- Description: Add top-level `/fundraisers` and `/communities` public browse routes that render responsive card grids of public content using the new list queries.
- Expected files affected:
  - `src/app/fundraisers/page.tsx`
  - `src/app/communities/page.tsx`
  - `src/presentation/fundraisers/**`
  - `src/presentation/communities/**`
  - `tests/presentation/fundraisers/**`
  - `tests/presentation/communities/**`
- Acceptance criteria:
  - `/fundraisers` renders a public browse page backed by `listPublicFundraisers()`
  - `/communities` renders a public browse page backed by `listPublicCommunities()`
  - fundraiser cards show title, story excerpt, support meta, and organizer/community context
  - community cards show name, description, follower/fundraiser counts, and owner context
  - the browse pages stay intentionally simple for v1 with no search, sort UI, or filters
- Tests required:
  - targeted fundraiser and community browse-page tests
  - `npm run build`

### Task 029: Shared Nav Simplification And Entrypoint Cleanup
- Description: Simplify the shared public navbar to the approved `Profile` / `Communities` / `Fundraisers` / `Sign in` or `Sign out` model, hide `Profile` when no public profile slug exists for the signed-in viewer, and update home-page discovery entry points to target the new browse pages.
- Expected files affected:
  - `src/app/**`
  - `src/presentation/auth/**`
  - `src/presentation/shared/**`
  - `src/presentation/home/**`
  - `tests/presentation/**`
  - `tests/presentation/api/**`
- Acceptance criteria:
  - the shared shell shows only `Profile`, `Communities`, `Fundraisers`, and `Sign in` or `Sign out`
  - `Profile` appears only when a signed-in viewer has a resolvable public profile slug
  - desktop and mobile navigation use the same item set and ordering rules
  - home-page primary discovery entry points target `/fundraisers` and `/communities`
- Tests required:
  - targeted shared shell, home page, and public page regression tests
  - `npm test`
  - `npm run lint`
  - `npm run build`

Standalone incremental tasks tracked only in `tasks/` for this milestone:
- Task 030 moved Web Awesome registration upfront at client-module load time.
- Task 031 fixed the fundraiser sidebar progress-ring layout.
- Task 032 replaced the fundraiser progress ring with a linear progress bar.

## Milestone 10: Donations, Relationships, and Viewer-Aware Detail Pages

### Task 033: Real System-Wide Donation Flow
- Description: Replace the prototype donation intent behavior with a real persisted donation flow that creates completed donations immediately while continuing to mock only the payment processor.
- Expected files affected:
  - `docs/**`
  - `src/application/**`
  - `src/domain/**`
  - `src/infrastructure/**`
  - `src/presentation/**`
  - `src/app/api/engagement/**`
  - `tests/**`
- Acceptance criteria:
  - clicking donate reveals an amount form on the fundraiser page
  - submitting the form creates a completed donation without collecting real payment data
  - donations persist to the database and update fundraiser totals, recent supporters, community stats, and profile activity from database-backed reads
  - public APIs and read models use donation terminology rather than donation-intent terminology
  - the legacy `/api/engagement/donation-intents` path remains as a compatibility alias during the transition
- Tests required:
  - donation use-case tests
  - route tests for canonical and alias donation submission endpoints
  - repository tests covering persistence, aggregates, and legacy backfill
  - presentation tests for the fundraiser donation form
  - end-to-end regression coverage for system-wide donation propagation
  - `npm run lint`
  - `npm run build`

### Task 034: Profile Relationship Navigation
- Description: Add dedicated follower and following profile routes, expose profile relationship members in the public read models, and make public profile references clickable across the connected public surfaces.
- Expected files affected:
  - `docs/plan.md`
  - `src/application/public-content/**`
  - `src/infrastructure/public-content/**`
  - `src/infrastructure/persistence/postgres/**`
  - `src/app/profiles/**`
  - `src/presentation/**`
  - `tests/application/public-content/**`
  - `tests/infrastructure/**`
  - `tests/presentation/**`
- Acceptance criteria:
  - the profile page `followers` and `following` counters link to dedicated public relationship routes
  - profile relationship routes render public member lists from the existing profile query pipeline
  - public profile read models include relationship members and profile-only following counts
  - community discussion authors and fundraiser/community profile references navigate to public profile pages when a public profile slug exists
  - fundraiser and community browse cards preserve primary destination links while exposing organizer or owner profile links separately
- Tests required:
  - application public-content query tests
  - repository tests for profile relationship lists and counts
  - presentation tests for profile, fundraiser, community, and browse navigation updates
  - public route-handler tests for additive response payload changes
  - `npm run build`

### Task 035: Public Detail Viewer Follow State
- Description: Extend the public profile, community, and fundraiser read pipeline so detail-page queries can accept optional viewer context and return viewer-specific follow metadata without exposing raw owner IDs.
- Expected files affected:
  - `src/application/public-content/**`
  - `src/infrastructure/public-content/**`
  - `src/infrastructure/persistence/postgres/**`
  - `src/presentation/api/public/**`
  - `src/app/profiles/**`
  - `src/app/communities/**`
  - `src/app/fundraisers/**`
  - `tests/application/public-content/**`
  - `tests/infrastructure/**`
  - `tests/presentation/api/**`
- Acceptance criteria:
  - detail queries accept optional `viewerUserId`
  - profile, community, and fundraiser detail responses include `viewerFollowState` with anonymous, following, non-following, and self-owned states
  - public JSON read routes use the existing session cookie/header to populate the same viewer-aware follow state
  - this task does not change visible follow-button behavior yet
- Tests required:
  - application public-content query tests
  - static and Postgres repository tests for viewer follow-state lookup
  - public route-handler tests for additive response payload changes

### Task 036: Profile and Community Follow Controls
- Description: Replace the static profile and community follow buttons with a reusable presentation-layer follow control that redirects anonymous users to login, toggles follow/unfollow for signed-in users, hides on self-owned targets, and refreshes server-rendered state after success.
- Expected files affected:
  - `src/presentation/engagement/**`
  - `src/presentation/profiles/**`
  - `src/presentation/communities/**`
  - `tests/presentation/engagement/**`
  - `tests/presentation/profiles/**`
  - `tests/presentation/communities/**`
- Acceptance criteria:
  - the public profile hero follow button works for authenticated users and redirects anonymous users to `/login?next=<current page>`
  - the public community hero follow button works with the same behavior
  - self-owned profile and community pages do not render the control
  - non-auth API failures show inline error feedback and do not desync button state
- Tests required:
  - client follow-control tests for redirect, follow, unfollow, and error states
  - profile page presentation tests
  - community page presentation tests

### Task 037: Fundraiser Follow Controls
- Description: Add the same reusable follow/unfollow control to the fundraiser detail page, placing it in the primary support CTA groups while preserving the existing donate/share flow.
- Expected files affected:
  - `src/presentation/engagement/**`
  - `src/presentation/fundraisers/**`
  - `tests/presentation/fundraisers/**`
  - `tests/presentation/engagement/**`
- Acceptance criteria:
  - the fundraiser detail page shows a working follow/unfollow control for non-owner viewers
  - anonymous clicks redirect to login with the fundraiser page as `next`
  - self-owned fundraiser pages hide the control
  - existing donation and share interactions remain unchanged
- Tests required:
  - fundraiser page presentation tests
  - shared follow-control regression tests if the shared component contract changes
  - `npm run lint`
  - `npm run build`

### Task 038: Manual Prototype Reset Page
- Description: Remove automatic prototype catalog seeding from persistence bootstrap and replace it with a hidden manual reset flow so deleted or changed demo rows are not silently reinserted on the next page load.
- Expected files affected:
  - `src/application/persistence/**`
  - `src/infrastructure/auth/**`
  - `src/infrastructure/persistence/postgres/**`
  - `src/presentation/api/prototype/**`
  - `src/presentation/prototype/**`
  - `src/app/api/prototype/**`
  - `src/app/prototype/**`
  - `README.md`
  - `tests/**`
- Acceptance criteria:
  - `createPersistenceBootstrapper(...).ensureReady()` is schema/storage-only and no longer repopulates prototype catalog rows
  - a manual hard reset flow restores the prototype catalog and demo login credentials through a dedicated application use case and Postgres adapter
  - a hidden public page exists at `/prototype/reset` with a single reset button and inline success/error feedback
  - a public `POST /api/prototype/reset` endpoint performs the reset without auth
  - follow removals persist across refresh until the manual reset flow is triggered
- Tests required:
  - application, persistence, auth, route-handler, and presentation tests for prototype reset
  - follow persistence regression coverage
  - `npm run lint`
  - `npm run build`

### Task 039: Explicit Fundraiser-to-Community Linkage
- Description: Replace owner-derived fundraiser/community linkage with a real fundraiser-to-community relationship so fundraiser detail pages, community counts, and leaderboards are driven by explicit linkage rather than shared ownership heuristics.
- Expected files affected:
  - `docs/architecture.md`
  - `src/domain/fundraisers/**`
  - `src/infrastructure/persistence/**`
  - `src/infrastructure/demo-data/**`
  - `src/infrastructure/public-content/**`
  - `src/application/public-content/**`
  - `tests/**`
- Acceptance criteria:
  - `Fundraiser` stores an explicit optional `communityId` in the domain model and persistence schema
  - the Postgres schema adds `fundraisers.community_id` with the correct foreign-key and index support
  - persistence bootstrap upgrades legacy databases and backfills prototype fundraiser rows to the intended community IDs
  - public fundraiser and community reads derive linkage, counts, and leaderboards from explicit fundraiser-to-community relationships only
- Tests required:
  - domain, schema, bootstrap, repository, application-query, and public route-handler regression tests
  - `npm run build`

## Milestone 11: Public Creation and Activity Flows

### Task 040: Community and Fundraiser Creation Flows
- Description: Add dedicated create flows for communities and fundraisers, including authenticated create CTAs on the browse pages, protected create pages, server-backed submissions, and optional fundraiser-to-community linkage to one of the creator's owned communities.
- Expected files affected:
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
- Acceptance criteria:
  - `/communities` and `/fundraisers` render create CTAs that link directly for authenticated viewers and route anonymous viewers through `/login?next=...`
  - dedicated create pages exist for both resources and submit through server-backed create flows rather than client-only mock state
  - `POST /api/communities` and `POST /api/fundraisers` create records owned by the current session user
  - fundraiser creation accepts optional `communityId` linkage only when the selected community is owned by the current viewer
  - successful creates redirect to the new public detail pages and newly created records appear in the existing browse/detail reads
  - signed-in supporters may create communities and fundraisers in v1 without changing their account role or profile type
- Tests required:
  - application tests for create-community and create-fundraiser behavior
  - presentation and API tests for authenticated, anonymous, invalid, forbidden, and success submission paths
  - browse-page CTA and create-page auth-redirect tests
  - persistence adapter tests covering inserted rows and optional fundraiser-to-community linkage
  - `npm run build`

Standalone incremental tasks tracked only in `tasks/` after Task 040:
- Task 041 removed fundraiser story filler copy and refreshed seeded fundraiser stories.
- Task 042 simplified the public community hero to one persisted description block.

### Task 043: Community Activity Posting and Commenting
- Description: Make the public community page activity tab functional by allowing authorized publishers to post community updates and authenticated viewers to add comments from the page itself while removing the non-functional latest-sorting control.
- Expected files affected:
  - `src/presentation/communities/**`
  - `tests/presentation/communities/**`
  - `tests/e2e/**`
- Acceptance criteria:
  - the public community activity tab no longer renders the non-functional latest-sorting control
  - community activity remains ordered latest-first using the existing public community read query
  - community owners, moderators, and admins can submit new updates from the activity tab
  - authenticated viewers can submit comments on visible activity posts from the activity tab
  - anonymous viewers can read activity and comments but see sign-in CTAs instead of active comment forms
  - successful submissions refresh the route so the activity tab re-renders from the canonical server response
- Tests required:
  - updated public community page presentation tests
  - end-to-end regression coverage for activity posting/commenting
  - `npm run lint`
  - `npm run build`

Standalone incremental tasks tracked only in `tasks/` after Task 043:
- Task 044 made the fundraiser supporter-rail controls functional without changing contracts.
- Task 045 replaced inert fundraiser share buttons with an in-place share modal and copy-link flow.
- Task 046 replaced the no-op analytics publisher with Postgres-backed persistence, historical backfill, unfollow tracking, and an unlinked public analytics dashboard.

## Milestone 12: AI Re-engagement

### Task 047: Supporter Digest AI
- Description: Add an authenticated in-app digest that summarizes meaningful changes across followed fundraisers and communities since the viewer last opened the digest, using deterministic ranking plus OpenAI-backed narration with fallback copy.
- Expected files affected:
  - `docs/**`
  - `tasks/task_047_supporter_digest_ai.md`
  - `src/application/**`
  - `src/domain/**`
  - `src/infrastructure/**`
  - `src/presentation/**`
  - `src/app/**`
  - `infra/terraform/**`
  - `tests/**`
- Acceptance criteria:
  - authenticated viewers can open `/digest` and see ranked highlights based only on followed fundraisers and communities
  - digest state persists `last_viewed_at` and defines the digest window as “since last digest open”
  - candidate selection and ranking remain deterministic and exclude moderated content
  - OpenAI generates structured highlight narration through an infrastructure adapter, with deterministic fallback when unavailable or invalid
  - `POST /api/engagement/digest-views` acknowledges the rendered digest and advances the cursor only forward
  - production configuration supports secret-backed `OPENAI_API_KEY` plus runtime model and timeout env vars
- Tests required:
  - application, domain, infrastructure, and presentation tests for digest ranking, narration fallback, persistence, and page rendering
  - `npm test`
  - `npm run lint`
  - `npm run build`
