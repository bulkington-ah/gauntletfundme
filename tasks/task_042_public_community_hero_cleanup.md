# Task 042: Public Community Hero Cleanup

## Status
Complete

## Depends On
- `tasks/task_022_public_community_page_webawesome_redesign.md`

## Description
Remove the public community page's decorative `Community spotlight` hero panel and collapse the duplicated hero description so the page renders only the persisted community copy in one clear description block.

## Expected Files Affected
- `src/presentation/communities/public-community-page.tsx`
- `src/presentation/communities/public-community-page.module.css`
- `tests/presentation/communities/public-community-page.test.tsx`
- `tasks/task_042_public_community_hero_cleanup.md`

## Acceptance Criteria
- The public community hero no longer renders the `Community spotlight` label or its hardcoded supporting copy.
- The hero no longer renders the community description twice.
- The hero keeps a single description block sourced from `model.community.description`.
- Existing hero stats, `View featured fundraiser`, `View owner profile`, and follow controls continue to behave as they do now.
- Leaderboard, tabs, activity feed, fundraiser list, and About section remain unchanged.
- No application-layer, domain-layer, persistence, API, or demo-seed changes are introduced.

## Tests Required
- `npm test -- tests/presentation/communities/public-community-page.test.tsx`
- `npm run lint`
- `npm run build`

## Notes
- Remove the unused `toLeadSentence` helper once the duplicated hero lead is gone.
- Remove the unused spotlight CSS selectors after the hero layout is simplified.
- Keep `featuredFundraiser` as a data concept for the CTA row and About tab only.

## Completion Summary
- Completed on 2026-03-18.
- Removed the right-side `Community spotlight` hero artwork from the public community page and simplified the hero to a single content column.
- Removed the duplicated hero lead so the page now renders one description paragraph sourced directly from `model.community.description`.
- Deleted the now-unused spotlight-specific CSS and the unused `toLeadSentence` helper.
- Updated community presentation coverage to assert the hero description appears once within the hero and that the removed hardcoded spotlight copy is absent.

## Verification
- `npm test -- tests/presentation/communities/public-community-page.test.tsx`
- `npm run lint`
- `npm run build`

## Handoff Notes
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning in `src/presentation/fundraisers/public-fundraiser-page.tsx`; this task did not change fundraiser rendering.
- This task is presentation-only. Featured fundraiser selection, public-content query contracts, persistence behavior, and demo seed data were intentionally left unchanged.
