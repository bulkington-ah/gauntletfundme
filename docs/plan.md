# Development Plan

This plan breaks the MVP into dependency-ordered milestones and small implementation tasks. Each task is intended to be handled in one focused change and should map cleanly to a future file in `tasks/`.

## Milestone 1: Project Foundation

### Task 001: Project scaffold
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

### Task 002: Core configuration and local development workflow
- Description: Add shared development configuration for environment loading, test execution, linting, formatting, and local Docker support where helpful for parity.
- Expected files affected:
  - `.env.example`
  - Docker-related files if used
  - lint and test config files
  - `README.md`
  - `harness/**` once harness docs exist
- Acceptance criteria:
  - required environment variables are documented
  - contributors can run the app, tests, and quality checks with predictable commands
  - local development guidance matches the agent workflow and architecture constraints
- Tests required:
  - config validation check if implemented
  - smoke run of lint and test commands

## Milestone 2: Domain and Persistence Base

### Task 003: Core data schema and shared domain types
- Description: Define the initial database schema and domain types for `User`, `UserProfile`, `Fundraiser`, `Community`, `Post`, `Comment`, `Follow`, `Donation`, and `Report`.
- Expected files affected:
  - `src/domain/**`
  - `src/infrastructure/persistence/**`
  - schema or migration files
  - `tests/domain/**`
  - `tests/infrastructure/**`
- Acceptance criteria:
  - all core entities from the product spec exist in domain and persistence form
  - relationships and enums support ownership, moderation status, and polymorphic follows
  - schema naming aligns with the architecture rules
- Tests required:
  - domain model tests for basic invariants
  - persistence schema or repository smoke tests

### Task 004: Repository interfaces and persistence adapters
- Description: Introduce repository interfaces in the application or domain boundary and back them with infrastructure adapters for the core entities.
- Expected files affected:
  - `src/application/**`
  - `src/domain/**`
  - `src/infrastructure/persistence/**`
  - `tests/application/**`
  - `tests/infrastructure/**`
- Acceptance criteria:
  - read and write access patterns for core entities are abstracted behind clear interfaces
  - infrastructure code does not leak directly into presentation or domain
  - repository organization follows module boundaries instead of a global data bucket
- Tests required:
  - repository contract tests
  - adapter tests using the selected database tooling

## Milestone 3: Authentication and Access Control

### Task 005: Account and session foundation
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

### Task 006: Ownership and authorization policies
- Description: Add reusable authorization checks for profile editing, community management, posting, commenting, following, donation submission, and moderation.
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

### Task 007: Public profile page
- Description: Implement the public profile view for supporter and organizer identities, including profile details and connected entities.
- Expected files affected:
  - `src/presentation/profiles/**`
  - `src/application/profiles/**`
  - `src/domain/profiles/**`
  - `tests/**/profiles/**`
- Acceptance criteria:
  - a profile can be fetched by slug
  - the page renders the identity clearly for either supporter or organizer context
  - connected content such as communities or fundraisers is surfaced without requiring login
- Tests required:
  - profile page render tests
  - application query tests for profile retrieval

### Task 008: Public fundraiser page
- Description: Implement the fundraiser view with organizer context, story content, and donation entry points.
- Expected files affected:
  - `src/presentation/fundraisers/**`
  - `src/application/fundraisers/**`
  - `src/domain/fundraisers/**`
  - `tests/**/fundraisers/**`
- Acceptance criteria:
  - a fundraiser can be fetched by slug
  - the page shows organizer, story, progress, and connected community or profile links
  - the donation entry point is visible and clearly scoped to the MVP's mocked payment processor
- Tests required:
  - fundraiser page render tests
  - fundraiser query tests

### Task 009: Public community page and discussion feed
- Description: Implement the community page with public discovery, recent posts, and comment visibility.
- Expected files affected:
  - `src/presentation/communities/**`
  - `src/application/communities/**`
  - `src/application/discussion/**`
  - `src/domain/communities/**`
  - `src/domain/discussion/**`
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

### Task 010: Follow and unfollow flows
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

### Task 011: Post and comment creation
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

### Task 012: Mocked donation intent flow
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

### Task 013: Reporting workflow
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

### Task 014: Moderator action flow
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

## Milestone 7: Analytics and Product Readiness

### Task 015: Analytics instrumentation
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

### Task 016: Deployment baseline and production hardening
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

### Task 017: MVP end-to-end validation and polish
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

## Milestone 8: Public Surface Redesign

