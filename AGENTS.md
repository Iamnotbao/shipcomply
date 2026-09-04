# ShipComply Agent Instructions

These instructions apply to the whole repository unless a deeper `AGENTS.md`
overrides them.

## 1. Working style

- Inspect existing code and callers before editing.
- Prefer small, focused changes over large rewrites.
- Preserve existing business behavior unless a bug is confirmed.
- Do not invent business rules.
- If behavior is ambiguous, trace the related frontend service, backend route,
  controller, service, repository, model, permission flow, and translation usage
  before changing it.
- Keep code understandable for future maintainers.
- Avoid unnecessary abstraction, generic frameworks, and "magic" helpers.

## 2. Git safety

- Work only on the branch requested by the user.
- Never commit directly to `main`.
- Never merge into `main` unless the user explicitly asks.
- Do not force-push, hard-reset, delete branches, or perform destructive git
  operations unless explicitly requested.
- Make multiple focused commits for larger tasks.
- Push completed work to the requested branch.
- Do not squash commits automatically.
- In the final report include commit SHAs and the exact pull command.

## 3. Critical business conventions

These are intentional and must not be normalized automatically.

- Route `/actf_410_1` uses permission program code `ACTF_410`.
- Do not derive permission program codes from route names.
- `ACTF_210` is intentional.
- `ACTF_220` is intentional.
- Do not rename or bulk-normalize program codes.
- Preserve `query_level`.
- Preserve `modify_level`.
- Preserve existing permission semantics.
- Preserve current API payload contracts unless fixing a confirmed bug.
- Preserve master/detail relationships.
- Preserve generated identifiers and transaction behavior.
- Preserve multilingual behavior.

If a code looks inconsistent but the intent cannot be proven from the codebase,
leave it unchanged and report it.

## 4. Refactor philosophy

Prefer:

- feature-specific business logic
- small shared UI/layout primitives
- small shared hooks for real repeated patterns
- explicit services
- targeted utilities

Avoid:

- one giant reusable form engine
- one giant dashboard component
- giant generic "handleEverything" helpers
- duplicating permission logic
- duplicating translation logic
- duplicating SSE/EventSource connections
- feature modules knowing infrastructure details they do not need

Shared components should normally handle presentation or stable cross-cutting
behavior, not module-specific business rules.

## 5. UI direction

ShipComply is an enterprise customs/logistics application.

Prefer:

- compact enterprise layouts
- neutral backgrounds
- one primary brand color
- semantic colors only for status/actions
- subtle borders and shadows
- consistent spacing
- readable typography
- responsive layouts
- restrained loading animation

Avoid:

- excessive saturated colors
- giant empty white areas
- flashy gradients
- excessive rounded cards
- excessive borders
- unnecessary animation
- emoji/unicode icons in product UI

Use the existing MUI stack.

## 6. Performance principles

- Avoid request waterfalls.
- Avoid duplicated fetches caused by effects/re-renders.
- Run independent requests in parallel.
- Do not make business data wait for translations unless required.
- Cache stable data where appropriate.
- Invalidate only affected data after mutations.
- Do not reload the whole page to refresh data.

## 7. Security and secrets

- Never print, copy, document, or commit real DB credentials, JWT secrets,
  tokens, or passwords.
- Configuration files may contain legacy secrets; do not repeat them.
- Prefer environment variables and placeholder-only `.env.example` files.
- Authentication must remain mandatory even if admin has permission bypass.
- Never trust frontend-only authorization for backend access control.

## 8. Validation before finishing

For relevant changes:

- run the frontend build
- run lint when practical
- run backend syntax/start/test validation available in the repo
- check for duplicated API calls
- check for accidental page reload navigation
- verify permission/program-code conventions
- verify language switching
- verify admin and normal-user behavior
- verify no secrets were introduced

If runtime validation is not possible, say exactly what was and was not verified.

## 9. Final report format

For non-trivial tasks, report:

1. audit findings
2. changed files
3. architecture changes
4. behavior changes
5. build/test results
6. known remaining issues
7. commit SHAs
8. exact pull command
