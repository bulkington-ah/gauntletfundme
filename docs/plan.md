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
- Description: Define the initial database schema and domain types for `User`, `UserProfile`, `Fundraiser`, `Community`, `Post`, `Comment`, `Follow`, `DonationIntent`, and `Report`.
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
- Description: Add reusable authorization checks for profile editing, community management, posting, commenting, following, donation intent creation, and moderation.
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
- Description: Implement the fundraiser view with organizer context, story content, and mocked donation entry points.
- Expected files affected:
  - `src/presentation/fundraisers/**`
  - `src/application/fundraisers/**`
  - `src/domain/fundraisers/**`
  - `tests/**/fundraisers/**`
- Acceptance criteria:
  - a fundraiser can be fetched by slug
  - the page shows organizer, story, progress, and connected community or profile links
  - the donation entry point is visible but clearly leads to a mocked flow
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
- Description: Implement the donation intent workflow as a tracked, mocked checkout initiation rather than a real payment flow.
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
- Description: Add analytics events for page views, follows, comment creation, donation intent starts, and key community interactions.
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
  - the main flows work together: browse public pages, authenticate, follow, comment, start donation intent, and moderate content
  - major UX inconsistencies or broken transitions are resolved
  - remaining scope cuts or known limitations are documented
- Tests required:
  - end-to-end tests for the main user journeys
  - regression checks for previously completed milestone features
