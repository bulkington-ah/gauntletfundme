# Task 039: Explicit Fundraiser-to-Community Linkage

## Status
Complete

## Depends On
- `tasks/task_004_repository_interfaces_and_persistence_adapters.md`
- `tasks/task_020_public_page_derived_view_models_and_demo_seed.md`
- `tasks/task_033_real_system_wide_donation_flow.md`

## Description
Replace owner-derived fundraiser/community linkage with a real fundraiser-to-community relationship. Update the domain model, persistence schema, bootstrap/backfill logic, prototype seed data, and public read repositories so fundraiser detail pages, community counts, and community leaderboards are driven by explicit linkage rather than shared ownership heuristics.

## Expected Files Affected
- `docs/architecture.md`
- `src/domain/fundraisers/**`
- `src/infrastructure/persistence/**`
- `src/infrastructure/demo-data/**`
- `src/infrastructure/public-content/**`
- `src/application/public-content/**`
- `tests/domain/**`
- `tests/infrastructure/**`
- `tests/application/public-content/**`
- `tests/presentation/api/**`

## Acceptance Criteria
- `Fundraiser` stores an explicit optional `communityId` in the domain model and persistence schema.
- The Postgres schema adds `fundraisers.community_id` with the correct foreign-key and index support.
- Persistence bootstrap upgrades existing databases and backfills prototype fundraiser rows to the intended community IDs.
- Prototype/demo seed data assigns each fundraiser to its intended community explicitly.
- Public fundraiser detail and browse responses expose only the explicitly linked community and do not derive community context from the fundraiser owner’s latest community.
- Public community detail and browse responses derive fundraiser counts from explicitly linked fundraisers only.
- Community featured fundraiser, leaderboard entries, amount raised, and donation count include only fundraisers linked to that community.
- Profile pages continue to show owned fundraisers and owned communities, but fundraiser-related activity uses each fundraiser’s true linked community when present.
- Architecture docs reflect the explicit fundraiser-to-community relationship and remove any ambiguity that owner-based linkage is acceptable.

## Tests Required
- Domain tests covering `Fundraiser` creation with nullable `communityId`.
- Schema tests covering the `community_id` column, foreign key, and index.
- Bootstrap tests covering upgrade and prototype backfill behavior.
- Static public-content repository tests covering explicit fundraiser/community linkage.
- Postgres public-content repository tests covering corrected fundraiser links, community counts, and leaderboard aggregation.
- Public-content application query regression tests for fundraiser and community responses.
- Route-handler regression tests for corrected public community aggregates and fundraiser context.

## Notes
- Preserve existing public response shapes where possible; this is a data-correctness task, not a presentation redesign.
- `communityId` should remain nullable in v1 so standalone fundraisers are still supported.
- This task intentionally replaces the Task 020 shortcut that derived richer public content without schema changes.
- Do not reintroduce owner-based fallback linkage anywhere in public read models.

## Completion Summary
- Completed on 2026-03-18.
- Added explicit nullable `communityId` support to the fundraiser domain model and persistence schema so fundraiser/community linkage is stored directly instead of inferred from shared ownership.
- Updated the Postgres bootstrapper to add the new `fundraisers.community_id` column for legacy databases, create the supporting index, and backfill existing prototype fundraiser rows to their intended communities.
- Updated prototype/demo data, Postgres seeding order, and both public-content repository adapters so fundraiser detail pages, fundraiser browse cards, community counts, community leaderboards, and community aggregate totals all resolve from explicit fundraiser linkage.
- Updated regression coverage across domain, schema, bootstrap, static repository, Postgres repository, and public API route handlers to lock in the corrected aggregate behavior.

## Verification
- `npm test -- tests/domain/core-models.test.ts tests/infrastructure/persistence/core-schema.test.ts tests/infrastructure/public-content/static-public-content-repository.test.ts tests/infrastructure/persistence/postgres-bootstrap.test.ts tests/infrastructure/persistence/postgres-public-content-engagement-repository.test.ts tests/application/public-content/public-content-queries.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm run build`

## Handoff Notes
- Existing local databases now gain the `community_id` column lazily through bootstrap, but the automated backfill only targets the known prototype fundraiser rows and only fills missing values.
- Public response shapes were intentionally left unchanged, so presentation layers keep working while now receiving corrected community linkage and aggregate numbers from the repositories.
