# Task 050: Digest Narrator Reasoning And Token Budget

## Status
Complete

## Depends On
- `tasks/task_047_supporter_digest_ai.md`
- `tasks/task_049_owned_resources_in_supporter_digest.md`

## Description
Tune the OpenAI-backed supporter digest narrator so the seeded digest payload can complete reliably with `gpt-5-mini`. The existing narrator request was exhausting its output budget on reasoning tokens, returning `status: "incomplete"` with no `output_text`, which surfaced in the product as a slow load followed by the generic deterministic fallback banner.

## Expected Files Affected
- `src/infrastructure/ai/openai-supporter-digest-narrator.ts`
- `tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts`

## Acceptance Criteria
- Digest narration requests set `reasoning.effort` to `minimal`.
- Digest narration requests use a larger `max_output_tokens` budget than the previous `700` token cap.
- The narrator test suite asserts the updated OpenAI request shape.
- A live OpenAI check with the real Avery digest payload completes with structured output instead of the prior empty-output failure mode.

## Tests Required
- Update narrator unit coverage for the new request shape.
- Run targeted verification:
  - `npm test -- tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/application/engagement/supporter-digest.test.ts`
  - `npm run lint`
- Run one live OpenAI `responses.create(...)` verification against the Avery digest payload with:
  - `reasoning: { effort: "minimal" }`
  - `max_output_tokens: 1200`
  - the existing strict JSON schema

## Assumptions
- This is a targeted mitigation for the current OpenAI failure mode, not the broader digest performance follow-up.
- The broader non-blocking/background narration work remains a separate task.

## Completion Summary
- Completed on 2026-03-18.
- Updated the OpenAI digest narrator to request minimal reasoning effort and increased the response token budget from `700` to `1200`.
- Confirmed the failure root cause before the change: the full Avery digest payload returned `status: "incomplete"` with `incomplete_details.reason: "max_output_tokens"` and empty `output_text` because all output tokens were consumed by reasoning.
- Verified the tuned request shape succeeds for the same payload, returning `status: "completed"`, `itemCount: 7`, non-empty structured output, and `reasoning_tokens: 0`.
- The implementation landed in commit `ad094cb` (`Tune digest narrator token budget`).

## Verification
- `npm test -- tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/application/engagement/supporter-digest.test.ts`
- `npm run lint`
- Ran a live Node/OpenAI verification from the repo with `.env.local` loaded and the full Avery digest payload. The tuned request used `model: process.env.OPENAI_DIGEST_MODEL || "gpt-5-mini"`, `reasoning: { effort: "minimal" }`, `max_output_tokens: 1200`, and the existing strict `supporter_digest_narration` JSON schema. The response completed successfully with 7 structured items.

## Handoff Notes
- This task fixes the immediate empty-output failure mode for AI narration, but it does not remove OpenAI from the initial `/digest` render path.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`, unchanged by this task.
