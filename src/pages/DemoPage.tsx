/**
 * Horizon SDK Demo — overview & walkthrough page.
 *
 * The single explainer for this demo app: what the Horizon SDK lets a federated
 * app do, the extension zones this app uses, real registration code, and a
 * guided walkthrough of where each surface appears in Horizon.
 *
 * This file is just the tab shell — each tab's content lives in its own panel
 * under `demo/`, and the static content lives in `content/demoContent.ts`.
 * Styled with the host theme tokens (`horizonContext.ui.styles` / `.theme`) so
 * it tracks the host light/dark theme automatically.
 */
import { type ComponentType, type CSSProperties, useState } from 'react';
import { useHorizonContext, VERSION } from '@netsapiens/horizon-sdk';

import CodePanel from './demo/CodePanel';
import OverviewPanel from './demo/OverviewPanel';
import PatternsPanel from './demo/PatternsPanel';
import RemoteAuthPanel from './demo/RemoteAuthPanel';
import { tabStyle } from './demo/styles';
import WalkthroughPanel from './demo/WalkthroughPanel';
import ZonesPanel from './demo/ZonesPanel';

type TabKey =
  | 'overview'
  | 'zones'
  | 'patterns'
  | 'code'
  | 'remote-auth'
  | 'walkthrough';

const TABS: [TabKey, string][] = [
  ['overview', 'Overview'],
  ['zones', 'Extension Zones'],
  ['patterns', 'Route Patterns'],
  ['code', 'Code'],
  ['remote-auth', 'Remote Auth'],
  ['walkthrough', 'Walkthrough'],
];

export default function DemoPage() {
  const horizonContext = useHorizonContext();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // The host UI components are typed loosely (`ComponentType<unknown>`); cast to
  // a props-accepting type so JSX usage type-checks instead of tripping TS2769.
  type UIComponent = ComponentType<Record<string, unknown>>;
  const ui = horizonContext.ui;
  const PageTemplate = ui?.templates?.PageTemplate as UIComponent | undefined;
  const Paper = ui?.Paper as UIComponent | undefined;
  const Stack = ui?.Stack as UIComponent | undefined;
  const Box = ui?.Box as UIComponent | undefined;
  const Typography = ui?.Typography as UIComponent | undefined;
  const s = ui?.styles;
  const themeTokens = ui?.theme;

  if (!PageTemplate || !Paper || !Stack || !Box || !Typography || !s || !themeTokens) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Horizon SDK Demo</h1>
        <p>UI context not available.</p>
      </div>
    );
  }

  return (
    <PageTemplate
      title='Horizon SDK Demo'
      subtitle='One federated app, extending Horizon in every supported way'
      breadcrumbs={[
        { label: 'Apps', url: '/apps' },
        { label: 'Horizon SDK Demo' },
      ]}
    >
      {/* SDK version badge — host ui components, theme palette via sx themeTokens. */}
      <Paper
        variant='outlined'
        sx={{
          p: 2,
          mb: 3,
          borderLeft: '4px solid',
          borderLeftColor: 'success.main',
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <span style={{ fontSize: 20 }}>📦</span>
          <Box>
            <Typography variant='subtitle2' fontWeight={600}>
              Using the published SDK
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              @netsapiens/horizon-sdk@{VERSION} — loaded over Module Federation
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box style={(s.surface as Record<string, CSSProperties>).page}>
        {/* Tabs */}
        <Stack
          direction='row'
          spacing={0.5}
          sx={{
            borderBottom: '2px solid',
            borderColor: 'divider',
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          {TABS.map(([key, label]) => (
            <button
              key={key}
              style={tabStyle(themeTokens, activeTab === key)}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </Stack>

        {activeTab === 'overview' && <OverviewPanel s={s} themeTokens={themeTokens} />}
        {activeTab === 'zones' && <ZonesPanel s={s} themeTokens={themeTokens} />}
        {activeTab === 'patterns' && <PatternsPanel s={s} themeTokens={themeTokens} />}
        {activeTab === 'code' && <CodePanel s={s} themeTokens={themeTokens} />}
        {activeTab === 'remote-auth' && <RemoteAuthPanel s={s} themeTokens={themeTokens} />}
        {activeTab === 'walkthrough' && (
          <WalkthroughPanel s={s} themeTokens={themeTokens} onNavigate={horizonContext.navigate} />
        )}
      </Box>
    </PageTemplate>
  );
}
