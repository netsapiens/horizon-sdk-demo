/**
 * Card declarations for the Example CRM page (`pages/VendorDashboardPage.tsx`).
 *
 * Kept out of the page for the same reason `demoContent.ts` is: a page file is
 * layout, and everything here is copy plus the layout facts the host needs —
 * title, subtitle, span, reserved height, which cards follow the shared range,
 * and where a number came from. The page pairs each entry with its component by
 * id and passes the list straight to `templates.DashboardTemplate`.
 *
 * Everything in this file is a DECLARATION. There is not a colour, a font size
 * or a padding value anywhere in it, because none of those are an app's to
 * choose — the host draws the card from exactly these fields.
 */

/** One card, minus its component. `VendorDashboardPage` supplies that. */
export interface VendorDashboardCard {
  id: string;
  title: string;
  description: string;
  size: 'half' | 'full';
  /** Reserved height in grid row units. */
  height: number;
  refreshPolicy?: 'shared-range' | 'realtime' | 'own-cadence';
  metric?: {
    formula?: string;
    source?: string;
    cadence?: string;
    delay?: string;
  };
}

/**
 * The page's layout, in reading order.
 *
 * Ordered the way a dashboard is read rather than by widget kind: the headline
 * chart, then the two figures it raises questions about, then the detail behind
 * them, then the live board.
 */
export const VENDOR_DASHBOARD_CARDS: VendorDashboardCard[] = [
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
  },
  {
    id: 'vendor-contacts-synced',
    title: 'Contacts synced',
    description: 'Reconciled with the CRM in the last 24 hours.',
    size: 'half',
    height: 3,
  },
  {
    id: 'vendor-sync-failures',
    title: 'Sync failures',
    description: 'Rows that exhausted their retries.',
    size: 'half',
    height: 3,
  },
  {
    id: 'vendor-sync-outcomes',
    title: 'Sync outcomes',
    description: 'How the queue is currently distributed.',
    size: 'half',
    height: 4,
    metric: {
      formula: 'count(queue_rows) grouped by state',
      source: 'Demo fixture — mocks/syncQueue.ts',
      cadence: 'Snapshot',
    },
  },
  {
    // Paired with the donut deliberately. A row is as tall as its tallest card,
    // so two cards of the same declared height sit level; putting the datagrid
    // here instead dragged the ring to 1016px for a shape that needs 400.
    id: 'vendor-recent-activity',
    title: 'Recent activity',
    description: 'Recent call activity for the selected range.',
    size: 'half',
    height: 4,
    refreshPolicy: 'shared-range',
  },
  {
    // Full width and alone on its row: a table with ten rows, a toolbar and a
    // pagination footer wants the space, and nothing should have to match it.
    id: 'vendor-sync-queue',
    title: 'CRM sync queue',
    description: 'Contacts waiting to reconcile with the vendor CRM.',
    size: 'full',
    height: 6,
    // Its own timer, so the page's range control correctly leaves it alone and
    // the frame draws it no window chip.
    refreshPolicy: 'own-cadence',
  },
  {
    id: 'vendor-live-calls',
    title: 'Live call console',
    description: 'Calls in progress, pushed as they ring.',
    size: 'full',
    height: 5,
    refreshPolicy: 'realtime',
  },
];