### Task 019: Web Awesome foundation and public shell
- Description: Introduce Web Awesome as the shared public-surface design foundation and add a reusable public site shell with a shared navigation bar and responsive mobile menu.
- Expected files affected:
  - `package.json`
  - `src/app/**`
  - `src/presentation/shared/**`
  - `src/presentation/home/**`
  - `src/presentation/fundraisers/**`
  - `src/presentation/communities/**`
  - `src/presentation/profiles/**`
  - `src/types/**`
  - `tests/presentation/**`
  - `tasks/task_019_webawesome_foundation_and_public_shell.md`
- Acceptance criteria:
  - Web Awesome is installed and theme styles are loaded through the shared app layout
  - a client-side component registry exists for the initial set of shared public components
  - the public shell renders a shared navbar and responsive mobile navigation
  - the home page adopts the new shared shell
  - the existing public fundraiser, community, and profile pages render within the shared shell without changing their underlying product behavior
- Tests required:
  - targeted presentation tests for home, fundraiser, community, and profile pages
  - `npm run build`

### Task 020: Public page derived view models and demo seed
- Description: Expand public-content query responses and demo seed density so redesigned public pages can render richer stats, lists, and highlights without schema changes.
- Expected files affected:
  - `src/application/**`
  - `src/infrastructure/persistence/**`
  - `src/infrastructure/demo-data/**`
  - `tests/application/**`
  - `tests/infrastructure/**`
  - `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- Acceptance criteria:
  - public fundraiser, community, and profile responses expose the derived stats required by the redesign
  - a shared fundraiser summary shape is introduced where the same data is reused across pages
  - demo seed data is rich enough to populate supporter lists, leaderboard entries, profile highlights, and activity sections
  - no schema migration is introduced for this task
- Tests required:
  - targeted public-content application tests
  - targeted Postgres repository integration tests

### Task 021: Public fundraiser page Web Awesome redesign
- Description: Rebuild the public fundraiser page to match the approved reference more closely using the shared shell, Web Awesome primitives, and CSS modules.
- Expected files affected:
  - `src/presentation/fundraisers/**`
  - `src/presentation/shared/**`
  - `public/**`
  - `tests/presentation/fundraisers/**`
  - `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- Acceptance criteria:
  - the fundraiser page uses a two-column layout with a large media area and sticky support sidebar on desktop
  - donate entry remains functional through the current MVP donation flow backed by the mocked payment processor

## Milestone 9: Donation Flow Upgrade

### Task 033: Real system-wide donation flow
- Description: Replace the prototype donation intent behavior with a real persisted donation flow that creates completed donations immediately while continuing to mock only the payment processor.
- Expected files affected:
  - `docs/**`
  - `src/application/**`
  - `src/domain/**`
  - `src/infrastructure/**`
  - `src/presentation/**`
  - `src/app/api/engagement/**`
  - `tests/**`
  - `tasks/task_033_real_system_wide_donation_flow.md`
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
  - organizer and connected community links remain functional
  - unsupported interactions remain visually present but non-misleading
- Tests required:
  - targeted fundraiser presentation tests
  - `npm run build`

### Task 034: Profile relationship navigation
- Description: Add dedicated follower and following profile routes, expose profile relationship members in the public read models, and make public profile references clickable across the connected public surfaces.
- Expected files affected:
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

### Task 022: Public community page Web Awesome redesign
- Description: Rebuild the public community page with a split hero, leaderboard presentation, and tabbed sections backed by derived community data.
- Expected files affected:
  - `src/presentation/communities/**`
  - `src/presentation/shared/**`
  - `tests/presentation/communities/**`
  - `tasks/task_022_public_community_page_webawesome_redesign.md`
- Acceptance criteria:
  - the community page uses the shared shell and screenshot-inspired layout
  - leaderboard cards and aggregate stats render from the enriched public community response
  - tabbed Activity, Fundraisers, and About sections are present and map to supported product data
- Tests required:
  - targeted community presentation tests
  - `npm run build`

### Task 023: Public profile page Web Awesome redesign
- Description: Rebuild the public profile page with header treatment, highlight cards, and a richer recent-activity section using the new shared design system.
- Expected files affected:
  - `src/presentation/profiles/**`
  - `src/presentation/shared/**`
  - `tests/presentation/profiles/**`
  - `tasks/task_023_public_profile_page_webawesome_redesign.md`
- Acceptance criteria:
  - the profile page uses the shared shell and a screenshot-inspired composition
  - profile counters, highlights, and recent activity render from the enriched public profile response
  - linked fundraisers and communities remain navigable
- Tests required:
  - targeted profile presentation tests
  - `npm run build`

### Task 024: Playwright public-surface validation and polish
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
