# Task 031: Fundraiser Sidebar Progress Ring Layout

## Status
Complete

## Depends On
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`

## Description
Fix the fundraiser page's desktop sidebar support box so the progress ring keeps a stable layout lane and the support copy wraps cleanly without overlapping it.

## Expected Files Affected
- `src/presentation/fundraisers/public-fundraiser-page.module.css`
- `tasks/task_031_fundraiser_sidebar_progress_ring_layout.md`

## Acceptance Criteria
- The desktop sidebar stats area uses a stable two-column layout for the progress ring and support copy.
- Support text wraps within its own column instead of colliding with the ring.
- Existing fundraiser page behavior, sticky sidebar behavior, and CTA behavior remain unchanged.
- Relevant automated checks pass after the CSS change.

## Tests Required
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Completion Summary
- Changed the fundraiser sidebar stats block from a horizontal flex row to a fixed-ring/taking-remaining-space grid so the ring and support summary no longer compete for the same layout space on desktop widths.
- Added `min-width: 0` and sidebar-specific typography/line-height adjustments to the support summary so long amount text wraps cleanly inside the narrow sticky sidebar.
- Kept the change CSS-only; fundraiser markup, data, and mocked donation behavior were left untouched.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- Manual browser confirmation of the desktop sidebar layout is still recommended in the user's local dev browser because this environment could not conclusively automate a visual Playwright check against the user's already-running `next dev` session.
- `npm run lint` still reports the pre-existing `@next/next/no-img-element` warning on the fundraiser hero image.
