# GoFundMe V2

## Overview
This repository is the foundation for a donor-first GoFundMe MVP that connects profile, fundraiser, and community pages into one cohesive product. The goal is to create a web experience that increases community growth, repeat engagement, and meaningful supporter actions such as follows, comments, and mocked donation starts.

This repository currently contains product definition, architecture guidance, development planning, and AI agent workflow documents. It does not yet implement product features.

## Product Direction
The MVP is designed around:
- public browsing of profile, fundraiser, and community pages
- authenticated actions such as follow, comment, and mocked donation intent creation
- dual-purpose profiles for supporters and organizers
- community discussion through posts and comments
- basic moderation and analytics support

User-facing AI features are explicitly out of scope for v1. AI is intended to accelerate delivery, not define the first shipped experience.

See:
- [docs/product_spec.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/product_spec.md)

## Architecture Summary
The system is planned as a modular monolith with four primary layers:
- `src/presentation`
- `src/application`
- `src/domain`
- `src/infrastructure`

The intended implementation is a thin full-stack web application, ideally using React or Next.js, with AWS as the preferred deployment target. Docker may be used to improve deployment consistency and local development parity.

Key architectural principles:
- business logic belongs in `domain` and `application`
- presentation code should not contain persistence or core workflow logic
- infrastructure integrations stay isolated under `src/infrastructure`
- public reads and authenticated commands should have clear API boundaries

See:
- [docs/architecture.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture.md)
- [docs/architecture_rules.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture_rules.md)

## Development Workflow
Work is organized into small, dependency-ordered tasks.

Primary planning documents:
- [docs/plan.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/plan.md)
- [tasks](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/tasks)
- [harness/architecture_checks.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/harness/architecture_checks.md)
- [harness/coding_standards.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/harness/coding_standards.md)

Expected repository structure:

```text
src/
tests/
docs/
tasks/
harness/
```

Implementation should proceed one task at a time, with small reviewable changes that stay within the approved architecture.

## How AI Agents Contribute
AI agents working in this repository should:
- read the product, architecture, and architecture rules before implementing changes
- select one task at a time from `tasks/` or from direct user instruction
- keep changes small and avoid mixing unrelated work
- add or update tests when behavior changes
- update docs when architecture, workflow, or product expectations change
- close out completed tasks by updating the task file with status, summary, verification, and handoff notes, then creating one scoped commit
- request review against both code quality and architectural consistency

The full workflow is documented in:
- [AGENTS.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/AGENTS.md)

## Current Status
Repository foundation is in place:
- product specification completed
- system architecture completed
- architecture rules completed
- AI agent workflow completed
- development plan completed
- initial backlog tasks created
- harness guidance created
- top-level directories initialized

## Recommended Next Step
Begin implementation with:
- [tasks/task_001_project_scaffold.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/tasks/task_001_project_scaffold.md)

That task establishes the application scaffold, layer layout, and placeholder app shell needed for all later work.
