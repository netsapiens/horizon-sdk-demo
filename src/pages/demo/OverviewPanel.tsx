/** DemoPage tab: Overview — what the SDK does + capability cards. */
import type { DemoStyles, DemoTheme } from './styles';
import { CAPABILITIES } from '../../content/demoContent';
import { accentColors, subheading } from './styles';

export default function OverviewPanel({
  s,
  themeTokens,
}: {
  s: DemoStyles;
  themeTokens: DemoTheme;
}) {
  const accents = accentColors(themeTokens);

  return (
    <>
      <div style={s.surface.card}>
        <h2 style={{ ...s.text.subheading, marginBottom: themeTokens.spacing.md }}>
          What the Horizon SDK does
        </h2>
        <p style={{ ...s.text.body, marginBottom: themeTokens.spacing.md }}>
          The Horizon SDK lets a separately-deployed (federated) application
          extend the Horizon UI without changing core platform code. It
          registers pages, injects components into existing pages by zone and
          route pattern, adds table columns, subscribes to live call events, and
          renders with the host’s themed component kit. Everything on the other
          tabs is registered by <strong>this</strong> demo app.
        </p>
      </div>

      <div style={s.surface.card}>
        <h2 style={{ ...s.text.subheading, marginBottom: themeTokens.spacing.md }}>
          Capabilities
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: themeTokens.spacing.md,
          }}
        >
          {CAPABILITIES.map((c, i) => (
            <div
              key={c.title}
              style={{
                ...s.surface.elevated,
                borderLeft: `4px solid ${accents[i % accents.length]}`,
              }}
            >
              <h4 style={subheading(s, themeTokens)}>{c.title}</h4>
              <p style={{ ...s.text.muted, marginBottom: themeTokens.spacing.sm }}>
                {c.desc}
              </p>
              <span style={s.badge.primary}>{c.api}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
