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

/** Every zone this demo registers into. All are mounted by the host. */
export const ZONES: ZoneInfo[] = [
  {
    zone: 'page-header-actions',
    desc: 'Action buttons in the page header.',
    usedFor: 'Export Data button on Call Logs, Contacts, Users & Devices.',
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
    usedFor: '“● Recording” filter on Active Calls.',
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
    usedFor: 'GDPR / consent checkboxes on the Contacts form.',
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
    matches: '/manage/acme/call-logs',
  },
  {
    pattern: '/manage/:domain/contacts',
    kind: 'Named param',
    matches: '/manage/acme/contacts (domain=acme)',
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
    nav: '/manage/contacts',
    badge: 'success',
  },
  {
    label: 'Active Calls',
    desc: 'The “● Recording” filter chip injected beside the host’s status filters.',
    nav: '/manage/active-calls',
    badge: 'warning',
  },
  {
    label: 'CRM Integration',
    desc: 'A full registered page nested under Manage › Call Logs that lists the user’s calls from a live NetSapiens v2 API call and matches each caller to their CRM record.',
    nav: '/manage/call-logs/crm-integration',
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
  parentPath: '/manage/call-logs', // nest under any node — a full path, not just a top-level menu
  path: 'crm-integration',
  label: 'CRM Integration',
  icon: 'mdi:account-sync',
  placement: { last: true },
  component: CrmIntegrationPage,
});`,
  },
  {
    title: 'Inject into a zone (route-pattern targeted)',
    code: `sdk.registerDynamicExtension({
  id: 'demo-export-button',
  zone: 'page-header-actions',
  routes: [
    { pattern: '/manage/call-logs' },
    { pattern: '/manage/*/contacts' },
    { pattern: '/manage/*/users' },
  ],
  priority: 10,
  component: ExportButton,
});`,
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
