# Architecture Checks

This document describes the architectural checks CI should enforce to keep the repository aligned with [docs/architecture.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture.md) and [docs/architecture_rules.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture_rules.md).

## Goal
CI should block changes that introduce architecture drift, invalid dependency directions, or direct coupling between layers that are meant to stay isolated.

## Required Checks

### 1. Layer import boundaries
CI should fail when imports violate the approved dependency direction:
- allow `presentation -> application`
- allow limited `presentation -> domain` for shared read-only types or enums
- allow `application -> domain`
- allow `application -> infrastructure` only through approved interfaces or composition roots
- allow `infrastructure -> domain`
- allow `infrastructure -> application` only when implementing application-defined interfaces
- forbid:
  - `domain -> presentation`
  - `domain -> application`
  - `domain -> infrastructure`
  - `application -> presentation`

### 2. Module boundary enforcement
CI should fail when one domain module imports another module's private implementation files.

Allowed pattern:
- importing a module's public surface or explicitly exported types

Forbidden pattern:
- reaching into another module's internal adapters, repositories, helpers, or private service files

### 3. Presentation layer restrictions
CI should fail when `presentation` code:
- imports database clients or ORM implementations directly
- imports AWS SDK clients or infrastructure adapters directly for business workflows
- implements business rules that should live in `application` or `domain`

### 4. Domain purity checks
CI should fail when `domain` code depends on:
- framework request or response objects
- HTTP or routing libraries
- database or ORM clients
- analytics vendor SDKs
- AWS SDKs
- auth provider SDKs

### 5. Infrastructure containment
CI should ensure infrastructure concerns stay under `src/infrastructure/`, including:
- persistence adapters
- auth integrations
- analytics adapters
- AWS-specific integrations
- deployment-facing runtime wiring

### 6. Public entry point conventions
CI should encourage each module to expose a small public surface through clear entry points such as:
- `index.ts`
- `public.ts`
- named service or contract files with stable import paths

### 7. Task-sized change discipline
If CI later has access to PR metadata, it should flag changes that combine:
- unrelated architectural refactors and feature work
- multiple backlog tasks in one PR
- document-breaking changes without matching doc updates

## Recommended Enforcement Tools
- import graph or dependency boundary tooling to validate layer and module imports
- lint rules for restricted imports by directory
- repository scripts that scan for forbidden framework or SDK imports in `src/domain/`
- CI jobs that compare changed files against expected architecture patterns

Tool choice is flexible. The enforcement outcome matters more than the specific vendor or package.

## Minimum CI Gates
At minimum, CI should block merges when:
- import boundaries are violated
- architecture docs are not updated alongside architectural exceptions
- presentation reaches directly into infrastructure for core workflows
- domain code imports framework, database, auth, analytics, or AWS-specific dependencies

## Future Enhancements
As the codebase grows, CI should add checks for:
- module-level ownership boundaries
- prohibited circular dependencies
- per-layer test coverage visibility
- route-to-use-case enforcement patterns
- detection of shared utility files that accumulate unrelated concerns
