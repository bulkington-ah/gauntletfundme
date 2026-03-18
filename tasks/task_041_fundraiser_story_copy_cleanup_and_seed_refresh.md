# Task 041: Fundraiser Story Copy Cleanup and Seed Refresh

## Status
Complete

## Depends On
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Description
Remove hardcoded copy from the public fundraiser Story section so the page renders only persisted fundraiser story content. Refresh the prototype fundraiser seed stories with realistic human-written text so seeded fundraiser detail and browse pages feel believable without UI-generated filler.

## Expected Files Affected
- `src/presentation/fundraisers/**`
- `src/infrastructure/demo-data/**`
- `tests/presentation/fundraisers/**`
- `tests/application/public-content/**`
- `tests/infrastructure/persistence/**`
- `tasks/task_041_fundraiser_story_copy_cleanup_and_seed_refresh.md`

## Acceptance Criteria
- The fundraiser detail page Story section renders only the persisted `fundraiser.story` value.
- The hardcoded story lead copy above the story body is removed.
- The presentation layer no longer appends community-specific or mocked-payment explanatory paragraphs to the story body.
- All seeded prototype fundraisers use realistic human-written story text aligned to each fundraiser title and linked community context.
- Existing browse-card excerpts continue to come from the stored fundraiser story text through the current excerpting pipeline.
- Prototype bootstrap and reset flows continue to seed the database successfully with the updated fundraiser stories.
- No API, schema, domain-model, or persistence-contract changes are introduced for this task.

## Tests Required
- `tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx`
- `tests/application/public-content/public-content-queries.test.ts`
- `tests/infrastructure/persistence/postgres-bootstrap.test.ts`
- targeted `npm test -- ...` for the updated coverage
- `npm run build`

## Notes
- Keep the change scoped to story rendering and prototype content only.
- Do not rewrite or migrate existing user-created fundraiser records.
- Keep seeded fundraiser stories as plain-text single paragraphs in this task.
- Do not reopen or edit the completion sections of prior completed tasks for this work.

## Completion Summary
- Completed on 2026-03-18.
- Removed the presentation-layer filler from the public fundraiser Story section so the page now renders only the persisted `fundraiser.story` value.
- Replaced all prototype fundraiser seed stories with realistic single-paragraph copy aligned to each seeded campaign.
- Added reset-path regression coverage to confirm the prototype reset repository reseeds the updated fundraiser story content, ensuring the manual reset button restores the new text.
- Updated fundraiser presentation, browse, public-content, bootstrap, and reset tests to match the new authored seed content and the cleaned-up Story section behavior.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx tests/presentation/fundraisers/public-fundraiser-browse-page.test.tsx tests/application/public-content/public-content-queries.test.ts tests/infrastructure/persistence/postgres-bootstrap.test.ts tests/infrastructure/persistence/postgres-prototype-data-reset-repository.test.ts`
- `npm run build`

## Handoff Notes
- The prototype reset flow continues to source fundraiser content from `seedPrototypeCatalog`, so future demo-story edits only need to update the shared prototype catalog to affect both bootstrap and manual reset behavior.
- Existing user-created fundraiser records are unchanged; only newly bootstrapped or reset prototype data uses the refreshed seeded story copy.
