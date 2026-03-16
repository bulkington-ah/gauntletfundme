# System Architecture

## System Overview
The MVP should be built as a thin full-stack web application that connects profile, fundraiser, and community experiences in one cohesive product. A single primary application should serve both the user interface and the backend API surface so the team can move quickly within the one-week prototype window. The application may be packaged as a Dockerized service so local development and AWS deployment options stay closely aligned.

The architecture should optimize for:
- public page performance for profile, fundraiser, and community browsing
- authenticated user actions such as follow, comment, and mocked donation start
- simple ownership and moderation workflows
- modular domain logic that can later be extracted or expanded without reworking the whole system

## Major Components
- `Web App`: React or Next.js application responsible for page rendering, navigation, authenticated experiences, and form handling.
- `Application API`: server-side route handlers or API endpoints that expose domain operations for auth, profiles, communities, posts, comments, follows, and donation intents.
- `Domain Services`: business logic layer that enforces permissions, validation, workflow rules, and cross-entity behavior.
- `Persistence Layer`: relational database access for core entities and relationships.
- `Auth Layer`: session management, login, logout, and identity checks for protected actions.
- `Analytics Layer`: event capture for page views, follows, comments, donation intent starts, and other engagement signals.
- `Moderation Controls`: lightweight reporting and content action workflows for owners or moderators.

## Module Boundaries
The codebase should stay modular inside one deployable application rather than splitting into separate services early.

- `presentation`:
  - page routes, UI components, form submission handlers, and view models
  - may call application API or server actions, but should not contain business rules
- `application`:
  - request orchestration, use-case entry points, DTO mapping, and auth-aware command handling
  - coordinates domain services and persistence
- `domain`:
  - core business logic and rules for profiles, fundraisers, communities, posts, comments, follows, donation intents, and moderation decisions
  - does not depend on UI framework details
- `infrastructure`:
  - database adapters, auth provider integration, analytics providers, logging, and deployment-specific code
  - implements interfaces consumed by the application or domain layers

Recommended domain modules:
- `accounts`
- `profiles`
- `fundraisers`
- `communities`
- `discussion`
- `engagement`
- `moderation`
- `analytics`

## Data Models
Core relational entities for the MVP:

- `User`
  - identity record for authentication and account ownership
  - fields: `id`, `email`, `displayName`, `role`, `createdAt`
- `UserProfile`
  - public-facing profile for a user
  - fields: `id`, `userId`, `slug`, `bio`, `avatarUrl`, `profileType`
- `Fundraiser`
  - fundraiser owned by a user or organizing identity
  - fields: `id`, `ownerUserId`, `slug`, `title`, `story`, `status`, `goalAmount`, `createdAt`
- `Community`
  - discussion and engagement space linked to a cause or organizer
  - fields: `id`, `ownerUserId`, `slug`, `name`, `description`, `visibility`, `createdAt`
- `Post`
  - community update or discussion item
  - fields: `id`, `communityId`, `authorUserId`, `title`, `body`, `status`, `createdAt`
- `Comment`
  - response on a community post
  - fields: `id`, `postId`, `authorUserId`, `body`, `status`, `createdAt`
- `Follow`
  - user relationship to a target entity
  - fields: `id`, `userId`, `targetType`, `targetId`, `createdAt`
- `DonationIntent`
  - mocked donation start for analytics and funnel tracking
  - fields: `id`, `userId`, `fundraiserId`, `amount`, `status`, `createdAt`
- `Report`
  - moderation report for a post or comment
  - fields: `id`, `reporterUserId`, `targetType`, `targetId`, `reason`, `status`, `createdAt`

Modeling assumptions:
- `targetType` fields should be enum-based to keep cross-entity actions explicit.
- Soft-delete or status fields are preferred over hard deletion for moderated content.
- Roles should remain simple in v1: `supporter`, `organizer`, `moderator`, `admin`.

## API Boundaries
The API should separate public reads from authenticated commands.

Public read endpoints:
- fetch profile by slug
- fetch fundraiser by slug
- fetch community by slug
- list community posts and comments

Authenticated user endpoints:
- sign up, login, logout, session lookup
- follow or unfollow a profile, fundraiser, or community
- create, edit, or delete owned posts and comments
- create donation intent
- submit moderation reports

Privileged endpoints:
- moderate reported posts or comments
- manage owned community or fundraiser settings

API design guidance:
- prefer resource-oriented JSON APIs or server actions with explicit request and response shapes
- keep write operations small and task-focused
- centralize authorization checks in the application layer before invoking domain logic

## Infrastructure Assumptions
- Single primary deployable web application, ideally using Next.js.
- AWS is the preferred cloud target for the web application and supporting managed services.
- The application may run in a Docker container to improve deployment consistency and local development parity.
- Managed relational database, preferably PostgreSQL, should be provisioned through AWS or a compatible managed provider.
- Object storage should remain optional and only be introduced later if media assets require it.
- Authentication may use a standard session-based library appropriate for Next.js.
- Analytics can start with a simple provider or internal event table before expanding.

## Scaling Considerations
- Keep the MVP as a modular monolith; do not introduce microservices yet.
- Optimize public page delivery with server-side rendering, caching, and CDN distribution.
- Add database indexes early for slugs, ownership lookups, follows, post listing, and comment listing.
- Treat analytics capture as append-only so it can later move to asynchronous processing if needed.
- Keep domain modules isolated so high-traffic areas like discussion or analytics can be extracted later without rewriting unrelated code.
- Keep deployment artifacts lean and production-oriented so AWS deploys stay fast and predictable.

## Security Considerations
- Require authentication for all protected actions and enforce authorization on the server.
- Validate ownership before allowing edits to profiles, communities, posts, or comments.
- Sanitize user-generated content and guard against XSS in rendered discussion content.
- Protect session and auth flows against common web risks such as CSRF, session fixation, and insecure cookie settings.
- Apply rate limiting or abuse checks to login, comment creation, follow actions, and report submission.
- Record moderation actions and important content state changes for traceability.
- Keep mocked donation flows clearly separated from real payment concerns so no sensitive payment data is collected in v1.
- Manage runtime secrets through AWS-managed environment configuration rather than baking them into deployment artifacts.
