/**
 * Static content for the Horizon SDK Demo overview page (DemoPage). Pure data —
 * the capabilities, extension zones, route patterns, walkthrough cards, and code
 * snippets the page renders. Kept out of the page so the page is just layout.
 */

/** Semantic badge color key — resolved against `styles.badge[...]` at render. */
export type BadgeKey = 'primary' | 'success' | 'warning';

export interface Capability {
  title: string;
  api: string;
  desc: string;
}

/** The capabilities this demo exercises. */
export const CAPABILITIES: Capability[] = [
  {
    title: 'Full-page routes',
    api: 'sdk.registerRoute()',
    desc: 'Add standalone pages to the Apps and Manage menus — e.g. this page and the CRM Integration page.',
  },
  {
    title: 'Dynamic extensions',
    api: 'sdk.registerDynamicExtension()',
    desc: 'Inject components into named zones on existing host pages, targeted by route patterns. No pre-defined extension points.',
  },
  {
    title: 'Dynamic columns',
    api: 'sdk.registerDynamicColumn()',
    desc: 'Add a sortable/filterable column to a host data table, such as the Priority column on Call Logs.',
  },
  {
    title: 'Dashboard widgets',
    api: 'sdk.registerWidget()',
    desc: 'Contribute a card to a host dashboard — a panel on the grid, or a leaf inside the host’s stat container. The host draws the card, the heading and the menu; the app supplies the content.',
  },
  {
    title: 'Call events',
    api: 'sdk.subscribeToCallEvents()',
    desc: 'Subscribe to the live SIP call stream through a capability-gated, app-scoped API to enrich inbound calls.',
  },
  {
    title: 'On-demand side panel',
    api: 'sdk.openSidePanel() / useSidePanel()',
    desc: 'Open Horizon’s shared side panel from anywhere — a row action, a header button, a call handler — with your own React content.',
  },
  {
    title: 'Themed UI kit',
    api: 'horizonContext.ui',
    desc: 'Build with the host’s MUI Aurora components and templates so extensions match Horizon in light and dark mode.',
  },
  {
    title: 'Gated API access',
    api: 'horizonContext.api',
    desc: 'Call the NetSapiens v2 API through an authenticated proxy that enforces per-capability and per-resource access.',
  },
];

export interface ZoneInfo {
  zone: string;
  desc: string;
  usedFor: string;
}

/**
 * Every zone this demo registers into. All are mounted by the host.
 *
 * The last two are **dashboard widget** zones, which behave differently from the
 * rest: a widget zone names a dashboard rather than a slot on a page, takes no
 * route patterns, and the widget appears in that dashboard's Customize catalogue
 * for the user to add rather than mounting itself.
 */
export const ZONES: ZoneInfo[] = [
  {
    zone: 'page-header-actions',
    desc: 'Action buttons in the page header.',
    usedFor:
      'Export data button on Call Logs, Contacts, Users & Devices — declared via `actions`, rendered by the host.',
  },
  {
    zone: 'page-header-secondary',
    desc: 'Badges / status beside the page title.',
    usedFor: '“● Live” status badge on Call Logs.',
  },
  {
    zone: 'page-content-after',
    desc: 'Content below the main page body.',
    usedFor: 'Call analytics summary widget on Call Logs.',
  },
  {
    zone: 'table-toolbar',
    desc: 'The toolbar row above a data table.',
    usedFor: 'Triage tips button on Call Logs.',
  },
  {
    zone: 'table-filter-bar',
    desc: 'Filter chips alongside the host’s status filters.',
    usedFor:
      '“● Recording / ⏸ On hold / ☎ In queue” filters on Active Calls.',
  },
  {
    zone: 'table-row-actions',
    desc: 'Per-row action buttons in a table.',
    usedFor:
      'Quick action on Call Logs rows → opens a Call details side panel.',
  },
  {
    zone: 'call-logs-columns (dynamic column)',
    desc: 'A registered column merged into a host table.',
    usedFor: 'Priority column on the Call Logs table.',
  },
  {
    zone: 'form-section-before',
    desc: 'Above a form’s field sections.',
    usedFor: 'CRM context banner on the Contacts add/edit form.',
  },
  {
    zone: 'form-section-after',
    desc: 'Below a form’s fields, before the actions.',
    usedFor: 'Consent / opt-in checkboxes on the Contacts form.',
  },
  {
    zone: 'inbound-call-content',
    desc: 'Inside the inbound-call widget.',
    usedFor: 'Enriched caller info card on ringing calls.',
  },
  {
    zone: 'topbar-actions',
    desc: 'The global top app bar (every page).',
    usedFor: 'Help button → opens the Quick Links side panel.',
  },
  {
    zone: 'platform-admin-dashboard-widgets',
    desc: 'The Platform admin dashboard. A widget zone: it names a dashboard, not a slot on a page.',
    usedFor:
      'Recent activity (a panel on the grid) and Recordings processed (a leaf inside the host’s stat card). Add either from Customize.',
  },
  {
    zone: 'manage-dashboard-widgets',
    desc: 'The Manage dashboard. Listing a second zone offers the same widget on a second dashboard.',
    usedFor:
      'Recent activity again — the user still adds it separately here, and its placement anchor does not exist on this dashboard, so it lands at the end.',
  },
];

