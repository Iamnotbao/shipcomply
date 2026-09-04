# Frontend Agent Instructions

These rules apply inside `front-end/`.

Also follow the repository root `AGENTS.md`.

## 1. Frontend architecture

- React + MUI + React Router are the existing foundations.
- Reuse existing components and services before creating replacements.
- Keep feature-specific business logic inside the feature.
- Shared UI components should not contain module-specific APIs or permission
  rules.
- Do not add another major UI framework.

## 2. Routing

Internal dashboard navigation must use React Router SPA navigation.

Do not use for normal internal navigation:

- `window.location.assign`
- `window.location.reload`
- `window.location.href`

Route transitions should not cause full-page refreshes or visible page shaking.

Language changes must still work correctly after SPA navigation.

## 3. Sidebar and app shell

Keep a left sidebar on desktop.

Recommended behavior:

- expanded width: about 220-240px
- collapsed width: about 56-64px
- collapsed mode shows centered icons
- use tooltips for collapsed menu items
- hamburger/toggle should occupy the sidebar brand/icon zone
- avoid detached/floating hamburger placement
- smooth width/opacity transitions
- mobile uses a Drawer

Do not move the entire navigation to the top header.

## 4. Header

Keep useful business context such as:

- current module/page
- factory
- department
- environment
- language
- user

Improve contrast and hierarchy.

Avoid low-contrast text over strong green backgrounds.

## 5. Scrolling

Prefer one main vertical content scrollbar.

Allowed when needed:

- sidebar internal scrollbar
- DataGrid horizontal scrollbar
- specialized panel scrolling

Avoid multiple unnecessary nested vertical scrollbars.

Use subtle thin scrollbar styling with visible hover state.

## 6. DataTable/DataGrid

Preserve existing:

- row selection
- composite row IDs
- pagination
- keyboard shortcuts
- permissions
- translations
- current callbacks
- horizontal scrolling

Do not rewrite stable table behavior only for styling.

Prefer compact enterprise density, subtle borders, readable selected state,
clean pagination, proper empty/loading states.

## 7. Toolbar/search/filter UI

Shared toolbar components may handle layout/presentation only.

Good candidates:

- PageToolbar
- FilterBar
- ToolbarActions
- AdvancedFilters

Do not force every feature into the exact same filter set.

Preserve current search payloads and keyboard behavior.

Group:

- primary filters
- search/reset/more filters
- CRUD/business actions
- import/export utilities

Use consistent control heights and spacing.

## 8. Add/Edit UI

Do NOT create one universal Add/Edit form.

Classify per feature:

- small form: compact Dialog
- medium form: Dialog with 2-3 column responsive grid
- large form: large Dialog, Drawer, or dedicated page depending on workflow
- master/detail: master section plus detail grid/workspace
- complex workflow: feature-specific page/workspace

Shared form primitives are allowed for presentation:

- FormDialogShell
- FormDrawerShell
- FormPageShell
- FormSection
- FormGrid
- FormActions
- AuditSection

Shared form primitives must not contain:

- module-specific API calls
- query_level logic
- permission logic
- dependent-dropdown business rules
- feature validation rules

ACTF_410_1 is not a universal template for other modules.

## 9. Loading UX

Use loading feedback by context.

- Initial page: skeleton or subtle LinearProgress
- Table: DataGrid loading overlay/table skeleton
- Mutation button: spinner inside active button and prevent double-submit
- Dropdown: local loading state
- Route lazy load: subtle indicator only when useful

Do not intentionally delay the UI for animation.

Do not block the whole application for a small local request.

## 10. Existing notification system

The project already has:

`src/utils/notification/Notification.jsx`

Existing API includes:

- `showToast`
- `showSuccessToast`
- `showErrorToast`
- `showWarningToast`
- `showInfoToast`

Do NOT replace this API with a new notification framework.

Enhance and reuse it.

Goals:

- one global ToastContainer where practical
- remove redundant page-level ToastContainers safely
- central durations by severity
- pause on hover
- duplicate prevention via `toastId`
- responsive professional styling
- preserve translated `SYS_MESG` / `getControlLabel` behavior
- preserve placeholder replacements

Suggested default durations:

- success: ~4500ms
- info: ~5500ms
- warning: ~7000ms
- error: ~8000ms
- DB unavailable: ~8000-10000ms

Avoid fully saturated toast backgrounds.

Database failures should generate one clear notification, not many repeated
toasts from dependent requests.

`NotificationPermission.jsx` is a Dialog, not a toast. Keep it a Dialog.

## 11. Translation architecture

Avoid repeated per-module translation effects.

Prefer shared hooks/services for real repeated behavior, for example:

- `useProgramTranslations`
- `useSystemMessages`

Cache by the real identity required by the existing API, such as:

- site
- language
- program
- table
- tableType
- relationship/detail metadata

Do not lose existing translation metadata.

Do not derive program codes from routes.

Do not make table data wait for translations if they are independent.

Fallback labels may render first and update when translations arrive.

## 12. Permissions

Avoid duplicated permission fetch logic.

A shared permission hook is acceptable when it preserves explicit inputs:

- siteKey
- factory
- department
- userCode
- programCode

Remember:

