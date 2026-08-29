/**
 * Remote Demo App — the federated entry point loaded by the Horizon host.
 *
 * This is the orchestrator: it initializes the SDK and, in a single effect,
 * registers everything the demo contributes to the host —
 *   - 5 full-page routes       (sdk.registerRoute)
 *   - 10 zone extensions        (sdk.registerDynamicExtension)
 *   - 1 dynamic table column    (sdk.registerDynamicColumn)
 *   - 2 dashboard widgets       (sdk.registerWidget)
 *   - 1 call-event subscription (sdk.subscribeToCallEvents)
 *
 * Pattern-based extensions need no pre-defined extension points — each
 * registration targets a zone plus one or more route patterns, and the host
 * mounts the matching zones on its own pages. The component itself renders
 * nothing visible (it's a headless remote); all UI is injected into the host.
 *
 * ── Scope declarations (SDK 0.2.4) ────────────────────────────────────────
 * Two surfaces here declare `requiredScopes`, chosen to show the two cases that
 * behave differently:
 *
 *   - Component Showcase sits under `/apps`, which has NO section floor, so its
 *     'DOMAIN_MANAGERS' declaration is the only thing gating the page.
 *   - The Priority column sits on a `/manage` page whose floor is already
 *     ADMINS, and asks for 'PLATFORM' — narrowing a gate the host enforces, so a
 *     Reseller sees Call Logs without that column.
 *
 * The rule underneath both: a declaration is intersected with the host's floor,
 * so it can only ever restrict further. Declaring a wider audience grants
 * nothing. Prefer a tier name over a scope list — the host resolves the name
 * against its current membership, while a list is a snapshot that silently loses
 * access as tiers change.
 *
 * ── Domain-scoped pages (SDK 0.2.9) ───────────────────────────────────────
 * CRM Sync registers under `parentPath: '/manage/:domain'` — the one parent
 * path that accepts a token. It exists so a page can follow the domain an
 * admin has drilled into WITHOUT the app enumerating domains: one registration
 * serves all of them, and the page reads the current one with
 * `useManagingDomain()`. Contrast it with CRM Integration directly above,
 * which sits at plain `/manage` and is the same page for every domain.
 */
import type { CallEvent, WidgetComponentProps } from '@netsapiens/horizon-sdk';
import { useEffect, useMemo, useRef } from 'react';
import {
  HorizonContext,
  HorizonContextProvider,
  useRemoteApp,
} from '@netsapiens/horizon-sdk';

import type { ZoneMarkerProps } from './integration/withZoneTestId';
import { CallPriorityCell } from './columns/CallPriorityColumn';
import { withZoneTestId } from './integration/withZoneTestId';
import {
  columnTestId,
  extensionRegistrations,
  routeTestId,
  widgetTestId,
} from './integration/zones';
import CallRecordingsPage from './pages/CallRecordingsPage';
import ComponentShowcasePage from './pages/ComponentShowcasePage';
import CrmIntegrationPage from './pages/CrmIntegrationPage';
import DemoPage from './pages/DemoPage';
import DomainCrmSyncPage from './pages/DomainCrmSyncPage';
import { createCallEventHandler } from './services/callEnrichment';
import { RecentActivityWidget } from './widgets/RecentActivityWidget';
import { RecordedCallsStat } from './widgets/RecordedCallsStat';

// Injected at build time by webpack DefinePlugin (see webpack.config.js).
declare const __MF_NAME__: string;

// Widget components, tagged with their manifest testId once at module scope.
// `registerWidget` stores the component by identity and the host renders that
// identity, so building the wrapper inside the effect would hand the host a new
// component every time the effect re-ran and remount every placed instance.
//
// No `data-zone` here, unlike a zone extension: a widget declares a LIST of
// dashboards it is eligible on and the same component mounts on whichever one
// the user added it to, so a single zone attribute would name the wrong one. The
// eligible zones are recorded in zones.manifest.json instead.
//
// The type argument is explicit: `withZoneTestId` infers `P` from the component
// it is handed, and spelling it out keeps the result a
// `ComponentType<WidgetComponentProps>` — exactly what `registerWidget` wants.
const RecentActivityWidgetTagged = withZoneTestId<WidgetComponentProps>(
  RecentActivityWidget,
  widgetTestId('demo-recent-activity'),
);

