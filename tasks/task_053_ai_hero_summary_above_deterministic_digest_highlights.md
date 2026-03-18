# Task 053: AI Hero Summary Above Deterministic Digest Highlights

## Status
Complete

## Depends On
- `tasks/task_047_supporter_digest_ai.md`
- `tasks/task_052_restore_mini_quality_and_make_digest_render_fast.md`

## Description
Change the digest AI upgrade from per-highlight rewrites to a single short, grounded paragraph shown in the hero above the deterministic highlight cards. Keep the Task 052 behavior where `/digest` renders deterministic content immediately and the client requests AI narration in the background for the same digest window.

## Expected Files Affected
- `src/application/engagement/ports.ts`
- `src/application/engagement/supporter-digest-response.ts`
- `src/infrastructure/ai/openai-supporter-digest-narrator.ts`
- `src/presentation/digest/supporter-digest-page-client.tsx`
- `src/presentation/digest/supporter-digest-page.module.css`
- `tests/application/engagement/supporter-digest.test.ts`
- `tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts`
- `tests/presentation/digest/supporter-digest-page.test.tsx`
- `tests/presentation/api/digest-route-handlers.test.ts`

## Acceptance Criteria
- `SupporterDigestNarrationResult` success responses return a single summary string instead of per-highlight items.
- `SupporterDigestResponse` exposes a nullable `summaryParagraph` field for the digest hero.
- Initial deterministic digest responses return `summaryParagraph: null`.
- Successful background narration populates `summaryParagraph` and keeps deterministic highlight cards unchanged.
- Failed or invalid narration leaves `summaryParagraph: null` and preserves deterministic highlights.
- The digest hero renders the AI paragraph below the static lead and window metadata, directly above the deterministic highlights.
- `AI-assisted summary` only appears when the AI paragraph is present.

## Tests Required
- `npm test -- tests/application/engagement/supporter-digest.test.ts tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/presentation/digest/supporter-digest-page.test.tsx tests/presentation/api/digest-route-handlers.test.ts`
- `npm run lint`
- Run one live OpenAI verification against the Avery digest payload with:
  - `model: gpt-5-mini`
  - `reasoning: { effort: "minimal" }`
  - `max_output_tokens: 2500`
  - the new strict summary-only JSON schema

## Assumptions
- The AI output is one short paragraph, not a list or per-highlight rewrite.
- The existing static explainer lead stays in place.
- Deterministic highlights remain the source of truth for card headline/body/CTA content.
- No sign-in precompute, caching, persistence, or analytics contract changes are included in this task.

## Completion Summary
- Completed on 2026-03-18.
- Replaced the digest narration success contract with a single AI-written summary paragraph.
- Added `summaryParagraph` to the digest response model and kept it `null` for the initial deterministic render and for failed narration refreshes.
- Updated the response builder so successful AI upgrades only fill the hero summary while preserving deterministic highlight cards, order, and CTAs.
- Reworked the OpenAI narrator prompt and schema to request one grounded hero paragraph instead of card-by-card rewrites.
- Rendered the new AI paragraph in the digest hero below the existing lead and window metadata, directly above the highlight section.
- Updated digest application, infrastructure, route-handler, and page tests to assert that AI changes the hero summary only.

## Verification
- `npm test -- tests/application/engagement/supporter-digest.test.ts tests/infrastructure/ai/openai-supporter-digest-narrator.test.ts tests/presentation/digest/supporter-digest-page.test.tsx tests/presentation/api/digest-route-handlers.test.ts`
- `npm run lint`
- Ran a live Node/OpenAI verification from the repo with `.env.local` loaded and the full Avery digest payload. The request used `model: gpt-5-mini`, `reasoning: { effort: "minimal" }`, `max_output_tokens: 2500`, and the new strict summary-only JSON schema. The response completed successfully with non-empty structured output and `summaryLength: 488`.

## Handoff Notes
- The digest route/API shape now includes `summaryParagraph`, so future fixtures that construct digest responses should include it explicitly.
- The narrator still uses the same `supporter_digest_narration` schema name even though the payload now contains only `summary`; that keeps the integration narrow and backward-friendly inside the current codebase.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`, unchanged by this task.
