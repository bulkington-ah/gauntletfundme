# Task 032: Fundraiser Support Progress Bar

## Status
Complete

## Depends On
- `tasks/task_031_fundraiser_sidebar_progress_ring_layout.md`

## Description
Replace the fundraiser page's circular progress ring with a linear progress bar so the support summary text owns the full width and the progress indicator sits underneath it.

## Expected Files Affected
- `src/presentation/fundraisers/public-fundraiser-page.tsx`
- `src/presentation/fundraisers/public-fundraiser-page.module.css`
- `src/presentation/shared/webawesome-registry.tsx`
- `tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `tasks/task_032_fundraiser_support_progress_bar.md`

## Acceptance Criteria
- The desktop sidebar and mobile support card both use a linear progress bar instead of a circular ring.
- The support amount and support meta text render above the progress bar without overlapping any progress UI.
- A visible percent helper remains present near the progress bar.
- Existing fundraiser behavior, sticky sidebar behavior, and CTA behavior remain unchanged.
- Relevant automated checks pass after the presentation update.

## Tests Required
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Completion Summary
- Replaced the duplicated `wa-progress-ring` fundraiser support UI in [src/presentation/fundraisers/public-fundraiser-page.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.tsx) with a shared stacked support-details block that keeps the fundraiser amount and meta copy above a `wa-progress-bar`.
- Updated [src/presentation/fundraisers/public-fundraiser-page.module.css](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/fundraisers/public-fundraiser-page.module.css) to remove ring-specific layout lanes and styles, add full-width progress-bar styling, and keep the mobile and desktop support sections consistently single-column.
- Added the missing `wa-progress-bar` runtime registration in [src/presentation/shared/webawesome-registry.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/src/presentation/shared/webawesome-registry.tsx) so the new progress component upgrades correctly in the browser.
- Extended [tests/presentation/fundraisers/public-fundraiser-page.test.tsx](/Users/jasonallen/Documents/Gauntlet/hiring_projects/gofundme_v2/tests/presentation/fundraisers/public-fundraiser-page.test.tsx) so the fundraiser page test also verifies the visible percent helper alongside the existing CTA and connected-link checks.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The fundraiser page still uses the existing prototype support math and accessibility label, so this task changes layout and presentation only.
- The initial progress-bar swap did not render in-browser until `wa-progress-bar` was added to the shared Web Awesome registry; this task record now reflects that runtime requirement.
- `npm run lint` is expected to continue reporting the pre-existing `@next/next/no-img-element` warning on the fundraiser hero image unless that warning is addressed separately.
