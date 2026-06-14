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
dynamic table column**, **1 live call-event subscription**, and an **on-demand
side panel**.

### Full-page routes — `sdk.registerRoute()`

| Page               | Menu location            | Notes                                                                                                 |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Horizon SDK Demo   | Apps                     | The overview/walkthrough page (`pages/DemoPage.tsx`).                                                 |
| Component Showcase | Apps                     | Reference for every shared MUI Aurora component (`pages/ComponentShowcasePage.tsx`).                  |
| Hardphone Devices  | Manage (after _Devices_) | Full management page that makes a **live** NetSapiens v2 API call (`pages/HardphoneDevicesPage.tsx`). |

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
and broadcasts it to the `CallerInfoWidget`.

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
- npm access to the restricted `@netsapiens/horizon-sdk` package. Authenticate
  once with `npm login` (writes a token to `~/.npmrc`); CI uses the `NPM_TOKEN`
  secret. See `.npmrc`.

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
remote — see **Deployment** below.

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

| Field              | Purpose                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `user`             | Signed-in user (`displayName`, `domain`, `extension`, `scope`, …)     |
| `api`              | Authenticated NetSapiens v2 API client (`get`/`post`/`put`/`delete`)  |
| `theme` / `locale` | Host theme (`light`/`dark`) and i18next translation function          |
| `navigate`         | Navigate the host router                                              |
| `eventBus`         | Pub/sub across the host/remote boundary                               |
| `ui`               | Themed MUI Aurora components + templates (PageTemplate, SidePanel, …) |

## Project structure

```
src/
  App.tsx                     # Orchestrator: registers all routes, extensions, column, call events
  api/
    crmApi.ts                 # NetSapiens v2 API helpers (live device fetch + SIP user-agent parse)
  columns/
    CallPriorityColumn.tsx    # Dynamic column cell
  components/
    CodeBlock.tsx             # Themed monospace code block (Component Showcase)
  content/
    demoContent.ts            # Static content for DemoPage (capabilities, zones, patterns, snippets)
  extensions/                 # One component per zone extension
  mocks/                      # Demo fixtures (people, CRM, devices, sample table) — see mocks/README.md
  panels/                     # Side-panel content (CallDetails, QuickLinks, DeviceDetail)
  services/
    callEnrichment.ts         # Call-event → CRM enrichment + shared active-calls store
  pages/
    DemoPage.tsx              # Tab shell for the overview/walkthrough tour
    demo/                     # One component per DemoPage tab + shared style helpers
    ComponentShowcasePage.tsx # Composes the showcase sections
    showcase/sections/        # One self-contained section per shared UI component
    HardphoneDevicesPage.tsx  # Full page with a live API call
```

## Deployment

This remote is hosted on **GitHub Pages**, which serves the build output as a
CDN. After a push to `main`, the workflow in `.github/workflows/deploy-pages.yml`
runs `npm ci` + `npm run build` and publishes `dist/`. A Horizon host then loads
the remote from:

```
https://netsapiens.github.io/horizon-sdk-demo/remoteEntry.js
```

GitHub Pages sends `Access-Control-Allow-Origin: *`, so the host can load it
cross-origin. `webpack.config.js` uses `publicPath: 'auto'`, so the remote
resolves its own chunks from wherever Pages serves them (the repo subpath).

> Opening the Pages URL in a browser shows a blank page — this is a **headless
> remote**, it only renders once mounted by the host.

One-time repo setup:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Add an **`NPM_TOKEN`** repository secret (a token with read access to the
   restricted `@netsapiens/horizon-sdk` package) so CI can install the SDK.

## Notes

- **Live data on the Hardphone Devices page.** On load it calls
  `GET /domains/{domain}/users/{user}/devices` for the signed-in user via
  `horizonContext.api`, tags those rows **● Live**, and shows sample devices
  alongside them so the page is never empty. A domain-wide registration feed is
  delivered over the platform's socket channel rather than REST, so it is out of
  scope for the SDK's REST client.
- **The on-demand side panel** is rendered by the host's `SdkSidePanel`
  (`components/sdk/SdkSidePanel.tsx` in `netsapiens-horizon`), mounted once in
  `MainLayout`. It reuses the shared `components/common/SidePanel` drawer and
  listens on the SDK event bus, so any federated app can open it with
  `sdk.openSidePanel()` / `useSidePanel()` from anywhere.