export interface PatternInfo {
  pattern: string;
  kind: string;
  matches: string;
}

export const PATTERNS: PatternInfo[] = [
  {
    pattern: '/manage/call-logs',
    kind: 'Exact path',
    matches: 'Only /manage/call-logs',
  },
  {
    pattern: '/manage/*/call-logs',
    kind: 'Wildcard segment',
    matches: '/manage/example/call-logs',
  },
  {
    pattern: '/manage/:domain/contacts',
    kind: 'Named param',
    matches: '/manage/example/contacts (domain=example)',
  },
  { pattern: '/manage/*', kind: 'Prefix', matches: 'Any page under /manage' },
  { pattern: '/*', kind: 'Global', matches: 'Every page — use sparingly' },
];

export interface WalkthroughItem {
  label: string;
  desc: string;
  nav: string;
  badge: BadgeKey;
}

export const WALKTHROUGH: WalkthroughItem[] = [
  {
    label: 'Call Logs',
    desc: 'Export button, Priority column, “● Live” badge, analytics widget, toolbar tips, and a row quick-action that opens a Call details side panel.',
    nav: '/manage/call-logs',
    badge: 'primary',
  },
  {
    label: 'Contacts',
    desc: 'Open the add/edit contact drawer to see the CRM banner and the consent checkboxes injected into the form.',
    nav: '/home/contacts',
    badge: 'success',
  },
  {
    label: 'Active Calls',
    desc: 'Recording / On hold / In queue filter chips injected beside the host’s status filters.',
    nav: '/manage/active-calls',
    badge: 'warning',
  },
  {
    label: 'CRM Integration',
    desc: 'A full registered page in the Manage menu that lists the user’s calls from a live NetSapiens v2 API call and matches each caller to their CRM record.',
    nav: '/manage/crm-integration',
    badge: 'primary',
  },
  {
    label: 'Component Showcase',
    desc: 'A reference page rendering every shared MUI Aurora component available via horizonContext.ui.',
    nav: '/apps/component-showcase',
    badge: 'success',
  },
];

export interface CodeExample {
  title: string;
  code: string;
}

