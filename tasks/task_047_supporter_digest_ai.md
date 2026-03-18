# Task 047: Supporter Digest AI

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`
- `tasks/task_010_follow_and_unfollow_flows.md`
- `tasks/task_011_post_and_comment_creation.md`
- `tasks/task_015_analytics_instrumentation.md`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Description
Add an in-app supporter digest page that uses followed fundraisers and communities to surface ranked highlights since the viewer last checked in, with OpenAI-backed narration and deterministic fallback.

## Expected Files Affected
- `docs/**`
- `tasks/task_047_supporter_digest_ai.md`
- `src/application/**`
- `src/domain/**`
- `src/infrastructure/**`
- `src/presentation/**`
- `src/app/**`
- `infra/terraform/**`
- `tests/**`

## Acceptance Criteria
- Authenticated viewers can open `/digest` and see 3-7 ranked highlights sourced only from followed fundraisers and communities.
- The digest window is “since last digest open,” using persisted digest state rather than login time.
- Candidate selection and ranking are deterministic and exclude removed or flagged content.
- OpenAI is integrated from day one through an application-owned narrator interface and generates structured highlight copy.
- Invalid or failed provider responses degrade cleanly to deterministic fallback copy without failing the page.
- The digest cursor advances only after the page is shown through a dedicated acknowledgement endpoint.
- Production configuration supports `OPENAI_API_KEY` as a managed secret and digest model/timeouts as runtime env vars.

## Tests Required
- application tests for digest fetch and acknowledgement behavior
- domain tests for ranking and deduping policy
- infrastructure tests for Postgres digest queries, digest state persistence, and OpenAI adapter behavior
- presentation tests for populated, empty, and fallback digest states
- `npm test`
- `npm run lint`
- `npm run build`

## Completion Summary
- Added a new authenticated `/digest` page and `POST /api/engagement/digest-views` acknowledgement flow so signed-in supporters can review ranked changes across followed fundraisers and communities since their last digest view.
- Implemented deterministic digest candidate selection in the application and domain layers, including fundraiser momentum, fundraiser milestones, organizer-authored community updates, and community discussion bursts with deduping and score-based ranking.
- Added supporter digest persistence and read support to the Postgres engagement repository, including the new `supporter_digest_state` table plus forward-only cursor updates.
- Integrated OpenAI narration behind an application-owned `SupporterDigestNarrator` interface with structured JSON output, retry handling for transient provider failures, and deterministic fallback copy when narration is unavailable or invalid.
- Updated docs, environment examples, README guidance, and Terraform/App Runner configuration to support `OPENAI_API_KEY` as a managed secret plus digest model and timeout runtime env vars.
- Added task-aligned test coverage for digest domain ranking, application orchestration, persistence queries/state handling, OpenAI adapter behavior, digest presentation rendering, and the new digest acknowledgement API route.

## Verification
- `npm test -- tests/application/analytics/event-contracts.test.ts tests/app/create-route-pages.test.tsx tests/presentation/shared/public-site-shell.test.tsx tests/infrastructure/persistence/core-schema.test.ts tests/infrastructure/persistence/postgres-bootstrap.test.ts`
- `npm run build`
- `npm run lint`
- `npm test -- tests/domain/supporter-digest.test.ts tests/application/engagement/supporter-digest.test.ts tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/presentation/digest/supporter-digest-page.test.tsx tests/presentation/api/digest-route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Local development and production both work without `OPENAI_API_KEY`; the digest automatically falls back to deterministic copy when the OpenAI provider is unavailable.
- Production rollout expects `openai_api_key_secret_arn` to point at an App Runner-readable Secrets Manager secret, while `OPENAI_DIGEST_MODEL` and `OPENAI_DIGEST_TIMEOUT_MS` remain plain runtime env vars.
- `npm run lint` still reports one pre-existing warning in [`src/presentation/fundraisers/public-fundraiser-page.tsx`](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.tsx) for a legacy `<img>` usage outside the scope of this task.
