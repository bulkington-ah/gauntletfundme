# Task 045: Fundraiser Share Modal

## Status
Complete

## Depends On
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_037_fundraiser_follow_controls.md`
- `tasks/task_044_fundraiser_supporter_rail_controls.md`

## Description
Replace the public fundraiser page's inert `Share` buttons with a presentation-layer share modal that opens in place, shows the fundraiser's canonical URL, and lets the user copy that link without leaving the page.

## Expected Files Affected
- `src/presentation/fundraisers/public-fundraiser-page.tsx`
- `src/presentation/fundraisers/public-fundraiser-page.module.css`
- `src/presentation/fundraisers/fundraiser-share-control.tsx`
- `tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `tasks/task_045_fundraiser_share_modal.md`

## Acceptance Criteria
- Clicking any public fundraiser page `Share` control opens a modal without navigating away.
- The modal displays the canonical public fundraiser URL built from the current origin and the fundraiser slug path.
- Clicking `Copy link` copies that URL when clipboard access succeeds.
- If clipboard access fails or is unavailable, the user still sees the URL and clear manual-copy guidance.
- Opening the modal resets any prior copy success or fallback state.
- Existing fundraiser donate, follow, supporter-rail, and server-rendered content behavior remain unchanged.
- No route, API, schema, domain, or persistence contract changes are introduced.

## Tests Required
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm run build`

## Notes
- Keep the fundraiser page server-rendered and isolate the share interaction inside a small client component.
- Construct the copied URL from `window.location.origin` plus the canonical fundraiser path instead of reusing incidental querystring or navigation state.
- Keep this change local to the fundraiser presentation module; do not introduce a shared cross-surface share abstraction in this task.
- Do not update `docs/plan.md` for this standalone incremental task.

## Completion Summary
- Completed on 2026-03-18.
- Added [fundraiser-share-control.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/fundraiser-share-control.tsx) as a fundraiser-local client controller that opens an in-place modal, derives the canonical fundraiser URL from the active browser origin, and handles clipboard copy success and manual-copy fallback states.
- Updated [public-fundraiser-page.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.tsx) to replace all three inert `Share` buttons with the new control while preserving the existing server-rendered page model and CTA layout.
- Updated [public-fundraiser-page.module.css](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.module.css) with fundraiser-local modal, backdrop, input, and feedback styles so the share flow matches the page's current visual language without adding a shared modal abstraction.
- Extended [public-fundraiser-page.test.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/tests/presentation/fundraisers/public-fundraiser-page.test.tsx) to verify modal opening, canonical URL rendering, successful clipboard copy, manual-copy fallback behavior, and modal close handling.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm run build`

## Handoff Notes
- Each fundraiser CTA area renders its own share-control instance, but the copied destination is the same canonical fundraiser URL in every location.
- The modal resets copy feedback each time it opens so success or fallback messaging does not leak across repeated opens.
- Clipboard-unavailable and clipboard-rejected paths intentionally share the same manual-copy guidance to keep the user outcome predictable across browsers.
