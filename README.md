# Horizon SDK Demo

A federated demo application showing how to extend **NetSapiens Horizon** with the
[`@netsapiens/horizon-sdk`](https://www.npmjs.com/package/@netsapiens/horizon-sdk).
It is loaded into the running Horizon host over Webpack Module Federation and
exercises every capability the SDK exposes — full pages, zone-based UI
extensions, a dynamic table column, live call events, and authenticated API
access — using the host's themed component kit so everything matches Horizon in
light and dark mode.

> The in-app **Apps → Horizon SDK Demo** page is the live, self-documenting tour
> of everything below (Overview / Extension Zones / Route Patterns / Code /
> Walkthrough). This README is the engineering companion to it.

> **Upgrading an app built against SDK 0.1.x?** Read
> **[MIGRATION-0.1.x-TO-0.2.x.md](./MIGRATION-0.1.x-TO-0.2.x.md)** first. It covers
> the whole of 0.2.x — bundle verification and SRI, the reversed remote-entry URL
> policy, the new `horizonContext.ui` surfaces, and `requiredScopes` — and leads
> with the host-side changes that already affect a bundle you published months ago
> and have not rebuilt. It replaces `MIGRATION_BUNDLE_VERIFICATION.md`, which
> covered only the 0.2.1 half.

## What it demonstrates

This single app registers **4 full-page routes**, **10 zone extensions**, **1
dynamic table column**, **1 live call-event subscription**, an **on-demand
side panel**, and a **remote-auth handshake** with a backend.

> **Building a data table?** Start with the **Call Recordings** page
> (`pages/CallRecordingsPage.tsx`) — a complete list page built the way a native
> Horizon page is built, and the thing to copy. Then read
> **[DATAGRID.md](./DATAGRID.md)** for the page-layout anatomy and the `height`
> rule that otherwise leaves your pagination footer below the fold. The same guide
> ships inside the installed package at
> `node_modules/@netsapiens/horizon-sdk/DATAGRID.md`. There is also a minimal
> `DatagridTemplate` section on the Component Showcase page
> (`src/pages/showcase/sections/DataGridSection.tsx`).

### Full-page routes — `sdk.registerRoute()`

| Page               | Menu location                  | Notes                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Horizon SDK Demo   | Apps                           | The overview/walkthrough page (`pages/DemoPage.tsx`).                                                                                                                                                                                                                                                                     |
| Component Showcase | Apps                           | Reference for every shared MUI Aurora component (`pages/ComponentShowcasePage.tsx`).                                                                                                                                                                                                                                      |
| CRM Integration    | Manage (after _Call Logs_)     | Lists the user's calls from a **live** NetSapiens v2 API call, matched to their CRM record — registered into the Manage menu to show the Manage tree can be extended, not just Apps (`pages/CrmIntegrationPage.tsx`).                                                                                                     |
| Call Recordings    | My Account (after _Call Logs_) | **The reference list page.** Everything — search, filter, columns, export, refresh, checkbox selection, master-detail and the pagination footer — comes from `DatagridTemplate`; the primary action sits in `PageTemplate`'s header `actions`. Shows the /home tree can be extended too (`pages/CallRecordingsPage.tsx`). |

#### Choosing a menu — `parentPath`

`parentPath` is a **URL prefix**, not a menu name. Four prefixes are routable —
each has a splat route in the host that renders federated pages, and each maps
to one menu tree:

| `parentPath` | Menu it appears in | Host sitemap section id |
| ------------ | ------------------ | ----------------------- |
| `/apps`      | Apps               | `apps`                  |
| `/manage`    | Manage             | `manage`                |
| `/platform`  | Platform           | `platform`              |
| `/home`      | **My Account**     | `myaccount`             |

`/home` is the one to watch. The menu is labelled _My Account_, its internal
section id is `myaccount`, and its URL prefix is `/home` — three different
strings for the same tree. Use `/home`; `/myaccount` is not a route and will
render a menu entry pointing at a URL that 404s.

Registering Call Recordings under `/home` is what puts it in My Account:

```ts
sdk.registerRoute({
  id: 'ucaas-call-recordings',
  parentPath: '/home', // → My Account, at /home/call-recordings
  path: 'call-recordings',
  label: 'Call Recordings',
  placement: { after: 'call-logs' },
  component: CallRecordingsPage,
});
```

**Only direct children of a routable prefix work.** The host resolves a URL one
segment at a time and every segment must itself be a registered dynamic route,
so nesting under a host page does not work even when that page exists:

```ts
parentPath: '/home'; // ✅ → /home/call-recordings
parentPath: '/home/settings'; // ❌ 'settings' is a static host page, not a
//    dynamic route — the URL cannot resolve
```

A nested `parentPath` fails in a confusing way: the menu entry renders (the host
matches it to the static parent) but the URL 404s. If you want a page to sit
visually beneath an existing item, register it at the prefix and position it
with `placement` instead.

`placement` anchors match on a **normalized** menu label, not a path. In the
example above `after: 'call-logs'` resolves the My Account item whose name is
`CALL_LOGS` — both normalize to `calllogs` — even though that item's own path is
`/home/inbox/call`. Unmatched anchors fall back to the end of the menu.

> **Host version:** menu entries for `/home` require the host-side fix that
> maps the `myaccount` section to the `/home` prefix. On earlier hosts the route
> still resolves — `/home/call-recordings` loads if entered directly — but no
> menu entry appears, and nothing is logged to say why. `/apps`, `/manage` and
> `/platform` are unaffected.

### Zone extensions — `sdk.registerDynamicExtension()`

Each registration targets a **zone** plus one or more **route patterns**. The
host mounts these zones on its own pages; no pre-defined extension points are
required.

| Zone                    | Where it appears           | Demo component                                          |
| ----------------------- | -------------------------- | ------------------------------------------------------- |
| `page-header-actions`   | Page header buttons        | Export Data (`ExportButton`)                            |
| `page-header-secondary` | Beside the page title      | “● Live” badge (`HeaderStatusBadge`)                    |
| `page-content-after`    | Below the page body        | Call analytics (`AnalyticsWidget`)                      |
| `table-toolbar`         | Above a data table         | Triage tips (`TableToolbarInfo`)                        |
| `table-filter-bar`      | Beside host status filters | “● Recording” filter (`ActiveCallsRecordingFilter`)     |
| `table-row-actions`     | Per-row in a table         | Quick action (`QuickActionButton`)                      |
| `form-section-before`   | Above a form's fields      | CRM banner (`ContactFormBanner`)                        |
| `form-section-after`    | Below a form's fields      | Consent checkboxes (`ComplianceCheckbox`)               |
| `inbound-call-content`  | Inbound-call widget        | Enriched caller card (`CallerInfoWidget`)               |
| `topbar-actions`        | Global top app bar         | Help button → opens the side panel (`TopbarHelpButton`) |

### On-demand side panel — `sdk.openSidePanel()` / `useSidePanel()`

Opens Horizon's shared `SidePanel` drawer (one instance mounted by the host) with
app-provided React content, from anywhere — an extension, a page, or a call
handler. The content component receives `{ context, close }`.

```tsx
const { open } = useSidePanel(context.eventBus); // pass eventBus in extensions
open({ title: 'Call details', width: 'sm', component: CallDetailsPanel });
```

The demo opens it from a **Call Logs row action** (`CallDetailsPanel`) and from
the **global topbar Help button** (`QuickLinksPanel`).

### Dynamic column — `sdk.registerDynamicColumn()`

A sortable/filterable **Priority** column merged into the host's Call Logs table
(`columns/CallPriorityColumn.tsx`), zone `call-logs-columns`.

`renderCell` receives `(params, context)` — the second argument is the same
`ExtensionContext` a zone extension gets (`ui`, `theme`, `t`, app-scoped
`eventBus`). This cell renders through `context.ui.Chip`, so it re-colours with
the host's light/dark toggle; its fallback branch shows the alternative for
app-owned colours (branch on `context.theme`, never on the `ui.theme` snapshot).
One-argument renderers stay valid — the context is purely additive.

### Call events — `sdk.subscribeToCallEvents()`

Subscribes to the live SIP call stream (`call-started` / `-answered` / `-missed`
/ `-ended`) through the capability-gated, app-scoped SDK path (declaring the
`call-events:subscribe` capability), enriches each inbound call with CRM data,
and hands it to the `CallerInfoWidget`.

Call events are the `call-events` specialization of the host **data-stream**
contract: every host stream is consumed through the SDK, never the raw bus.
`subscribeToCallEvents` delegates to `sdk.subscribeToStream('call-events', …)`;
other host streams (`subscriber`, `device`, `registration`) use
`subscribeToStream(streamId, eventTypes, cb)` directly. Each is gated by its
`<streamId>:listen` capability and attributed to the app on the Registered Apps
page — host streams are not delivered on the raw `eventBus`.

The enriched call is passed to `CallerInfoWidget` over a **custom event**
(`demo:call-updated`). The host scopes each app's event bus, so that event stays
within this app (reaching its own pages/extensions) and never leaks to another —
the supported pattern for an app talking to its own components.

### Remote auth — `auth.requestRemoteAuth()`

When the app needs to call **your own backend** on behalf of the signed-in user,
the host relays a trusted identity handshake so the app never handles Horizon
credentials. The **Remote Auth** tab on the demo page
(`pages/demo/RemoteAuthPanel.tsx`) exercises the full `horizonContext.auth`
contract live — request a token, reuse the session-cached token, and clear it:

```tsx
const { auth } = horizonContext;

// Authenticate on load — no button. `status`: idle | pending | ready | error.
const { token, status, error, retry } = useRemoteAuth(
  horizonContext,
  'horizon-demo-backend',
  { scopes: ['contacts:read'] },
);

// Or on demand, for a "Connect X" button. No callbackUrl: the destination is
// registration data, set by an administrator.
const onDemand = await auth.requestRemoteAuth(
  { vendorId: 'horizon-demo-backend', scopes: ['contacts:read'] },
  { timeout: 60000 },
);
// token: { vendorId, accessToken, tokenType?, expiresAt?, refreshToken?, metadata? }

auth.getRemoteAuthToken('horizon-demo-backend'); // cached for the session, or null
auth.clearRemoteAuthToken('horizon-demo-backend'); // sign out of the vendor
```

The NetSapiens platform binds the identity to the caller's **trusted session**
(never the request's `user.uid`, which is attacker-controllable), checks the
signed-in user is entitled to the app, then POSTs a **single-use auth code** (not a
token) to the callback endpoint(s) **registered for the app** — never a URL from
the request. Your backend:

1. Verifies the `X-NS-Signature` HMAC — `sha256=<hex>` over
   `"<X-NS-Timestamp>." + the raw request body`, using the shared callback secret.
   Hash the bytes **before parsing**; `JSON.stringify(req.body)` will not match.
   (Two RS256 JWTs give secret-less proof against published JWKS:
   `X-NS-Platform-Assertion`, always present, says which cluster is calling;
   `X-NS-Cluster-Verification`, which may be absent, adds NetSapiens' own
   attestation.)
2. Exchanges the code (PKCE) at the `validation_endpoint` from the payload for a
   token that proves the user's identity — and uses the identity from **that
   response**, not the webhook body.
3. Mints its **own** vendor token and returns it — which resolves the promise as
   the `RemoteAuthResponse`.

The panel shows both the client call and the backend verification + exchange
snippet. A runnable reference backend lives in [`examples/vendor-backend/`](examples/vendor-backend/).

> This is the **client half** of the flow; the platform handles the signing,
> callback delivery, code exchange, and response shaping server-side. Two things
> to know: the response is mapped through an explicit allow-list (`access_token`,
> `token_type`, `expires_in`, `refresh_token` — no generic `metadata`
> pass-through today), and the platform sends the `X-NS-Signature` HMAC (the
> required gate) plus a best-effort `X-NS-Cluster-Verification` JWT the backend
> verifies when present. It
> also needs per-app admin config (remote auth enabled, allowed callback
> hostnames, signing secret). Against a host without it the request rejects/times
> out and the panel
> renders the error.

#### Admin config on the app registration

Three fields, and all three must be right or the request fails **before** your
backend is contacted — so an untouched backend log is the expected symptom, not
evidence your server is broken.

| Field                      | Value                                               |
| -------------------------- | --------------------------------------------------- |
| Remote auth enabled        | `yes`                                               |
| Allowed callback hostnames | the callback **origin** — `https://api.example.com` |
| Callback secret            | the same value your backend verifies the HMAC with  |

**Allowed hostnames is a comma-separated list, not JSON.** Write
`https://api.example.com`, or `https://a.example.com,https://b.example.com` for
several. A JSON array (`["https://api.example.com"]`) is read as a single
hostname _including the brackets and quotes_, matches nothing, and the request is
rejected with **403 "Callback URL not allowed"** — which reads like the origin
was wrong when the format was.

Match the **origin only**: scheme + host (+ port if non-standard). A full path
such as `https://api.example.com/horizon/callback` will not match.

If a request fails with a **500** and your backend was never called, check
whether your portal session has expired — reload the host and retry before
looking at the registration.

## Route patterns

Patterns decide which host routes an extension applies to:

| Pattern                    | Type             | Example match              |
| -------------------------- | ---------------- | -------------------------- |
| `/manage/call-logs`        | Exact            | `/manage/call-logs`        |
| `/manage/*/call-logs`      | Wildcard segment | `/manage/acme/call-logs`   |
| `/manage/:domain/contacts` | Named param      | `/manage/acme/contacts`    |
| `/manage/*`                | Prefix           | any page under `/manage`   |
| `/*`                       | Global           | every page (use sparingly) |

## Getting started

### Prerequisites

- Node.js 18+ (this repo pins **22.8.0** via `.nvmrc`)
- A running Horizon host (default dev port **5003**)
- The [`@netsapiens/horizon-sdk`](https://www.npmjs.com/package/@netsapiens/horizon-sdk)
  package is published **publicly** to npm — `npm install` needs no auth.

### Install & develop

```bash
npm install
npm run dev      # or: npm start
```

The app serves at **http://localhost:5005/** and exposes its federated entry at
`http://localhost:5005/remoteEntry.js`, which the Horizon host loads.

### Build

```bash
npm run build    # emits dist/remoteEntry.js + chunks
```

The production build is published to GitHub Pages and served as a CDN for the
remote — see **Hosting on GitHub Pages** below.

## Module Federation

`webpack.config.js` exposes:

```js
exposes: {
  './App': './src/App',
  './pages/DemoPage': './src/pages/DemoPage',
}
```

`react`, `react-dom` and `loglevel` are shared as singletons so the host and
remote use one instance each. React and React DOM in particular **must** stay
singletons: your component renders inside the host's React tree, and a second
copy fails as an invalid-hook-call that names nothing useful.

> Do **not** add `@netsapiens/horizon-sdk` to `shared`. The host registers
> `react`, `react-dom`, `loglevel`, `i18next` and `react-i18next` and nothing
> else, so declaring the SDK shared cannot resolve to a host copy — and since
> SDK 0.2.x, bundle verification **rejects** a bundle that declares it. Let it
> bundle normally.

> Do **not** add `@mui/material` or i18next to `shared` either. They are not
> registered by the host, and declaring them as singletons fails at load with
> "Unsatisfied version". Use MUI via `horizonContext.ui` / `context.ui` so
> extensions inherit the host theme, and translations via `useLocale()`.

### Bundle verification (SDK 0.2.x)

Horizon verifies an extension bundle before it will load it: it fetches
`remoteEntry.js`, every chunk and every source map, hashes them, runs a content
analyser and records a verdict. A version that passes is promoted, and the host
pins a SHA-384 of the exact bytes it verified. `webpack.config.js` carries the
four settings that satisfy this:

| Setting                                                            | Why                                                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `SubresourceIntegrityPlugin({ hashFuncNames: ['sha384'] })`        | Emits chunk integrity values — the platform pins the entry, and without these nothing the entry loads is covered |
| `output.crossOriginLoading: 'anonymous'`                           | Required for the browser to verify those values at all; SRI cannot check an opaque cross-origin response         |
| `devtool: 'source-map'` (with `sourcesContent`, never `noSources`) | **A bundle with no source maps is rejected outright**, not warned about                                          |
| `@netsapiens/horizon-sdk` absent from `shared`                     | See above                                                                                                        |

Check a build before publishing — these are the same checks the platform runs:

```bash
npm run build
npm run verify     # horizon-verify-bundle ./dist
```

⚠️ **The remote entry URL is stable, so the version field is load-bearing.** This
app republishes over the same
`https://netsapiens.github.io/horizon-sdk-demo/remoteEntry.js` on every deploy.
Publish new bytes without changing the version and _nothing re-verifies_ — the
platform goes on enforcing the previous bytes' hash against the new ones at the
same URL, every host fails its integrity check, and the extension simply stops
appearing with no verdict and no finding to explain it. Because that failure is
silent, the deploy workflow guards it: it fails the build if `src`,
`webpack.config.js`, `package.json` or `package-lock.json` changed without a
version bump, and again if `package.json` and
`src/integration/zones.manifest.json` disagree on the version.

So: **bump `version` in both `package.json` and `zones.manifest.json` with every
change to the bundle**, and release in a maintenance window — between the deploy
and re-verification the CDN serves new bytes while the platform still pins the
old hash.

## HorizonContext

The exposed `./App` component receives a `HorizonContext` and initializes the SDK
via `useRemoteApp()`. Page components read the live context with
`useHorizonContext()` (wrapped in `HorizonContextProvider`). Key fields:

| Field              | Purpose                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`             | Signed-in user (`displayName`, `domain`, `extension`, `scope`, …)                                                                                   |
| `api`              | Authenticated NetSapiens v2 API client (`get`/`post`/`put`/`delete`)                                                                                |
| `theme` / `locale` | Host theme (`light`/`dark`) and i18next translation function                                                                                        |
| `navigate`         | Navigate the host router                                                                                                                            |
| `eventBus`         | Per-app **scoped** pub/sub — your custom events stay within your app; host streams use `subscribeToStream`/`subscribeToCallEvents`, not raw `.on()` |
| `ui`               | Themed MUI Aurora components + templates (PageTemplate, SidePanel, …)                                                                               |

## Project structure

```
src/
  App.tsx                     # Orchestrator: registers all routes, extensions, column, call events
  api/
    callsApi.ts               # NetSapiens v2 API helper (live recent-calls/CDR fetch via the proxy)
  columns/
    CallPriorityColumn.tsx    # Dynamic column cell
  components/
    CodeBlock.tsx             # Themed monospace code block (Component Showcase)
  content/
    demoContent.ts            # Static content for DemoPage (capabilities, zones, patterns, snippets)
  extensions/                 # One component per zone extension
  mocks/                      # Demo fixtures (people, CRM, recent calls, sample table) — see mocks/README.md
  panels/                     # Side-panel content (CallDetails, QuickLinks)
  services/
    callEnrichment.ts         # Call-event → CRM enrichment + shared active-calls store
  pages/
    DemoPage.tsx              # Tab shell for the overview/walkthrough tour
    demo/                     # One component per DemoPage tab + shared style helpers
    ComponentShowcasePage.tsx # Composes the showcase sections
    showcase/sections/        # One self-contained section per shared UI component
    CrmIntegrationPage.tsx    # Full page: remoteAuth connect + live API call + CRM matching
```

## Hosting on GitHub Pages

A Module Federation remote is just static files (`remoteEntry.js` + chunks), so
**any** static host with permissive CORS works as the CDN. This repo uses
**GitHub Pages** — it's free, sends `Access-Control-Allow-Origin: *` by default,
and deploys straight from CI. The host loads this remote from:

```
https://netsapiens.github.io/horizon-sdk-demo/remoteEntry.js
        └──── Pages origin ────┘└─ repo path ─┘
```

> Opening that URL in a browser shows a blank page — this is a **headless
> remote**. It renders nothing on its own; it only mounts inside the Horizon host.

### How the build is wired for Pages

Two settings make a remote work from a Pages **subpath** (`/<repo>/`):

- **`webpack.config.js` → `output.publicPath: 'auto'`** (production). The remote
  resolves its own chunk URLs at runtime from wherever `remoteEntry.js` was
  loaded, so it doesn't care that Pages serves it under `/horizon-sdk-demo/`.
  Never hard-code an absolute `publicPath` for a Pages-hosted remote.
- **`.nojekyll`** — added by the workflow. Without it, GitHub's Jekyll layer
  strips files/folders that start with `_`, which breaks some webpack output.

### Set up your own GitHub Pages CDN

To host your own SDK remote (replace `horizon-sdk-demo` with your repo name):

1. **Create a repo** and push your app. A **public** repo gets Pages for free;
   private repos need GitHub Pro/Team/Enterprise.
2. **Enable Pages with the Actions source.** Repo **Settings → Pages → Build and
   deployment → Source: GitHub Actions**. (Or via CLI:
   `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`.)
3. **Add the deploy workflow.** Copy `.github/workflows/deploy-pages.yml`. It
   runs on every push to `main`: `npm ci` → `npm run build` → `touch
dist/.nojekyll` → upload `dist/` → `actions/deploy-pages`. Pushing a file
   under `.github/workflows/` requires your `gh`/git token to have the
   **`workflow`** scope (`gh auth refresh -s workflow`).
4. **Push to `main`.** Watch the run with `gh run watch` (or the Actions tab).
   First deploy can take a minute to go live.
5. **Verify the CDN** serves the remote with CORS:

   ```bash
   curl -sI https://<owner>.github.io/<repo>/remoteEntry.js \
     | grep -iE 'http/|content-type|access-control-allow-origin'
   # → 200, application/javascript, access-control-allow-origin: *
   ```

### Register the remote with a Horizon host

Hosting the files is only half of it — the host won't load a remote it doesn't
know about. In the host's **Registered Apps** UI (or the platform API):

1. **`remote_entry_url`** → your `https://<owner>.github.io/<repo>/remoteEntry.js`.
2. **`webpack_module`** → must **exactly** match the `name` in your
   `ModuleFederationPlugin` config (`MODULE_FEDERATION_NAME` in
   `webpack.config.js`, here `horizonExtensionDemo`). The host looks up
   `window[<webpack_module>]` after loading the script; a mismatch fails with
   `Container '<name>' not found`. This value is **immutable** — it's baked into
   the deployed bundle and is the root the server derives the app id from.
3. **`version`** → the `version` from `package.json`. Since SDK 0.2.x this is
   what tells the platform to re-verify the bytes at the (stable) remote entry
   URL. Registration alone verifies nothing: an app that has never had a version
   submitted sits at `verification_status: none`, and the host filters it out of
   `/ui-extensions?purpose=runtime` before the browser ever sees it — so it
   registers no routes and no zones while looking perfectly healthy in the list.
   Saving the **same** version again is a no-op; the platform refuses to
   re-verify a pair it has already judged. Bump it.

> **Do not send `integrity_hash`.** Earlier revisions of this README described it
> as an optional SRI hash you computed and registered yourself. That is
> withdrawn: the platform now computes the pin from the bytes it fetched at
> verification time, the field is ignored if sent, and accepting a caller-supplied
> value would make the pin self-attested.

Read the verdict after saving — **expand the row** to see the findings. Three
outcomes, and the middle one is not a failure: `approved` loads, `flagged` also
**loads** (findings were recorded, so read their _severity_ — an `info` finding
contributes nothing), and only `rejected` blocks. Expect a `size-delta` flag on
the first 0.2.x submission: taking the SDK out of `shared` moves it into the
bundle, and the analyser notes sharp size changes against the last approved
version. That is correct behaviour and needs no action.

The host also gates remotes by an **approved-domains** allowlist (defense in
depth, on top of registration). The Horizon host approves **`*.github.io`**, so
any GitHub Pages origin is accepted without a host-side change — clients can
self-host their remote on their own `*.github.io` and just register it.

## Releasing a new version

The partner-facing contract is in the SDK README under **Managing your app**. What
follows is what this repo specifically requires — the parts CI enforces and a
person will otherwise forget.

**Two version fields must move together**, and the workflow fails the build if
either is wrong:

| File                                  | Why                                                                                                                                                                                                                                                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                        | The remote entry URL is stable, so this is the only thing that tells the platform to re-verify. New bytes under an unchanged version leave it enforcing the **old** hash at the same URL — every host fails its integrity check and the extension silently stops appearing, with no verdict to explain it. |
| `src/integration/zones.manifest.json` | Carries the version the Playwright suite registers the app under. If it drifts, the suite registers a version the deployed bytes were never published as.                                                                                                                                                  |

The steps, start to finish:

```bash
# 1. bump BOTH version fields (package.json + zones.manifest.json)
# 2. if the SDK dependency changed, install it
npm install

# 3. the same gates CI runs — fail here, not in Actions
npm run build
npm run verify        # expect PASS; version-bump / cors / submit are `note` by design
npx tsc --noEmit      # baseline is 389 errors; adding none is the bar

# 4. commit and merge to main. Pushing main triggers the Pages deploy.
```

Then, on the platform:

5. Wait for the Pages deploy to finish — the platform fetches the bytes at
   submission time, so submitting before Pages has published verifies the _old_
   bundle.
6. In **Platform → UI SDK Management → Registered Apps**, press **Deploy** on the
   app's row. Nothing else needs changing — that is the point of this action, and
   it assigns the next free version itself. (Saving the app form also deploys, for
   when you have edited the Remote Entry URL or Version by hand.) Submission,
   verification and promotion are one step: it fetches, analyses and hashes the
   bundle, then promotes on `approved` or `flagged`.

   If the published bytes are identical to the verified ones you get "already up
   to date" — a success, not a no-op.

7. If it comes back `rejected`, fix the bundle and save again. The rejected version
   keeps its number and the auto-bump skips it.

⚠️ **Between the Pages deploy and the Deploy press**, the CDN serves new bytes
while the platform still pins the old hash. Anyone starting a fresh session in
that window will not see the extension. Keep the gap short.

## Notes

- **Live data on the CRM Integration page.** On load it calls
  `GET /domains/{domain}/users/{user}/cdrs` for the signed-in user via
  `horizonContext.api`, tags those rows **● Live**, and shows sample calls
  alongside them so the page is never empty. Caller matching reuses the same mock
  CRM directory that powers the inbound-call widget. (Authenticating to a real CRM
  backend on behalf of the user — the `auth.requestRemoteAuth` flow — is
  demonstrated standalone on the **Remote Auth** tab and can gate this page later.)
- **The on-demand side panel** is rendered by the host's `SdkSidePanel`
  (`components/sdk/SdkSidePanel.tsx` in `netsapiens-horizon`), mounted once in
  `MainLayout`. It reuses the shared `components/common/SidePanel` drawer and
  listens on the SDK event bus, so any federated app can open it with
  `sdk.openSidePanel()` / `useSidePanel()` from anywhere.
