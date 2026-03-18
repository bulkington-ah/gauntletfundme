# Architecture Rules

## Purpose
These rules exist to prevent architecture drift as AI agents and human contributors build the project. When a change conflicts with these rules, the rules win unless this document and the architecture are updated first.

## Canonical Layers
The application should use a modular monolith structure with four primary layers under `src/`:

- `presentation`: routes, pages, UI components, request parsing, response formatting
- `application`: use-case orchestration, authorization-aware commands, DTOs, transaction boundaries
- `domain`: business rules, entity invariants, policies, domain services
- `infrastructure`: database adapters, auth adapters, analytics adapters, AWS integrations, logging

Recommended domain modules:
- `accounts`
- `profiles`
- `fundraisers`
- `communities`
- `discussion`
- `engagement`
- `moderation`
- `analytics`

## Dependency Direction Rules
Allowed dependency direction is inward toward business logic.

Allowed imports:
- `presentation -> application`
- `presentation -> domain` only for read-only shared types or view-safe enums
- `application -> domain`
- `application -> infrastructure` only through interfaces, factories, or composition roots
- `infrastructure -> domain`
- `infrastructure -> application` only to implement application-defined interfaces

Forbidden imports:
- `domain -> application`
- `domain -> presentation`
- `domain -> infrastructure`
- `application -> presentation`
- cross-module imports into another module's internal files

Practical rule:
- if code needs a database client, auth SDK, analytics vendor, AWS SDK, or framework object, it does not belong in `domain`

## Layer Boundary Rules
- `presentation` may handle HTTP, cookies, forms, route params, and rendering concerns, but it must not contain business rules or persistence logic.
- `application` owns request-to-use-case orchestration, authorization checks, and coordination across domain modules.
- `domain` owns business behavior, validation rules tied to product meaning, moderation policies, and entity state transitions.
- `infrastructure` owns external concerns such as database queries, ORM configuration, auth provider wiring, analytics delivery, and cloud integration.
- Shared utilities must not become a dumping ground. A helper belongs in the narrowest layer that actually owns the concern.

## Business Logic Placement
- Entity invariants belong in `domain`.
- Workflow rules such as "only owners can edit" or "only authenticated users can comment" should be enforced in `application`, with domain policies reused where appropriate.
- Formatting for UI display belongs in `presentation`.
- Serialization, persistence mappings, and third-party payload transformations belong in `infrastructure`.
- Analytics event names may be defined centrally, but event emission should happen from `application` use cases at meaningful business moments.
- Donation submission behavior must remain clearly separated from any future real payment integration code.

## Module Boundary Rules
- Each domain module should expose a small public surface and keep internals private.
- Modules may depend on another module's exported types or use-case interfaces, but not on its private implementation files.
- Cross-module workflows should be coordinated in `application`, not by letting one domain module directly mutate another module's persistence layer.
- API routes or server actions must call application-layer entry points rather than reaching directly into repositories or adapters.
- Repositories and adapters should be organized by module, not as one global persistence bucket.

## Naming Conventions
- Directory names should be lowercase and plural for domain modules, such as `communities`, `fundraisers`, and `profiles`.
- Public entry points should use predictable names such as `index.ts`, `public.ts`, or clearly named module service files.
- Domain types and entities should use PascalCase names such as `Community`, `Donation`, and `UserProfile`.
- Application use cases should be verb-oriented, such as `createPost`, `followTarget`, `submitDonation`, and `reportComment`.
- Infrastructure adapters should be named by capability and provider when relevant, such as `PostgresCommunityRepository` or `AwsSecretsConfig`.
- Tests should mirror the subject they validate and use descriptive names tied to behavior rather than implementation details.

## Enforcement Expectations
- New code should be placed in the correct layer before a feature is considered complete.
- If a contributor needs a new dependency direction, they must update [docs/architecture.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture.md) and this document in the same change.
- Future CI checks should validate import boundaries, naming patterns, and direct access to infrastructure from `presentation`.
- Pull requests that mix unrelated architectural moves with feature work should be split before merge.
