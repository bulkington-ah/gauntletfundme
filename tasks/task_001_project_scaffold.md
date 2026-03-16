# Task 001: Project Scaffold

## Status
Complete

## Depends On
- Approved docs in `docs/`

## Description
Initialize the repository as a modular monolith using Next.js and TypeScript. Create the top-level source layout, basic app shell, and baseline configuration needed for future feature work without implementing product behavior.

## Expected Files Affected
- `package.json`
- `tsconfig.json`
- `next.config.*`
- `src/presentation/**`
- `src/application/**`
- `src/domain/**`
- `src/infrastructure/**`
- `tests/**`
- base config files for linting, formatting, and environment loading

## Acceptance Criteria
- The repository contains the expected source layout under `src/presentation`, `src/application`, `src/domain`, and `src/infrastructure`.
- The app boots locally and renders a placeholder page only.
- Import aliases or path conventions support the layer structure cleanly.
- No product-specific profile, fundraiser, community, auth, or donation behavior is implemented yet.
- The scaffold follows the dependency and naming rules in `docs/architecture_rules.md`.

## Tests Required
- Basic app startup check.
- One smoke test verifying the placeholder page renders successfully.

## Notes
- Keep the initial page intentionally minimal.
- Do not introduce persistence, auth, or business logic in this task.

## Completion Summary
- Completed on 2026-03-16.
- Added a minimal Next.js 16 + TypeScript scaffold with `src/app` route entry points and layer aliases in `tsconfig.json`.
- Added an intentionally placeholder-only home page under `src/presentation/home/` with no product-specific profile, fundraiser, community, auth, or donation behavior.
- Added stable layer entry points in `src/application/index.ts`, `src/domain/index.ts`, and `src/infrastructure/index.ts` so later tasks can build within the modular monolith boundaries.
- Added baseline repo config for Next.js, ESLint, Vitest, and Git ignore handling.
- Added a presentation smoke test covering the placeholder page render.

## Verification
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- `next build` updated `tsconfig.json` to use `jsx: react-jsx` and added `.next/dev/types/**/*.ts` to the TypeScript include list; those changes were kept because they are required by the current Next.js setup.
- Dependency install is working locally with `npm`.
- `npm install` still reports 2 low-severity advisories in the dependency tree; the previously flagged critical Next.js advisory was resolved by upgrading to `next@16.1.6`.
