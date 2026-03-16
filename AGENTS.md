# AI Agent Workflow

This repository is built incrementally by small, reviewable tasks. Agents must optimize for safe progress, architectural consistency, and minimal change scope.

## Source of Truth
- Read [docs/product_spec.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/product_spec.md) before implementing product behavior.
- Read [docs/architecture.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture.md) before introducing new modules, APIs, or data models.
- Read [docs/architecture_rules.md](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/docs/architecture_rules.md) before changing dependencies or file placement.
- If a requested change conflicts with these documents, stop and update the docs first or ask for clarification.

## Core Working Rules
- Work on one task at a time.
- Keep changes small enough to review quickly.
- Do not combine unrelated refactors with feature work.
- Do not implement product features that are outside the approved spec.
- Prefer the simplest change that satisfies the current task and preserves future flexibility.

## Coding Conventions
- Follow the modular monolith layers defined in `docs/architecture_rules.md`: `presentation`, `application`, `domain`, and `infrastructure`.
- Keep business rules out of UI code, route handlers, ORM models, and cloud adapters.
- Use descriptive names that match the architecture rules:
  - PascalCase for domain entities and types
  - verb-oriented names for application use cases
  - provider-aware names for infrastructure adapters
- Keep functions focused and cohesive.
- Avoid shared utility files unless the code is genuinely cross-cutting and ownership is clear.
- Prefer explicit types and predictable interfaces over implicit behavior.
- Keep comments brief and only add them where intent would otherwise be unclear.

## Expected Directory Structure
As the repository grows, agents should place code under this shape:

```text
src/
  presentation/
  application/
  domain/
  infrastructure/
tests/
docs/
tasks/
harness/
```

Placement rules:
- UI routes, pages, and components belong in `src/presentation/`.
- Use cases, commands, and orchestration belong in `src/application/`.
- Entities, policies, and domain services belong in `src/domain/`.
- Database, auth, analytics, and AWS-specific integrations belong in `src/infrastructure/`.
- Automated tests belong in `tests/`, mirrored by feature or module.
- Planning and architecture documents belong in `docs/`.
- Small implementation briefs belong in `tasks/`.
- CI and consistency guidance belongs in `harness/`.

## How Agents Select Tasks
- Prefer an explicit task file in `tasks/` when one exists.
- If no task file exists, use the next approved milestone from `docs/plan.md` once that file exists.
- If neither exists, work only from direct user instructions.
- Never pick multiple backlog items in one change.
- If a task is too large for a single focused change, split it into smaller tasks before implementing.

## How Agents Implement Features
- Start by reading the relevant docs and the files that will likely change.
- Confirm the task boundary before editing code.
- Make the smallest complete change that satisfies the task.
- Add or update tests in the same change whenever behavior changes.
- Preserve clean module boundaries:
  - routes and UI call application-layer entry points
  - application coordinates workflows
  - domain owns business rules
  - infrastructure handles external systems
- Keep mocked donation logic clearly separate from any future real payment integration.
- Treat auth, moderation, and analytics as first-class concerns when a task touches them.
- If a task requires a new dependency direction or architectural exception, update the architecture docs in the same change.

## How Agents Run Tests
- Run the smallest relevant test command first.
- Prefer targeted tests for the changed area before running the full suite.
- When adding a new module, add matching tests alongside the implementation plan for that module.
- If the required test harness does not exist yet, document the gap clearly in the change summary.
- Do not mark a task complete without either:
  - running relevant tests, or
  - explicitly stating why tests could not be run

## How Agents Close Out Completed Tasks
- Close out every completed task in this order:
  - run relevant tests, or document the testing gap clearly
  - update the matching task file in `tasks/`
  - change the task `Status` to `Complete`
  - add `Completion Summary`, `Verification`, and `Handoff Notes` sections to the task file
  - create one scoped commit for that task unless the user explicitly says not to commit
- `Completion Summary` should explain what changed and any important implementation or architecture decisions.
- `Verification` should list the exact commands run, or explicitly state why tests could not be run.
- `Handoff Notes` should capture residual risks, follow-ups, environment caveats, or anything the next agent should know.
- Keep the commit scoped to the current task only.
- Do not sweep unrelated pre-existing changes into the task commit.
- Do not amend a commit unless the user explicitly requests it.
- If work is done from direct user instruction and no task file exists, say that there is no task record to update, but still keep the change scoped and commit it when appropriate.

## How Agents Create Pull Requests
- Keep pull requests scoped to one task.
- Use a clear title that describes the behavior or document added.
- Include:
  - what changed
  - why it changed
  - files or modules most affected
  - tests run
  - known gaps or follow-ups
- Keep pull requests small enough that a reviewer can understand them quickly.
- If a change introduces scaffolding for future work, say so explicitly.

## How Agents Request Reviews
- Request review after the task is complete, scoped, and tested.
- Ask for review against the product spec, architecture, and architecture rules, not just code style.
- Highlight any assumptions, tradeoffs, or temporary shortcuts.
- If the change affects architecture boundaries, call that out explicitly in the review request.
- If no tests were possible, explain the reason and identify the intended follow-up.
- Include the task completion summary and commit hash in the review request or handoff.

## Definition of Done
A task is done when:
- it solves one clearly defined task
- the change stays within approved architecture boundaries
- relevant tests pass or the testing gap is clearly documented
- docs are updated if behavior, architecture, or workflow changed
- the task file is updated to `Complete` with `Completion Summary`, `Verification`, and `Handoff Notes`
- a single scoped commit has been created for the task unless the user explicitly said not to commit
- the change is small enough for straightforward review
