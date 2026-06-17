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

## What it demonstrates

This single app registers **3 full-page routes**, **10 zone extensions**, **1
dynamic table column**, **1 live call-event subscription**, an **on-demand
side panel**, and a **remote-auth handshake** with a backend.

### Full-page routes — `sdk.registerRoute()`

| Page               | Menu location              | Notes                                                                                                                                                                                                                 |
| ------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Horizon SDK Demo   | Apps                       | The overview/walkthrough page (`pages/DemoPage.tsx`).                                                                                                                                                                 |
| Component Showcase | Apps                       | Reference for every shared MUI Aurora component (`pages/ComponentShowcasePage.tsx`).                                                                                                                                  |
| CRM Integration    | Manage (after _Call Logs_) | Lists the user's calls from a **live** NetSapiens v2 API call, matched to their CRM record — registered into the Manage menu to show the Manage tree can be extended, not just Apps (`pages/CrmIntegrationPage.tsx`). |

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

const token = await auth.requestRemoteAuth(
  {
    vendorId: 'horizon-demo-backend',
    callbackUrl: 'https://demo.example.com/horizon/callback',
    scopes: ['contacts:read'],
  },
  { timeout: 60000 },
);
// token: { vendorId, accessToken, tokenType?, expiresAt?, refreshToken?, metadata? }

auth.getRemoteAuthToken('horizon-demo-backend'); // cached for the session, or null
auth.clearRemoteAuthToken('horizon-demo-backend'); // sign out of the vendor
```

The NetSapiens platform binds the identity to the caller's **trusted session**
(never the request's `user.uid`, which is attacker-controllable), checks the app
is remote-auth enabled and the `callbackUrl` hostname is allow-listed, then POSTs
a **single-use auth code** (not a token) to your `callbackUrl`. Your backend:

1. Verifies the `X-NS-Signature` HMAC — `sha256=<hex>` over the string
   `request_id + code + timestamp`, using the shared callback secret. (A second
   `X-NS-Cluster-Verification` signed JWT can be verified against the platform's
   published JWKS for secret-less proof.)
2. Exchanges the code (PKCE) at the `validation_endpoint` from the payload for a
   token that proves the user's identity.
3. Mints its **own** vendor token and returns it — which resolves the promise as
   the `RemoteAuthResponse`.

The panel shows both the client call and the backend verification + exchange
snippet. A runnable reference backend lives in [`examples/vendor-backend/`](examples/vendor-backend/).

> This is the **client half** of the flow; the platform handles the signing,
> callback delivery, code exchange, and response shaping server-side. Two things
> to know: the response is mapped through an explicit allow-list (`access_token`,
> `token_type`, `expires_in`, `refresh_token` — no generic `metadata`
> pass-through today), and the platform sends `X-NS-Signature` /
> `X-NS-Cluster-Verification` best-effort while a secure backend requires both. It
> also needs per-app admin config (remote auth enabled, allowed callback
> hostnames, signing secret). Against a host without it the request rejects/times
> out and the panel
> renders the error.

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

`react`, `react-dom`, and `@netsapiens/horizon-sdk` are shared as singletons so
the host and remote use one instance each.

> Do **not** add `@mui/material` to `shared`. Use MUI components via
> `horizonContext.ui` / `context.ui` instead so extensions inherit the host
> theme.

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
3. **`integrity_hash`** _(optional, recommended for production)_ — an SRI hash of
   `remoteEntry.js`. If set, the host verifies it before executing the script.
   Because each build emits content-hashed filenames, **re-register the hash on
   every deploy** or loads will fail with `Integrity check failed`. Leave it
   blank while iterating.

The host also gates remotes by an **approved-domains** allowlist (defense in
depth, on top of registration). The Horizon host approves **`*.github.io`**, so
any GitHub Pages origin is accepted without a host-side change — clients can
self-host their remote on their own `*.github.io` and just register it.

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