const RecordedCallsStatTagged = withZoneTestId<WidgetComponentProps>(
  RecordedCallsStat,
  widgetTestId('demo-recorded-calls'),
);

export default function App(horizonContext: HorizonContext) {
  // `__MF_NAME__` is injected at build time (webpack DefinePlugin) from the
  // single MODULE_FEDERATION_NAME constant in webpack.config.js — the same value
  // used as the ModuleFederationPlugin `name`, so the container name lives in one
  // place. The SDK derives the kebab app id ('horizon-extension-demo') from it for
  // registry attribution.
  const { sdk, user, theme } = useRemoteApp(horizonContext, __MF_NAME__);

  // The host rebuilds `horizonContext` on every color-mode change — including
  // `ui`, of which it keeps one frozen surface per mode (`createHorizonUi(mode)`
  // in its HorizonAppsLoader). The wrappers below are memoized with empty deps
  // to keep component identity stable across re-registration, which on its own
  // would pin them to the context captured on first paint — `ui.theme` and
  // `ui.styles` would then keep the mode that was active when the app loaded.
  // This ref bridges the two: each wrapper reads the LATEST context at render,
  // so HorizonContextProvider spreads a `ui` matching the mode the user is
  // actually looking at. (Prefer `ui.*` components regardless — see CLAUDE.md.)
  const contextRef = useRef(horizonContext);
  contextRef.current = horizonContext;

  // Full-page route components, wrapped once so they render with the live
  // HorizonContext (theme/locale/ui) available via useHorizonContext().
  const DemoPageWithContext = useMemo(
    () =>
      // Forward the marker props withZoneTestId injects (data-testid/data-zone)
      // into the page so it can tag its own root — otherwise they're dropped.
      function DemoPageWithContext(props: ZoneMarkerProps) {
        return (
          <HorizonContextProvider context={contextRef.current}>
            <DemoPage {...props} />
          </HorizonContextProvider>
        );
      },

    [],
  );

  const ComponentShowcasePageWithContext = useMemo(
    () =>
      function ComponentShowcasePageWithContext(props: ZoneMarkerProps) {
        return (
          <HorizonContextProvider context={contextRef.current}>
            <ComponentShowcasePage {...props} />
          </HorizonContextProvider>
        );
      },

    [],
  );

  const CrmIntegrationPageWithContext = useMemo(
    () =>
      function CrmIntegrationPageWithContext(props: ZoneMarkerProps) {
        return (
          <HorizonContextProvider context={contextRef.current}>
            <CrmIntegrationPage {...props} />
          </HorizonContextProvider>
        );
      },

    [],
  );

  const DomainCrmSyncPageWithContext = useMemo(
    () =>
      function DomainCrmSyncPageWithContext(props: ZoneMarkerProps) {
        return (
          <HorizonContextProvider context={contextRef.current}>
            <DomainCrmSyncPage {...props} />
          </HorizonContextProvider>
        );
      },

    [],
  );

  const CallRecordingsPageWithContext = useMemo(
    () =>
      function CallRecordingsPageWithContext(props: ZoneMarkerProps) {
        return (
          <HorizonContextProvider context={contextRef.current}>
            <CallRecordingsPage {...props} />
          </HorizonContextProvider>
        );
      },

    [],
  );

  useEffect(() => {
    // ============================================================
    // 1. FULL PAGE ROUTES — added to the Apps, Manage and My Account menus
    // ============================================================
    sdk
      .registerRoute({
        id: 'ucaas-demo-page',
        parentPath: '/apps',
        path: 'horizon-sdk-demo',
        label: 'Horizon SDK Demo',
        icon: 'mdi:rocket-launch',
        placement: { last: true },
        component: withZoneTestId(
          DemoPageWithContext,
          routeTestId('ucaas-demo-page'),
        ),
      })
      .catch((error) =>
        console.error('[Demo App] Failed to register demo page:', error),
      );

    sdk
      .registerRoute({
        id: 'ucaas-component-showcase',
        parentPath: '/apps',
        path: 'component-showcase',
        label: 'Component Showcase',
        icon: 'mdi:palette',
        placement: { first: true },
        // `/apps` carries no section floor, so this declaration is the ONLY
        // thing gating the page — the case where `requiredScopes` does real
        // work rather than narrowing something the host already enforces. It
        // governs the nav entry and the URL together, so a Basic User neither
        // sees the menu item nor reaches /apps/component-showcase by typing it.
        //
        // A tier NAME, not a scope list: the host resolves 'DOMAIN_MANAGERS'
        // against its own current membership when access is checked, so if the
        // platform re-members the tier this page follows with nothing to
        // rebuild. A literal list would be a snapshot of today, and because the
        // host intersects, a stale one quietly LOSES access rather than failing.
        //
        // Written inline rather than pulled from a constant on purpose: the
        // platform analyser extracts an app's declared surface by reading string
        // literals out of the submitted source, so a constant extracts as
        // nothing and the Registered Apps page shows an empty Routes column.
        requiredScopes: 'DOMAIN_MANAGERS',
        component: withZoneTestId(
          ComponentShowcasePageWithContext,
          routeTestId('ucaas-component-showcase'),
        ),
      })
      .catch((error) =>
        console.error(
          '[Demo App] Failed to register Component Showcase:',
          error,
        ),
      );

    sdk
      .registerRoute({
        id: 'ucaas-crm-integration',
        // Mounts under the host's /manage/$ dynamic-route outlet, so the route
        // lives one level under /manage (→ /manage/crm-integration). The menu
        // item is placed right after Call Logs. (Deeper nesting under a static
        // route like call-logs would need a host-side splat outlet there.)
        parentPath: '/manage',
        path: 'crm-integration',
        label: 'CRM Integration',
        icon: 'mdi:account-sync',
        placement: { after: 'call-logs' },
        component: withZoneTestId(
          CrmIntegrationPageWithContext,
          routeTestId('ucaas-crm-integration'),
        ),
      })
      .catch((error) =>
        console.error('[Demo App] Failed to register CRM Integration:', error),
      );

    sdk
      .registerRoute({
        id: 'ucaas-domain-crm-sync',
        // DOMAIN-SCOPED. `:domain` is a token the host fills from the URL, so
        // this ONE registration serves every domain the admin can drill into
        // (→ /manage/acme.example.com/crm-sync). The app never enumerates or
        // names a domain; the page reads the selected one with
        // useManagingDomain(). `/manage/:domain` is the only parent path that
        // takes a token today, and the token must sit at that one position.
        parentPath: '/manage/:domain',
        path: 'crm-sync',
        label: 'CRM Sync',
        icon: 'mdi:sync',
        // Drilling into a domain is a Reseller-and-up action to begin with; the
        // page itself only needs a domain manager once you are inside one.
        requiredScopes: 'DOMAIN_MANAGERS',
        component: withZoneTestId(
          DomainCrmSyncPageWithContext,
          routeTestId('ucaas-domain-crm-sync'),
        ),
      })
      .catch((error) =>
        console.error('[Demo App] Failed to register CRM Sync:', error),
      );

    sdk
      .registerRoute({
        id: 'ucaas-call-recordings',
        // Mounts under the host's /home/$ dynamic-route outlet (→
        // /home/call-recordings), which puts it in the My Account menu — the
        // third menu tree this app extends, alongside Apps and Manage.
        //
        // '/home' is the right prefix even though the menu reads "My Account":
        // the label, the host's section id ('myaccount') and the URL prefix are
        // three different strings for one tree. '/myaccount' is not a route.
        // Older hosts resolve this URL but show no menu entry for it; see
        // "Choosing a menu — parentPath" in the README.
        //
        // Placed right after Call Logs, which recordings pair naturally with.
        // The anchor is matched by normalizing the menu item's name, so
        // 'call-logs' resolves the My Account item whose name is 'CALL_LOGS'
        // (both normalize to 'calllogs') even though its path is /home/inbox/call.
        parentPath: '/home',
        path: 'call-recordings',
        label: 'Call Recordings',
        icon: 'mdi:record-rec',
        placement: { after: 'call-logs' },
        component: withZoneTestId(
          CallRecordingsPageWithContext,
          routeTestId('ucaas-call-recordings'),
        ),
      })
      .catch((error) =>
        console.error('[Demo App] Failed to register Call Recordings:', error),
      );

    // ============================================================
    // 2. CALL EVENTS — enrich inbound calls from the mock CRM
    // ============================================================
    // Subscribe through the capability-gated, app-scoped SDK path (NOT the raw
    // event bus) so the platform enforces the call-events capability and records
    // that this app consumes call events. The handler lives in
    // services/callEnrichment.ts.
    const unsubscribeCallEvents = sdk.subscribeToCallEvents(
      ['call-started', 'call-answered', 'call-missed', 'call-ended'],
      // The SDK's CallEvent type is looser than the runtime payload the demo
      // relies on (from/to/direction/timestamp), so cast at this boundary.
      createCallEventHandler(horizonContext.eventBus) as unknown as (
        event: CallEvent,
      ) => void,
    );

    // ============================================================
    // 3. DYNAMIC EXTENSIONS + COLUMN — inject into host zones
    // ============================================================
    // The 10 zone extensions are declared in integration/zones.manifest.json
    // (zone, route patterns, priority, permissions, testId) and registered by
    // iterating that manifest. Each component is wrapped with withZoneTestId so
    // the netsapiens-horizon-testing Playwright suite can locate the zone it
    // mounts into. Add/remove an extension by editing the manifest + the
    // COMPONENTS map in integration/zones.ts.
    for (const ext of extensionRegistrations) {
      sdk.registerDynamicExtension(ext);
    }

    // Dynamic "Priority" column merged into the call-logs table. The host's
    // DataTable derives the `call-logs-columns` zone from the route and merges
    // registered columns into the grid. Each rendered cell is tagged with the
    // manifest testId so the suite can assert the column mounted.
    sdk.registerDynamicColumn({
      id: 'demo-call-priority-column',
      zone: 'call-logs-columns',
      routes: [
        { pattern: '/manage/call-logs' },
        { pattern: '/manage/*/call-logs' },
      ],
      // Narrower than the page it appears on. Call Logs lives under `/manage`,
      // whose section floor is ADMINS (Admin, Super User, Reseller); this column
      // asks for PLATFORM, so a Reseller opens the page and sees every native
      // column but not this one. That is the intended shape of a column gate —
      // `renderCell` below is where action controls live, so a column reaches a
      // user exactly as a zone extension does, and deserves the same thought.
      //
      // The host intersects this with the page's floor, so it can only subtract.
      // Declaring a WIDER audience here (say 'END_USERS') would grant nothing —
      // it would intersect to the empty set and hide the column from everyone.
      requiredScopes: 'PLATFORM',
      column: {
        field: 'call-priority',
        headerName: 'Priority',
        width: 120,
        sortable: true,
        filterable: true,
        type: 'string',
        // Alignment is handled by the SDK — registered columns default to
        // right-aligned (matching native columns) unless a column overrides it.
        // Second argument is the host-built extension context — the same `ui`,
        // `theme`, `t` and app-scoped `eventBus` a zone extension receives. The
        // cell renders from `context.ui`, so it re-themes with the host toggle.
        renderCell: (params, context) => (
          <CallPriorityCell
            params={params}
            context={context}
            data-testid={columnTestId('demo-call-priority-column')}
            data-zone='call-logs-columns'
          />
        ),
        valueGetter: (_value, row) => {
          const duration = Number(row['call-total-duration-seconds']) || 0;
          const direction = row['call-direction'];
          if (direction === 2) return 'High';
          if (direction === 1 && duration > 300) return 'High';
          if (duration > 180) return 'Medium';
          return 'Low';
        },
      },
    });

    // ============================================================
    // 4. DASHBOARD WIDGETS — cards on the host's dashboards
    // ============================================================
    // `sdk.registerWidget` is the only path. There is no bus event to emit: the
    // event names are an SDK implementation detail and are deliberately not
    // exported, so an app that reaches for the bus is coding against something
    // it cannot see change.
    //
    // Registering a widget makes it ELIGIBLE; it does not place it. A saved
    // layout is authoritative, so a widget an app ships appears in the
    // dashboard's Customize catalogue rather than on a grid somebody already
    // arranged. Both of these show up under Customize on first load, not on the
    // dashboard — that is the contract working.
    //
    // Registered inline rather than looped out of zones.manifest.json (which the
    // 10 zone extensions above are), for the same reason routes and the column
    // are: bundle verification reviews an app by extracting string literals from
    // its source, so `zones` has to be a literal array written at the call site.
    // A helper — including the SDK's own internal `widgetZoneFor(surface)`, which
    // is not exported for exactly this reason — extracts as nothing, and the zone
    // can then never be attributed to this app.

    // A PANEL: its own card on the grid.
    sdk.registerWidget({
      // A plain name, NOT 'horizon-extension-demo:recent-activity'. The host
      // stamps the app prefix itself, from this app's binding on the bus, so two
      // apps can both ship a `recent-activity` and neither has to know. It is
      // stored as 'horizon-extension-demo:recent-activity', and that stored id is
      // what lands in every user's saved layout — which makes this the one field
      // that cannot be renamed later without losing every placement.
      id: 'recent-activity',
      kind: 'panel',
      // Written out in full, as literals. Two zones because the same panel suits
      // both dashboards; the user still adds it separately on each.
      zones: ['platform-admin-dashboard-widgets', 'manage-dashboard-widgets'],
      title: 'Recent activity',
      description: 'Recent call activity for the selected time range.',
      icon: 'mdi:pulse',
      // Decides the catalogue section AND the shape of the loading wireframe the
      // host draws while the component is suspended.
      category: 'activity',
      // Panels only. A leaf has no size of its own — see the leaf below.
      size: { default: 'half', resizable: true },
      // No `chrome` — it defaults to 'host', so the frame draws the card, the
      // title row from `title` above, the inner padding and the overflow menu.
      // The component draws none of them. Setting 'self' here would give the card
      // two titles and a double inset.

      // Where it lands on add, and on every RE-add: anchors resolve each time, so
      // a widget removed and added back returns here rather than to wherever it
      // was last dragged. Once it is on a grid the user's arrangement wins and
      // this is not consulted again. 'health' is a native panel on the Platform
      // dashboard; on the Manage dashboard, where that anchor does not exist, the
      // host falls back to the end.
      placement: { after: 'health' },
      // The host resolves the dashboard's shared range and hands this widget
      // `widget.range` as from/to TIMESTAMPS — never a preset label like
      // "Last 7 days", so there is nothing for the widget to parse.
      refreshPolicy: 'shared-range',
      // Narrows only, like the route and column declarations above: the host
      // intersects it with the dashboard's own floor. Both dashboards this
      // targets are already at ADMINS or above, so today this subtracts nothing —
      // it is here to show where the declaration goes on a widget. The Priority
      // column is the example of one that actually bites.
      requiredScopes: 'ADMINS',
      component: RecentActivityWidgetTagged,
    });

    // A LEAF: a block INSIDE the host's stat container, not a card of its own.
    sdk.registerWidget({
      id: 'recorded-calls',
      kind: 'leaf',
      // The container category it belongs in. The host's stats panel declares
      // `acceptsLeaves: { category: 'stat' }`, so this sits alongside the native
      // stat blocks and reorders within that container rather than on the grid.
      leafOf: 'stat',
      zones: ['platform-admin-dashboard-widgets'],
      title: 'Recordings processed',
      description: 'Recordings successfully processed in the last 24 hours.',
      icon: 'mdi:record-rec',
      category: 'stats',
      // Deliberately no `size`: that is panels only, and a leaf's width belongs
      // to its container's grid. It gets no pixel box either — `widget.pixel` is
      // `{ width: 0, height: 0 }` for a leaf.
      component: RecordedCallsStatTagged,
    });

    return () => {
      unsubscribeCallEvents();
      // By the same plain names they were registered under — the host resolves
      // the prefix, here as at registration.
      sdk.unregisterWidget('recent-activity');
      sdk.unregisterWidget('recorded-calls');
    };
  }, [
    sdk,
    horizonContext.eventBus,
    DemoPageWithContext,
    DomainCrmSyncPageWithContext,
    ComponentShowcasePageWithContext,
    CrmIntegrationPageWithContext,
    CallRecordingsPageWithContext,
  ]);

  // Headless: the app injects UI into the host; it renders nothing itself.
  return (
    <div style={{ display: 'none' }}>
      Demo App Loaded - User: {user.displayName} - Theme: {theme}
    </div>
  );
}
