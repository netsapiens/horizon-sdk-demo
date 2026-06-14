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
import { useState } from 'react';
import { useHorizonContext, VERSION } from '@netsapiens/horizon-sdk';

import CodePanel from './demo/CodePanel';
import OverviewPanel from './demo/OverviewPanel';
import PatternsPanel from './demo/PatternsPanel';
import { tabStyle } from './demo/styles';
import WalkthroughPanel from './demo/WalkthroughPanel';
import ZonesPanel from './demo/ZonesPanel';

type TabKey = 'overview' | 'zones' | 'patterns' | 'code' | 'walkthrough';

const TABS: [TabKey, string][] = [
  ['overview', 'Overview'],
  ['zones', 'Extension Zones'],
  ['patterns', 'Route Patterns'],
  ['code', 'Code'],
  ['walkthrough', 'Walkthrough'],
];

export default function DemoPage() {
  const horizonContext = useHorizonContext();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { PageTemplate } = horizonContext.ui?.templates || {};
  const s = horizonContext.ui?.styles;
  const t = horizonContext.ui?.theme;

  if (!PageTemplate || !s || !t) {
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
      {/* SDK version badge */}
      <div
        style={{
          padding: t.spacing.md,
          backgroundColor: t.colors.success + '15',
          borderLeft: `4px solid ${t.colors.success}`,
          marginBottom: t.spacing.lg,
          borderRadius: t.borderRadius.md,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: t.spacing.sm }}
        >
          <span style={{ fontSize: '20px' }}>📦</span>
          <div>
            <strong style={{ color: t.colors.text.primary }}>
              Using the published SDK
            </strong>
            <div
              style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.secondary,
              }}
            >
              @netsapiens/horizon-sdk@{VERSION} — loaded over Module Federation
            </div>
          </div>
        </div>
      </div>

      <div style={s.surface.page}>
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: t.spacing.xs,
            borderBottom: `2px solid ${t.colors.border.light}`,
            marginBottom: t.spacing.lg,
            flexWrap: 'wrap',
          }}
        >
          {TABS.map(([key, label]) => (
            <button
              key={key}
              style={tabStyle(t, activeTab === key)}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewPanel s={s} t={t} />}
        {activeTab === 'zones' && <ZonesPanel s={s} t={t} />}
        {activeTab === 'patterns' && <PatternsPanel s={s} t={t} />}
        {activeTab === 'code' && <CodePanel s={s} t={t} />}
        {activeTab === 'walkthrough' && (
          <WalkthroughPanel s={s} t={t} onNavigate={horizonContext.navigate} />
        )}
      </div>
    </PageTemplate>
  );
}
