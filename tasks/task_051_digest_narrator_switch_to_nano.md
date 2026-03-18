# Task 051: Digest Narrator Switch To Nano

## Status
Complete

## Depends On
- `tasks/task_047_supporter_digest_ai.md`
- `tasks/task_050_digest_narrator_reasoning_and_token_budget.md`

## Description
Switch the supporter digest narrator from `gpt-5-mini` to `gpt-5-nano` to reduce narration latency while keeping the existing structured-output contract, minimal reasoning effort, and expanded output-token budget.

## Expected Files Affected
- `.env.example`
- `.env.local`
- `src/infrastructure/ai/openai-supporter-digest-narrator.ts`
- `tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts`

## Acceptance Criteria
- The default digest narrator model is `gpt-5-nano`.
- The local runtime digest model env var is also `gpt-5-nano`, so the app actually uses the smaller model without relying on fallback defaults.
- Narrator tests assert the updated model name.
- A live OpenAI verification with the full Avery digest payload completes successfully with structured output using `gpt-5-nano`.

## Tests Required
- `npm test -- tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/application/engagement/supporter-digest.test.ts`
- `npm run lint`
- Run one live OpenAI `responses.create(...)` verification against the full Avery digest payload using:
  - `model: gpt-5-nano`
  - `reasoning: { effort: "minimal" }`
  - `max_output_tokens: 2500`
  - the existing strict `supporter_digest_narration` JSON schema

## Assumptions
- This task optimizes for faster narration, accepting that `gpt-5-nano` may produce terser or less polished copy than `gpt-5-mini`.
- The broader non-blocking digest render work remains a separate task.

## Completion Summary
- Completed on 2026-03-18.
- Switched the digest narrator default model and the local digest model env setting from `gpt-5-mini` to `gpt-5-nano`.
- Updated narrator test expectations to reflect the new model name.
- Verified the full Avery digest payload completes successfully with `gpt-5-nano`, returning 7 structured items with no incomplete response and no reasoning-token usage.

## Verification
- `npm test -- tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/application/engagement/supporter-digest.test.ts`
- `npm run lint`
- Ran a live Node/OpenAI verification from the repo with `.env.local` loaded and the full Avery digest payload. The request used `model: process.env.OPENAI_DIGEST_MODEL || "gpt-5-nano"`, `reasoning: { effort: "minimal" }`, `max_output_tokens: 2500`, and the existing strict `supporter_digest_narration` JSON schema. The response completed successfully with 7 structured items.

## Handoff Notes
- The live `gpt-5-nano` response used fewer output tokens than `gpt-5-mini`, but the copy was noticeably terser. If digest quality drops too far, the next tuning lever should be prompt/examples rather than increasing reasoning effort again.
- If the dev server was already running when `.env.local` changed, restart it so the new model setting is picked up.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`, unchanged by this task.
