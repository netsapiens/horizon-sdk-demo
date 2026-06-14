/** DemoPage tab: Walkthrough — jump to each surface in the host. */
import type { DemoStyles, DemoTheme } from './styles';
import { WALKTHROUGH } from '../../content/demoContent';
import { subheading } from './styles';

interface WalkthroughPanelProps {
  s: DemoStyles;
  t: DemoTheme;
  onNavigate?: (path: string) => void;
}

export default function WalkthroughPanel({
  s,
  t,
  onNavigate,
}: WalkthroughPanelProps) {
  return (
    <div style={s.surface.card}>
      <h2 style={{ ...s.text.subheading, marginBottom: t.spacing.xs }}>
        See it in action
      </h2>
      <p style={{ ...s.text.muted, marginBottom: t.spacing.md }}>
        This app registers{' '}
        <strong>3 pages, 10 zone extensions, and 1 table column</strong>, plus a
        live call-event subscription and an on-demand side panel. Jump to each
        surface:
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: t.spacing.md,
        }}
      >
        {WALKTHROUGH.map((item) => (
          <div key={item.label} style={s.surface.elevated}>
            <h4 style={subheading(s, t)}>{item.label}</h4>
            <p style={{ ...s.text.muted, marginBottom: t.spacing.sm }}>
              {item.desc}
            </p>
            <button
              onClick={() => onNavigate?.(item.nav)}
              style={{
                padding: `${t.spacing.xs} ${t.spacing.md}`,
                backgroundColor: t.colors.primary,
                color: t.colors.text.inverse,
                border: 'none',
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
              }}
            >
              Go to {item.label} →
            </button>
          </div>
        ))}
      </div>

      <div style={{ ...s.surface.elevated, marginTop: t.spacing.lg }}>
        <h4 style={subheading(s, t)}>Everywhere</h4>
        <p style={{ ...s.text.muted }}>
          The Help button sits in the global top bar on every page and opens the
          shared side panel; an enriched caller card appears in the inbound-call
          widget whenever a call rings in.
        </p>
      </div>
    </div>
  );
}
