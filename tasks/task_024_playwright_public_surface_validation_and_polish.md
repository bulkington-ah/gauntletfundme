# Task 024: Playwright Public-Surface Validation and Polish

## Status
Pending

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
