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
import { ActiveCallsRecordingFilter } from './extensions/ActiveCallsRecordingFilter';
import { AnalyticsWidget } from './extensions/AnalyticsWidget';
import { CallerInfoWidget } from './extensions/CallerInfoWidget';
import ComplianceCheckbox from './extensions/ComplianceCheckbox';
import ContactFormBanner from './extensions/ContactFormBanner';
import { ExportButton } from './extensions/ExportButton';
import { HeaderStatusBadge } from './extensions/HeaderStatusBadge';
import { QuickActionButton } from './extensions/QuickActionButton';
import { TableToolbarInfo } from './extensions/TableToolbarInfo';
import { TopbarHelpButton } from './extensions/TopbarHelpButton';
import ComponentShowcasePage from './pages/ComponentShowcasePage';
import DemoPage from './pages/DemoPage';
import HardphoneDevicesPage from './pages/HardphoneDevicesPage';
import { createCallEventHandler } from './services/callEnrichment';

// Injected at build time by webpack DefinePlugin (see webpack.config.js).
declare const __MF_NAME__: string;

export default function App(horizonContext: HorizonContext) {
  // `__MF_NAME__` is injected at build time (webpack DefinePlugin) from the
  // single MODULE_FEDERATION_NAME constant in webpack.config.js — the same value
  // used as the ModuleFederationPlugin `name`, so the container name lives in one
  // place. The SDK derives the kebab app id ('ucaas-extension-demo') from it for
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

  const HardphoneDevicesPageWithContext = useMemo(
    () =>
      function HardphoneDevicesPageWithContext() {
        return (
          <HorizonContextProvider context={horizonContext}>
            <HardphoneDevicesPage />
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
        component: DemoPageWithContext,
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
        component: ComponentShowcasePageWithContext,
      })
      .catch((error) =>
        console.error(
          '[Demo App] Failed to register Component Showcase:',
          error,
        ),
      );

    sdk
      .registerRoute({
        id: 'ucaas-hardphone-devices',
        parentPath: '/manage',
        path: 'hardphone-devices',
        label: 'Hardphone Devices',
        icon: 'mdi:deskphone',
        placement: { after: 'devices' },
        component: HardphoneDevicesPageWithContext,
      })
      .catch((error) =>
        console.error(
          '[Demo App] Failed to register Hardphone Devices:',
          error,
        ),
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
    // 3. DYNAMIC EXTENSIONS — inject components into host zones
    // ============================================================

    // Export button across several list pages (matched by route pattern).
    sdk.registerDynamicExtension({
      id: 'demo-export-button',
      zone: 'page-header-actions',
      routes: [
        { pattern: '/manage/call-logs' },
        { pattern: '/manage/*/call-logs' },
        { pattern: '/manage/*/contacts' },
        { pattern: '/manage/*/devices/registrations' },
        { pattern: '/manage/*/users' },
      ],
      priority: 10,
      component: ExportButton,
    });

    // Call analytics summary — only on call-logs.
    sdk.registerDynamicExtension({
      id: 'demo-analytics-widget',
      zone: 'page-content-after',
      routes: [
        { pattern: '/manage/call-logs' },
        { pattern: '/manage/:domain/call-logs' },
      ],
      priority: 100,
      component: AnalyticsWidget,
      // Aggregates live call metrics — declares the call-events capability so the
      // platform can gate it and surface it on the Registered Apps table.
      requiredPermissions: ['call-events:subscribe'],
    });

    // Per-row quick action on call-logs → opens a Call details side panel.
    sdk.registerDynamicExtension({
      id: 'demo-quick-action',
      zone: 'table-row-actions',
      routes: [
        { pattern: '/manage/call-logs' },
        { pattern: '/manage/*/call-logs' },
      ],
      component: QuickActionButton,
    });

    // Dynamic "Priority" column merged into the call-logs table. The host's
    // DataTable derives the `call-logs-columns` zone from the route and merges
    // registered columns into the grid.
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
        renderCell: (params) => <CallPriorityCell params={params} />,
        valueGetter: (value, row) => {
          const duration = row['call-total-duration-seconds'] || 0;
          const direction = row['call-direction'];
          if (direction === 2) return 'High';
          if (direction === 1 && duration > 300) return 'High';
          if (duration > 180) return 'Medium';
          return 'Low';
        },
      },
    });

    // Enriched caller card in the inbound-call widget (every route).
    sdk.registerDynamicExtension({
      id: 'demo-caller-info-widget',
      zone: 'inbound-call-content',
      routes: [{ pattern: '/*' }],
      priority: 100,
      component: CallerInfoWidget,
      // Enriches inbound calls from the live call-event stream — declares the
      // call-events capability so it is gated and shown on the Registered Apps table.
      requiredPermissions: ['call-events:listen'],
    });

    // CRM context banner + GDPR consent checkboxes in the Contacts form.
    sdk.registerDynamicExtension({
      id: 'demo-contact-form-banner',
      zone: 'form-section-before',
      routes: [
        { pattern: '/manage/*/contacts' },
        { pattern: '/home/contacts' },
      ],
      priority: 100,
      component: ContactFormBanner,
    });
    sdk.registerDynamicExtension({
      id: 'demo-compliance-checkbox',
      zone: 'form-section-after',
      routes: [
        { pattern: '/manage/*/contacts' },
        { pattern: '/home/contacts' },
      ],
      priority: 50,
      component: ComplianceCheckbox,
    });

    // Recording filter chip on the Active Calls page.
    sdk.registerDynamicExtension({
      id: 'demo-active-calls-recording-filter',
      zone: 'table-filter-bar',
      routes: [
        { pattern: '/manage/active-calls' },
        { pattern: '/manage/*/active-calls' },
      ],
      priority: 10,
      component: ActiveCallsRecordingFilter,
    });

    // One example per remaining generic zone, so every zone has a live demo:
    // "● Live" status badge beside the call-logs title.
    sdk.registerDynamicExtension({
      id: 'demo-header-status-badge',
      zone: 'page-header-secondary',
      routes: [
        { pattern: '/manage/call-logs' },
        { pattern: '/manage/*/call-logs' },
      ],
      component: HeaderStatusBadge,
    });
    // Triage tips button in the call-logs table toolbar.
    sdk.registerDynamicExtension({
      id: 'demo-table-toolbar-info',
      zone: 'table-toolbar',
      routes: [
        { pattern: '/manage/call-logs' },
        { pattern: '/manage/*/call-logs' },
      ],
      component: TableToolbarInfo,
    });
    // Global topbar Help button — opens the shared side panel (every route).
    sdk.registerDynamicExtension({
      id: 'demo-topbar-help',
      zone: 'topbar-actions',
      routes: [{ pattern: '/*' }],
      component: TopbarHelpButton,
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
