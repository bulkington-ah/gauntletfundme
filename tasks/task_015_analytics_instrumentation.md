# Task 015: Analytics Instrumentation

## Status
Complete

## Depends On
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_011_post_and_comment_creation.md`
- `tasks/task_012_mocked_donation_intent_flow.md`
- `tasks/task_014_moderator_action_flow.md`

## Description
Add analytics event instrumentation for core engagement flows and public page views using application-layer event publishing contracts and provider adapters.

## Expected Files Affected
- `src/application/analytics/**`
- `src/application/api/**`
- `src/application/public-content/**`
- `src/application/engagement/**`
- `src/application/discussion/**`
- `src/infrastructure/analytics/**`
- `src/infrastructure/index.ts`
- `tests/application/analytics/**`
- `tests/application/**`
- `README.md`

## Acceptance Criteria
- Key actions emit consistent analytics events with typed payload contracts.
- Event publishing is triggered from application-layer use cases (not domain entities).
- Follow, comment creation, donation intent starts, and public page views emit analytics.
- Analytics wiring does not block business logic when no real provider is configured.

## Tests Required
- Analytics event contract tests for names/payload structure.
- Use-case integration tests validating publisher invocations for key actions.
- Full regression checks to ensure instrumentation does not change existing behavior.

## Notes
- Added a no-op analytics adapter for default runtime behavior (`createNoopAnalyticsEventPublisher`).
- Analytics publishing is optional in use-case dependencies but centrally provided by `createApplicationApi`.

## Completion Summary
- Completed on 2026-03-16.
- Added a new application analytics module with:
  - typed analytics event names
  - event payload contracts
  - event builder functions for page views and key engagement actions
  - publisher interface contract
- Added infrastructure analytics adapter:
  - `createNoopAnalyticsEventPublisher`
- Wired analytics publisher into `createApplicationApi` and passed it into key use cases.
- Instrumented analytics emission in:
  - public profile/fundraiser/community query use cases (page views)
  - follow completion use case
  - discussion post/comment creation use cases
  - donation intent start use case
- Added analytics contract tests and expanded use-case tests to assert published events.
- Updated README to reflect analytics instrumentation coverage.

## Verification
- `npm test -- tests/application/analytics/event-contracts.test.ts tests/application/public-content/public-content-queries.test.ts tests/application/engagement/follow-target.test.ts tests/application/discussion/create-post.test.ts tests/application/discussion/create-comment.test.ts tests/application/engagement/start-donation-intent.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The current analytics provider is intentionally no-op; replacing with a real adapter only requires implementing `AnalyticsEventPublisher`.
- Event payloads are designed as flat primitives for easy provider compatibility and later warehouse ingestion.
