/**
 * Example CRM — a full-page route built from `templates.DashboardTemplate`.
 *
 * The counterpart to everything in `src/widgets/`. Those register into the
 * HOST's dashboards, where they appear in Customize and the user decides
 * whether and where they land. This page is the other model: the app owns the
 * whole surface, declares which cards appear and in what order, and no reader
 * rearranges it. A vendor dashboard for a vendor's feature set.
 *
 * What the template still gives is everything that makes it look like ours —
 * the dashboard page header, the widget grid and its edge-to-edge bleed, and the
 * same card frame a registered widget gets, so each card draws its title,
 * subtitle, shared-range chip and metric tooltip from what is declared here.
 * What it drops is Reorder, Customize and the saved layout, none of which mean
 * anything when the app decided the layout.
 *
 * `rangeControl` opts into the host's own pre-canned window selector. Cards
 * declaring `refreshPolicy: 'shared-range'` then receive resolved timestamps and
 * a window chip in their header; the sync queue declares `'own-cadence'` and is
 * correctly left alone by it.
 *
 * The widgets are the SAME components registered in `App.tsx` §4, reused
 * unchanged through one adapter — see `asPageWidget`. That is the point worth
 * making to a partner: a widget is a component, and where it renders is a
 * registration decision, not something to rebuild for.
 */
import type {
  DashboardTemplateWidgetProps,
  ExtensionContext,
  WidgetComponentProps,
} from '@netsapiens/horizon-sdk';
import type { ComponentType } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { CallVolumeChart } from '../widgets/CallVolumeChart';
import { LiveCallsWidget } from '../widgets/LiveCallsWidget';
import { RecentActivityWidget } from '../widgets/RecentActivityWidget';
import { SyncedContactsStat } from '../widgets/SyncedContactsStat';
import { SyncFailuresStat } from '../widgets/SyncFailuresStat';
import { SyncQueueTable } from '../widgets/SyncQueueTable';

/**
 * Run a dashboard widget on a template page.
 *
 * A registered widget is handed `{ context, widget, actions }` by the host. On a
 * page the app is already inside `HorizonContextProvider`, so the context comes
 * from `useHorizonContext()` instead — the same `ui`, live with the colour mode.
 *
 * `actions` are no-ops, and honestly so: remove, resize and refresh act on a
 * grid the reader arranged, and there is no such grid here. A widget that calls
 * one gets nothing rather than a broken frame.
 *
 * The cast is the seam between two context shapes. `HorizonContext` is the
 * page-level object and `ExtensionContext` the injected one; they overlap on
 * everything a widget reads (`ui`, `theme`, `eventBus`, `t`), which is why one
 * component can serve both surfaces at all.
 */
function asPageWidget(
  Widget: ComponentType<WidgetComponentProps & ZoneMarkerProps>,
  testId: string,
) {
  return function PageWidget({ widget }: DashboardTemplateWidgetProps) {
    const context = useHorizonContext();

    return (
      <Widget
        data-testid={testId}
        context={context as unknown as ExtensionContext}
        widget={{ ...widget, isEditing: false, isDragging: false }}
        actions={{
          remove: () => {},
          resize: () => {},
          refresh: () => {},
        }}
      />
    );
  };
}

const CallVolume = asPageWidget(CallVolumeChart, 'sdk-demo-vendor-call-volume');
const SyncQueue = asPageWidget(SyncQueueTable, 'sdk-demo-vendor-sync-queue');
const RecentActivity = asPageWidget(
  RecentActivityWidget,
  'sdk-demo-vendor-recent-activity',
);
const LiveCalls = asPageWidget(LiveCallsWidget, 'sdk-demo-vendor-live-calls');
const ContactsSynced = asPageWidget(
  SyncedContactsStat,
  'sdk-demo-vendor-contacts-synced',
);
const SyncFailures = asPageWidget(
  SyncFailuresStat,
  'sdk-demo-vendor-sync-failures',
);

export default function VendorDashboardPage({ ...marker }: ZoneMarkerProps) {
  const { ui } = useHorizonContext();
  const DashboardTemplate = ui?.templates?.DashboardTemplate;
  const Box = ui?.Box;

  // Carve-out: without the kit there is no page to draw.
  if (!DashboardTemplate || !Box) {
    return (
      <div {...marker} style={{ padding: 24 }}>
        Dashboard template not available
      </div>
    );
  }

  return (
    // `Box`, not a bare div: the marker needs a root to ride on, and the rule
    // against hand-rolled markup carves out inline text semantics, not
    // structural wrappers.
    <Box {...marker}>
      <DashboardTemplate
        title='Example CRM'
        subtitle='Your Example CRM integration at a glance'
        // The host's own window selector, with the platform's pre-canned ranges.
        rangeControl
        widgets={[
          {
            id: 'vendor-call-volume',
            title: 'Call volume',
            description: 'Answered vs missed calls across the selected range.',
            size: 'full',
            height: 4,
            refreshPolicy: 'shared-range',
            metric: {
              formula: 'count(call_events) by bucket, split by disposition',
              source: 'Demo fixture — mocks/widgetActivity.ts',
              cadence: 'On range change',
            },
            component: CallVolume,
          },
          {
            id: 'vendor-contacts-synced',
            title: 'Contacts synced',
            description: 'Reconciled with the CRM in the last 24 hours.',
            size: 'half',
            height: 3,
            component: ContactsSynced,
          },
          {
            id: 'vendor-sync-failures',
            title: 'Sync failures',
            description: 'Rows that exhausted their retries.',
            size: 'half',
            height: 3,
            component: SyncFailures,
          },
          {
            id: 'vendor-sync-queue',
            title: 'CRM sync queue',
            description: 'Contacts waiting to reconcile with the vendor CRM.',
            size: 'half',
            height: 4,
            // Its own timer, so the range control above correctly leaves it
            // alone and it draws no window chip.
            refreshPolicy: 'own-cadence',
            component: SyncQueue,
          },
          {
            id: 'vendor-recent-activity',
            title: 'Recent activity',
            description: 'Recent call activity for the selected range.',
            size: 'half',
            height: 4,
            refreshPolicy: 'shared-range',
            component: RecentActivity,
          },
          {
            id: 'vendor-live-calls',
            title: 'Live call console',
            description: 'Calls in progress, pushed as they ring.',
            size: 'full',
            height: 5,
            refreshPolicy: 'realtime',
            component: LiveCalls,
          },
        ]}
      />
    </Box>
  );
}
