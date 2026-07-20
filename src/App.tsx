/**
 * Remote Demo App — the federated entry point loaded by the Horizon host.
 *
 * This is the orchestrator: it initializes the SDK and, in a single effect,
 * registers everything the demo contributes to the host —
 *   - 3 full-page routes       (sdk.registerRoute)
 *   - 10 zone extensions        (sdk.registerDynamicExtension)
 *   - 1 dynamic table column    (sdk.registerDynamicColumn)
 *   - 1 call-event subscription (sdk.subscribeToCallEvents)
 *
 * Pattern-based extensions need no pre-defined extension points — each
 * registration targets a zone plus one or more route patterns, and the host
 * mounts the matching zones on its own pages. The component itself renders
 * nothing visible (it's a headless remote); all UI is injected into the host.
 */
import type { CallEvent } from '@netsapiens/horizon-sdk';
import { useEffect, useMemo } from 'react';
import {
  HorizonContext,
  HorizonContextProvider,
  useRemoteApp,
} from '@netsapiens/horizon-sdk';

import { CallPriorityCell } from './columns/CallPriorityColumn';
import {
  columnTestId,
  extensionRegistrations,
  routeTestId,
} from './integration/zones';
import { withZoneTestId } from './integration/withZoneTestId';
import ComponentShowcasePage from './pages/ComponentShowcasePage';
import CrmIntegrationPage from './pages/CrmIntegrationPage';
import DemoPage from './pages/DemoPage';
import { createCallEventHandler } from './services/callEnrichment';

// Injected at build time by webpack DefinePlugin (see webpack.config.js).
declare const __MF_NAME__: string;

export default function App(horizonContext: HorizonContext) {
  // `__MF_NAME__` is injected at build time (webpack DefinePlugin) from the
  // single MODULE_FEDERATION_NAME constant in webpack.config.js — the same value
  // used as the ModuleFederationPlugin `name`, so the container name lives in one
  // place. The SDK derives the kebab app id ('horizon-extension-demo') from it for
  // registry attribution.
  const { sdk, user, theme } = useRemoteApp(horizonContext, __MF_NAME__);

  // Full-page route components, wrapped once so they render with the live
  // HorizonContext (theme/locale/ui) available via useHorizonContext().
  const DemoPageWithContext = useMemo(
    () =>
      function DemoPageWithContext() {
        return (
          <HorizonContextProvider context={horizonContext}>
            <DemoPage />
          </HorizonContextProvider>
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const ComponentShowcasePageWithContext = useMemo(
    () =>
      function ComponentShowcasePageWithContext() {
        return (
          <HorizonContextProvider context={horizonContext}>
            <ComponentShowcasePage />
          </HorizonContextProvider>
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const CrmIntegrationPageWithContext = useMemo(
    () =>
      function CrmIntegrationPageWithContext() {
        return (
          <HorizonContextProvider context={horizonContext}>
            <CrmIntegrationPage />
          </HorizonContextProvider>
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    // ============================================================
    // 1. FULL PAGE ROUTES — added to the Apps and Manage menus
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
      column: {
        field: 'call-priority',
        headerName: 'Priority',
        width: 120,
        sortable: true,
        filterable: true,
        type: 'string',
        // Alignment is handled by the SDK — registered columns default to
        // right-aligned (matching native columns) unless a column overrides it.
        renderCell: (params) => (
          <span
            style={{ display: 'contents' }}
            data-testid={columnTestId('demo-call-priority-column')}
            data-zone='call-logs-columns'
          >
            <CallPriorityCell params={params} />
          </span>
        ),
        valueGetter: (value, row) => {
          const duration = Number(row['call-total-duration-seconds']) || 0;
          const direction = row['call-direction'];
          if (direction === 2) return 'High';
          if (direction === 1 && duration > 300) return 'High';
          if (duration > 180) return 'Medium';
          return 'Low';
        },
      },
    });

    return () => {
      unsubscribeCallEvents();
    };
  }, [sdk, horizonContext.eventBus]);

  // Headless: the app injects UI into the host; it renders nothing itself.
  return (
    <div style={{ display: 'none' }}>
      Demo App Loaded - User: {user.displayName} - Theme: {theme}
    </div>
  );
}
