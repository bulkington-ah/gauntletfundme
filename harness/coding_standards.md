# Coding Standards Checks

This document describes the coding standards CI should enforce so contributors and AI agents produce small, consistent, reviewable changes.

## Goal
CI should enforce baseline code quality, consistency, and task hygiene without forcing premature complexity.

## Required Checks

### 1. Formatting
CI should fail when repository formatting differs from the approved formatter output.

Expectations:
- one formatter configuration for the repo
- no manual formatting drift in changed files
- markdown, JSON, and source files should all be covered where practical

### 2. Linting
CI should fail on lint violations in changed code.

Lint rules should cover:
- unused imports and variables
- unreachable or dead code
- obvious type-safety issues
- accidental `any` expansion where stricter typing is expected
- inconsistent naming or export patterns where lint can enforce them

### 3. Type checking
CI should run project type checks and fail on type errors.

Expectations:
- application boundaries use explicit request and response types
- domain entities and key use cases have stable type definitions
- no layer should depend on implicit runtime shape guessing

### 4. Test execution
CI should run the relevant automated tests and fail on regressions.

Minimum expectation:
- smoke tests for scaffolded app behavior
- unit tests for domain logic and application use cases
- integration tests for persistence, routes, or server actions as they are introduced

### 5. Naming conventions
CI should enforce or flag naming drift where tooling can reasonably do so.

Conventions to support:
- PascalCase for domain entities and major types
- verb-oriented names for application use cases
- lowercase directory names for modules
- descriptive test names tied to behavior

### 6. Test file placement
CI should encourage tests to mirror the feature or module they validate.

Examples:
- domain tests under `tests/domain/`
- application tests under `tests/application/`
- presentation tests under `tests/presentation/`
- infrastructure tests under `tests/infrastructure/`

### 7. Environment safety
CI should fail when:
- required environment variables are undocumented
- secrets are hardcoded into source files
- deployment-specific values are committed instead of loaded from environment configuration

### 8. Documentation consistency
CI should flag changes that:
- introduce new architectural patterns without updating the architecture docs
- change workflow expectations without updating `AGENTS.md`
- add backlog structure changes without updating the related planning docs when needed

## Reviewability Standards
CI cannot fully judge PR scope, but it can support reviewability by checking for:
- extremely large diffs that likely combine multiple tasks
- missing tests on behavior changes
- missing docs when architecture or workflow changes occur

These should be warnings at first if hard enforcement is too noisy.

## Minimum CI Gates
At minimum, CI should block merges when:
- formatting fails
- linting fails
- type checking fails
- required automated tests fail
- hardcoded secrets are detected

## Future Enhancements
As the repository matures, CI should add:
- changed-file-aware test selection
- coverage thresholds for critical domain and application modules
- PR templates that require task references and tests run
- release-readiness checks for AWS deployment configuration and Docker packaging if containers are adopted
