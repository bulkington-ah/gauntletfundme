# Task 052: Restore Mini Quality And Make Digest Render Fast

## Status
Complete

## Depends On
- `tasks/task_047_supporter_digest_ai.md`
- `tasks/task_050_digest_narrator_reasoning_and_token_budget.md`
- `tasks/task_051_digest_narrator_switch_to_nano.md`

## Description
Switch the digest narrator back to `gpt-5-mini`, but remove OpenAI narration from the initial `/digest` render path so the page opens immediately with deterministic highlights. After first paint, the client should request narration for the same digest window and upgrade the copy in place if AI narration succeeds.

## Expected Files Affected
- `.env.example`
- `src/app/api/engagement/digest-narration/route.ts`
- `src/application/api/create-application-api.ts`
- `src/application/engagement/get-supporter-digest.ts`
- `src/application/engagement/index.ts`
- `src/application/engagement/ports.ts`
- `src/application/engagement/refresh-supporter-digest-narration.ts`
- `src/application/engagement/supporter-digest-response.ts`
- `src/infrastructure/ai/openai-supporter-digest-narrator.ts`
- `src/presentation/api/engagement/post-refresh-digest-narration-route.ts`
- `src/presentation/api/index.ts`
- `src/presentation/digest/supporter-digest-page-client.tsx`
- `src/presentation/digest/supporter-digest-page.tsx`
- `tests/application/engagement/supporter-digest.test.ts`
- `tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts`
- `tests/presentation/api/auth-route-handlers.test.ts`
- `tests/presentation/api/digest-route-handlers.test.ts`
- `tests/presentation/api/prototype-route-handlers.test.ts`
- `tests/presentation/digest/supporter-digest-page.test.tsx`

## Acceptance Criteria
- The default digest narrator model is `gpt-5-mini`.
- Digest narration requests keep `reasoning: { effort: "minimal" }` and `max_output_tokens: 2500`.
- Initial `/digest` render returns deterministic highlights immediately and does not await OpenAI narration.
- The digest response includes narration state metadata for client-side upgrade behavior.
- A new authenticated digest narration refresh endpoint replays narration for an explicit `windowStart` and `windowEnd`.
- Background narration refresh does not mutate `supporter_digest_state` and does not emit duplicate digest page-view analytics.
- The initial deterministic hero no longer shows `Grounded fallback summary`.
- The sentence `AI narration is unavailable right now, so you're seeing the deterministic digest copy instead.` is removed.
- The hero shows `AI-assisted summary` only after background narration succeeds.

## Tests Required
- `npm test -- tests/application/engagement/supporter-digest.test.ts tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/presentation/digest/supporter-digest-page.test.tsx tests/presentation/api/digest-route-handlers.test.ts`
- `npm run lint`
- Run one live OpenAI verification against the Avery digest payload with:
  - `model: gpt-5-mini`
  - `reasoning: { effort: "minimal" }`
  - `max_output_tokens: 2500`
  - the existing strict `supporter_digest_narration` JSON schema

## Assumptions
- Fast deterministic first paint is preferable to blocking the digest page on narration.
- Login remains unchanged in this task; no sign-in warm-up or digest snapshot persistence is introduced.
- Deterministic digest copy is acceptable as the default visible state when background narration fails.

## Completion Summary
- Completed on 2026-03-18.
- Switched the digest narrator default model back to `gpt-5-mini` while keeping minimal reasoning effort and the expanded `2500` token budget.
- Split digest response assembly into a shared application helper so the same ranked window can produce deterministic first-paint copy or narrated upgraded copy.
- Updated `getSupporterDigest` to return deterministic highlights immediately, publish only the digest page-view event, and expose narration state metadata instead of awaiting OpenAI.
- Added `refreshSupporterDigestNarration` plus a new authenticated `POST /api/engagement/digest-narration` route so the client can request narration for the exact first-render window without mutating cursor state.
- Moved the digest page UI into a client component that acknowledges the viewed window, triggers background narration only when the initial digest is pending, and swaps in `AI-assisted summary` after a successful upgrade.
- Removed the initial fallback badge and the explicit fallback sentence so deterministic first render reads as the normal digest experience.
- Added focused application, presentation, and route-handler coverage for the new fast-first-render plus async-upgrade flow.
- Refreshed shared API test stubs so the expanded application API contract still works in the auth and prototype route handler suites.

## Verification
- `npm test -- tests/application/engagement/supporter-digest.test.ts tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/presentation/digest/supporter-digest-page.test.tsx tests/presentation/api/digest-route-handlers.test.ts`
- `npm test -- tests/presentation/api/auth-route-handlers.test.ts tests/presentation/api/prototype-route-handlers.test.ts`
- `npm run lint`
- Ran a live Node/OpenAI verification from the repo with `.env.local` loaded and the full Avery digest payload. The request used `model: gpt-5-mini`, `reasoning: { effort: "minimal" }`, `max_output_tokens: 2500`, and the existing strict `supporter_digest_narration` JSON schema. The response completed successfully with `itemCount: 7` and non-empty structured output.

## Handoff Notes
- `.env.local` was updated locally to `OPENAI_DIGEST_MODEL=gpt-5-mini`; restart the dev server if it was already running so the process picks up the restored model.
- Background narration failures now leave the deterministic digest visible without banner copy. Failure-specific narration metadata is still available in the response for debugging and future instrumentation.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`, unchanged by this task.
