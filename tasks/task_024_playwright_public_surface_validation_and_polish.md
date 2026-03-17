# Task 024: Playwright Public-Surface Validation and Polish

## Status
Complete

## Depends On
- `tasks/task_021_public_fundraiser_page_webawesome_redesign.md`
- `tasks/task_022_public_community_page_webawesome_redesign.md`
- `tasks/task_023_public_profile_page_webawesome_redesign.md`

## Description
Use Playwright CLI to validate the redesigned public surface in a real browser and apply final responsive and spacing polish.

## Expected Files Affected
- `src/presentation/**`
- `output/playwright/**`
- `tasks/task_024_playwright_public_surface_validation_and_polish.md`

## Acceptance Criteria
- Desktop and mobile browser checks cover home, fundraiser, community, and profile pages.
- Screenshots or other CLI artifacts are captured under `output/playwright/`.
- Final polish addresses the highest-priority issues found during browser validation.

## Tests Required
- Playwright CLI validation run
- `npm test`
- `npm run lint`
- `npm run build`

## Completion Summary
- Validated the public home, fundraiser, community, and profile routes in a real browser at desktop and mobile widths using Playwright CLI, then copied a stable screenshot set into `output/playwright/*/*.png` for task review.
- Applied the highest-priority polish items found during the browser pass: added `src/app/icon.svg` so the public shell no longer throws a missing favicon console error, and surfaced a mobile-only fundraiser support summary directly under the hero image so donation progress and the primary CTA stay visible before the story content.
- Cleaned up internal navigation links in the shared shell and public page error states to use `next/link`, which unblocked the repo’s lint requirement during task verification.

## Verification
- `npm test -- tests/presentation/fundraisers/public-fundraiser-page.test.tsx`
- `npm test`
- `npm run lint`
- `npm run build`
- Playwright CLI validation run against `http://127.0.0.1:3010` using headed browser sessions with artifacts captured under `output/playwright/` for:
  - home desktop and mobile
  - fundraiser desktop and mobile
  - community desktop and mobile
  - profile desktop and mobile

## Handoff Notes
- `npm run lint` now passes with only one remaining framework warning from `@next/next/no-img-element` on the fundraiser hero image. I left it as-is for this task because the image is a local static prototype asset and the warning does not fail lint.
- `npm start` logs a Next.js warning about `output: standalone`; the local validation server still served the built app successfully for this task, but if the repo standardizes on standalone local serving later, `node .next/standalone/server.js` would remove that warning.
- The stable screenshots for review are the top-level PNGs inside each `output/playwright/<route>-<viewport>/` folder. The hidden `.playwright-cli/` subfolders also contain the raw snapshots and console logs from the validation sessions.