- `/actf_410_1` permission is `ACTF_410`
- `ACTF_210` must remain unchanged
- `ACTF_220` must remain unchanged

Admin access should be centralized rather than implemented independently in
many pages.

## 13. TanStack Query

If React Query is introduced, use one QueryClient at the application root.

Migrate incrementally, starting with high-value reads:

- permissions
- translations
- SYS_MESG
- site health
- common dropdown/master data
- selected dashboard lists

Use stable query keys.

Example patterns:

- `["siteHealth", siteKey]`
- `["permission", siteKey, factory, department, userCode, programCode]`
- `["translation", siteKey, language, tableName, tableType]`
- `["controls", siteKey, language, programCode]`
- `["systemMessages", siteKey, language]`
- feature-specific list keys with filters/page

Use targeted invalidation after mutations.

Do not invalidate the whole query cache unnecessarily.

## 14. Site/environment behavior

Current business intention:

- VG350 is intentionally the default environment on Login.
- Keep VG350 as the default.
- If VG350 fails, notify the user.
- Do NOT automatically switch to another DB/environment.
- The user must manually choose another environment.

When a selected site is unhealthy:

- stop dependent queries
- show one clear translated DB-unavailable notification
- allow retry
- allow manual environment selection

Do not treat one site failing as the whole application failing.

## 15. Site routing configuration

Existing frontend site/port switching may currently be centralized in a utility.

Keep infrastructure knowledge centralized.

Feature modules should not know raw environment ports.

If the current deployment still requires port routing, do not break it merely
to make the architecture look cleaner.

Prefer one shared site configuration/routing utility so future reverse-proxy
migration changes only infrastructure/configuration.

## 16. SSE frontend

Use one centralized EventSource connection per authenticated browser session/tab
where practical.

Do not create EventSource instances in every dashboard component.

Requirements:

- reconnect support
- cleanup on logout
- no duplicate listeners
- lightweight event handling
- targeted TanStack Query invalidation
- no full-page reload
- no infinite refetch loops

Do not invalidate translations for unrelated business-table events.

## 17. ACTF_410_1

Audit this module carefully for:

- duplicate translation loads
- duplicate permission loads
- duplicate API requests
- incorrect response nesting
- wrong tableName assignments
- recursive/self-calling functions
- pagination metadata mistakes

Do not guess uncertain business behavior.

Preserve:

- invoice_no
- ac_no dependent on invoice_no
- vend_no
- req_no
- ac_type
- query_level behavior

Again: permission is `ACTF_410`.

## 18. ShipComply visual palette preference

The user prefers the brighter legacy ShipComply visual language over a dark
navy/teal dashboard.

When modernizing the UI, preserve this visual direction unless the user asks for
a different theme:

- sidebar: muted amber/sand surface with dark readable text
- active sidebar item: forest green with white text
- top/header accents: forest green is acceptable when contrast remains high
- DataGrid column header: muted slate blue with white text is preferred
- selected DataGrid row: soft warm yellow with dark text
- page canvas: light neutral gray
- keep status colors semantic

Do not silently switch the main navigation back to a dark navy sidebar.

Use polished shades rather than raw CSS color names where possible, but keep the
overall UI bright and easy to scan.

## 19. Scrollbar visual preference

The sidebar scrollbar must not look like a thick browser-default gray rail.

Prefer:

- about 6-8px visual thickness
- transparent/subtle track
- rounded thumb
- medium neutral thumb with stronger hover
- Firefox scrollbar-width: thin
- WebKit scrollbar styling
- no always-visible thick gutter unless required for layout stability

Do not hide scrollbars completely.


## 20. Sticky navigation and workspace controls

For long dashboard pages:

- the sidebar brand/toggle area remains fixed at the top of the sidebar
- top-level sidebar groups with children should remain easy to reach while the
  sidebar list scrolls; sticky group headers are acceptable
- page breadcrumbs/home path should stay sticky below the main AppBar
- the active table ToolbarKit should stay sticky below the breadcrumb strip
  while its table/workspace is being scrolled
- sticky elements must not overlap each other
- popup/dialog toolbars should not become viewport-sticky unless explicitly
  designed for that popup
- keep z-index values restrained and predictable

On desktop, do not leave a separate hamburger button floating in the content
header when the sidebar is collapsed. Put the desktop sidebar toggle in the
sidebar brand/avatar zone. A mobile AppBar menu button is still acceptable
because the temporary Drawer is otherwise off-screen.


## 21. Table-local scrolling and AppBar title alignment

For screens with multiple independently scrollable tables/lists:

- mouse wheel input should scroll the table/list currently under the pointer
- DataGrid virtual scrollers should use `overscroll-behavior: contain` so wheel
  scrolling does not unexpectedly chain to the page while the pointer is inside
  that grid
- independent side lists should follow the same rule when they have their own
  vertical overflow
- preserve horizontal scrolling inside the hovered DataGrid
- do not add manual global wheel listeners unless native container scrolling is
  insufficient; prefer CSS overflow/overscroll behavior

For the main desktop AppBar:

- keep company/factory identity on the left
- keep site/factory/department/date context on the right
- center the active page/module title visually in the AppBar
- on narrow/mobile layouts the title may return to normal flow to avoid overlap
