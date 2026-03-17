# Task 006: Ownership and Authorization Policies

## Status
Complete

## Depends On
- `tasks/task_005_account_and_session_foundation.md`

## Description
Add reusable authorization checks for protected actions so ownership and role-based access logic is centralized and reusable across application use cases.

## Expected Files Affected
- `src/application/**`
- `src/domain/**`
- `tests/application/**`
- `tests/domain/**`
- `tests/presentation/**`

## Acceptance Criteria
- Protected actions consistently reject anonymous or unauthorized users.
- Owner and moderator permissions are handled predictably and centrally.
- Authorization rules are reusable and not duplicated in route handlers.

## Tests Required
- Policy tests for owner, member, moderator, and anonymous cases.
- Endpoint/action tests confirming unauthorized and forbidden access are blocked.

## Notes
- This task focuses on policy and guardrails, not full implementation of all protected product workflows.
- The policy matrix is intentionally explicit so future write use cases can call the same guard without redefining permission logic.

## Completion Summary
- Completed on 2026-03-16.
- Added a domain authorization policy module with explicit protected actions:
  - `edit_profile`
  - `manage_community`
  - `create_post`
  - `create_comment`
  - `follow_target`
  - `create_donation_intent`
  - `moderate_content`
- Added centralized decision logic for anonymous, owner, member, moderator, and admin scenarios in `src/domain/authorization/authorization-policy.ts`.
- Added an application-layer authorization helper (`authorizeProtectedAction`) so use cases can map domain policy decisions to application statuses (`authorized`, `unauthorized`, `forbidden`) consistently.
- Updated the follow use case to consume the centralized authorization helper for:
  - initial auth gating
  - self-follow prohibition via owner-aware policy checks
- Added policy tests in domain and application layers plus route-level coverage for forbidden self-follow behavior.

## Verification
- `npm test -- tests/domain/authorization-policy.test.ts tests/application/authorization/authorize-protected-action.test.ts tests/application/engagement/follow-target.test.ts tests/presentation/api/route-handlers.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`

## Handoff Notes
- The new policy matrix is reusable by future profile edit, community management, posting, commenting, donation intent, and moderation use cases as they are implemented in later milestones.
- Follow authorization is now policy-driven, so future role or ownership rule adjustments should be made in the domain policy module rather than route/use-case conditionals.
