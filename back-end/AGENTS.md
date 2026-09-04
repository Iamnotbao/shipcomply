# Backend Agent Instructions

These rules apply inside `back-end/`.

Also follow the repository root `AGENTS.md`.

## 1. Existing deployment model

The application intentionally runs multiple PM2 applications for different
site/database environments, such as conceptually:

- LOCAL
- TAIWAN
- VG350
- VG380
- AW350
- AW380

Each process runs `server.js` with environment-specific:

- PORT
- DB configuration
- JWT configuration

Current Sequelize models bind to the singleton in `config/db.js`.

`core/association.js` also uses those singleton models.

Do NOT convert the entire backend to one dynamic multi-database Sequelize
process unless explicitly requested as a separate migration.

That change would require broad model/association/repository refactoring and is
too risky for ordinary UI/performance work.

Keeping multiple PM2 processes is acceptable.

## 2. Database configuration

Never expose or repeat real credentials or JWT secrets.

Prefer environment variables for:

- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_HOST
- DB_PORT
- JWT_SECRET
- JWT_REFRESH_SECRET
- pool configuration

If creating `.env.example`, use placeholders only.

Do not break current deployment silently; document newly required variables.

## 3. Sequelize pool

Audit pool settings across all PM2 processes.

Remember total possible DB connections roughly scale with:

`process count × pool.max`

Prefer environment-configurable pool values, e.g.:

- DB_POOL_MAX
- DB_POOL_MIN
- DB_POOL_ACQUIRE
- DB_POOL_IDLE

Use conservative defaults for development/testing.

Avoid unnecessarily high `min` values that keep idle DB connections open.

Do not claim one fixed production pool size is correct without considering:

- PostgreSQL `max_connections`
- backend instance count
- active request concurrency
- query latency
- DB CPU/memory

## 4. Site health endpoint

Provide a lightweight health endpoint per backend instance when required.

Preferred behavior:

- verify API process is alive
- verify database connectivity with a lightweight query
- return a small non-sensitive response

Do not query large business tables.

Do not expose:

- DB host
- DB username
- DB password
- JWT secrets
- stack traces

Site health failure should be clearly distinguishable from normal validation or
permission errors.

## 5. Permissions

Find duplicated permission/query-level logic and centralize only real repeated
patterns.

Useful shared concepts may include:

- `getUserProgramPermission`
- `resolveQueryLevel`
- `resolveModifyLevel`
- `requireProgramPermission`
- `isAdmin`

Do not over-engineer.

Where useful, resolve permission once and attach it to the request, e.g.:

`req.programPermission`

Then reuse it downstream.

Do not repeatedly query the same permission in one request.

Preserve current status/error semantics unless a confirmed bug requires change.

## 6. Admin behavior

Admin may bypass normal program permission checks where the current system
intends that behavior.

But:

- authentication remains mandatory
- non-admin users remain restricted
- do not sprinkle `"admin"` checks through every controller/repository
- centralize admin detection where practical

Audit direct API access, not only frontend menu visibility.

## 7. SSE / realtime

The backend already has SSE infrastructure, including:

- SSE routes
- an in-memory client manager/broadcaster

Do NOT create a parallel realtime framework.

Refactor behind a small stable abstraction when needed, e.g.:

- add client
- remove client
- publish realtime event

Business modules should not directly know the internal client Map.

Keep events lightweight.

Do not broadcast full tables unless truly necessary.

A useful event shape may include:

- type
- entity
- site/environment
- factory
- action
- record identifier
- updatedAt

Do not include sensitive record data unnecessarily.

Keep heartbeat support.

Remove disconnected clients promptly.

Avoid memory leaks.

## 8. SSE scale-readiness

Current in-memory SSE is acceptable for one backend process per site.

If a site later runs multiple Node instances, in-memory broadcast alone will not
reach clients connected to other instances.

Design the publisher so transport can later be replaced by:

- Redis Pub/Sub
- NATS
- similar broker

without changing every business module.

Do NOT add Redis/NATS now unless explicitly requested or already present.

## 9. Multi-site behavior

One site/database failing must not imply every site is unavailable.

Do not implement automatic cross-site database fallback in the backend.

The frontend/user should explicitly select the intended site.

Avoid any behavior that silently sends business operations to another site.

## 10. Auth and site identity

If site identity becomes part of login/session flow, do not trust a mutable
frontend header alone for authorization.

A future-safe design may bind site/environment identity into authenticated
session/token claims and validate it server-side.

Do not perform a broad token-schema migration unless the requested task includes
it and compatibility is understood.

## 11. API performance

Avoid:

- repeated permission queries
- repeated user existence checks when already known safely
- unnecessary sequential DB operations
- fetching all rows when pagination exists
- serial calls that can safely run in parallel
- returning giant payloads through SSE

Preserve transaction correctness.

Do not optimize by removing permission/security checks.

## 12. Error handling

Differentiate where practical:

- authentication failure
- permission denied
- validation error
- business-rule failure
- database unavailable
- unexpected server error

Do not expose raw stack traces or secrets to clients.

Return responses compatible with existing frontend expectations when possible.

## 13. ACTF_410_1 / AC_REQ_M

Preserve the known convention:

- route `/actf_410_1`
- permission program code `ACTF_410`

Do not change `ACTF_210` or `ACTF_220`.

When working in AC_REQ_M, inspect:

- controller response shape
- service return shape
- repository pagination/enrichment
- admin behavior
- dropdown response nesting

Do not reintroduce inconsistent admin/non-admin return shapes.

## 14. Server and middleware

Before changing middleware order in `server.js`, verify effects on:

- CORS
- SSE
- soft auth
- normal auth
- monitor middleware
- public auth/login routes
- protected `/api` routes

Do not casually move global auth above endpoints that must remain public.

## 15. Backend validation

For backend changes, verify as applicable:

- Node syntax/startup
- Sequelize authenticate behavior
- health endpoint
- auth middleware
- admin access
- normal permission restriction
- SSE connect/disconnect cleanup
- pool environment parsing
- no secret leakage

If full runtime DB access is unavailable, report static verification separately
from runtime verification.