/** The registration snippets shown on the Code tab. */
export const CODE_EXAMPLES: CodeExample[] = [
  {
    title: 'Register a full page',
    code: `sdk.registerRoute({
  id: 'ucaas-crm-integration',
  parentPath: '/manage', // extend the Manage menu, not just /apps
  path: 'crm-integration',
  label: 'CRM Integration',
  icon: 'mdi:account-sync',
  placement: { after: 'call-logs' },
  component: CrmIntegrationPage,
});`,
  },
  {
    title: 'Contribute a header button (declare the intent, not the styling)',
    code: `// Say what the button IS. The host renders it exactly as it renders its
// own header buttons, so it cannot drift from the page it sits on.
// 'secondary' is the default; 'primary' and 'danger' are the other intents.
sdk.registerDynamicExtension({
  id: 'demo-export-button',
  zone: 'page-header-actions',
  routes: [
    { pattern: '/manage/call-logs' },
    { pattern: '/manage/*/contacts' },
    { pattern: '/manage/*/users' },
  ],
  priority: 10,
  actions: [
    {
      id: 'export-data',
      label: 'Export data',
      icon: 'material-symbols:download',
      intent: 'secondary',
      // Page state arrives at click time. On a table page the host publishes
      // rows / selectedRows, so an action can work on the user's selection.
      onClick: ({ pageContext, route }) => {
        const { rows, selectedRows } = pageContext ?? {};
        exportRows(selectedRows?.length ? selectedRows : rows, route);
      },
    },
    // Several buttons from one registration: add an entry. Several apps in one
    // zone: the host orders by priority, then array order.
  ],
});

// Prefer 'actions' for page-header-actions, table-toolbar and topbar-actions.
// Use 'component' for anything that is not a button — badges, banners, widgets.`,
  },
  {
    title: 'Add a table column',
    code: `sdk.registerDynamicColumn({
  id: 'demo-call-priority-column',
  zone: 'call-logs-columns',
  routes: [{ pattern: '/manage/*/call-logs' }],
  column: {
    field: 'call-priority',
    headerName: 'Priority',
    sortable: true,
    renderCell: (params) => <CallPriorityCell params={params} />,
  },
});`,
  },
  {
    title: 'Contribute a dashboard widget',
    code: `// A PANEL — its own card on the dashboard grid.
sdk.registerWidget({
  // A plain name. The host stamps the app prefix, so this is stored as
  // 'horizon-extension-demo:recent-activity' — and that stored id is what
  // lands in every saved layout, so it cannot be renamed later.
  id: 'recent-activity',
  kind: 'panel',
  // Literal zone strings, written out. Never widgetZoneFor(surface): bundle
  // verification extracts string literals, and a helper call extracts as
  // nothing — the zone could then never be attributed to your app.
  zones: ['platform-admin-dashboard-widgets', 'manage-dashboard-widgets'],
  title: 'Recent activity',
  icon: 'mdi:pulse',
  category: 'activity',        // catalogue section + loading wireframe shape
  size: { default: 'half' },   // panels only
  placement: { after: 'health' },
  refreshPolicy: 'shared-range', // → widget.range arrives as from/to timestamps
  requiredScopes: 'ADMINS',      // narrows only; intersected with the floor
  component: RecentActivityWidget,
  // No 'chrome': it defaults to 'host', and the frame draws the card, the
  // title, the padding and the menu. Your component draws none of them.
});

// A LEAF — a block INSIDE the host's stat container, not a card of its own.
sdk.registerWidget({
  id: 'recorded-calls',
  kind: 'leaf',
  leafOf: 'stat',              // the container category it belongs in
  zones: ['platform-admin-dashboard-widgets'],
  title: 'Recordings processed',
  category: 'stats',
  component: RecordedCallsStat, // no size, and widget.pixel is 0×0 for a leaf
});

// Your component receives { context, widget, actions }:
function RecentActivityWidget({ context, widget, actions }) {
  const { Stack, Typography } = context.ui;      // no MUI in a remote app
  const { from, to } = widget.range ?? {};       // resolved timestamps
  const { width, height } = widget.pixel;        // host-derived box
  return <Stack>…</Stack>;                       // content only, no card
}

// On unmount. Same plain name — the host resolves the prefix.
sdk.unregisterWidget('recent-activity');`,
  },
  {
    title: 'Subscribe to live call events',
    code: `// Capability-gated: declares 'call-events:subscribe'
const unsubscribe = sdk.subscribeToCallEvents(
  ['call-started', 'call-answered', 'call-missed', 'call-ended'],
  (event) => enrichAndBroadcast(event),
);`,
  },
  {
    title: 'Open the side panel from anywhere',
    code: `// From any extension component (row action, header button, …):
const { open } = useSidePanel(context.eventBus);

open({
  title: 'Call details',
  width: 'sm',
  component: CallDetailsPanel,   // your React content
});

// CallDetailsPanel receives { context, close }
function CallDetailsPanel({ context, close }) {
  const { Stack, Typography, Button } = context.ui;
  return <Stack>…<Button onClick={close}>Close</Button></Stack>;
}`,
  },
];
