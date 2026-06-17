/** DemoPage tab: Extension Zones — every zone this demo registers into. */
import type { DemoStyles, DemoTheme } from './styles';
import { ZONES } from '../../content/demoContent';
import { accentColors, subheading } from './styles';

export default function ZonesPanel({ s, themeTokens }: { s: DemoStyles; themeTokens: DemoTheme }) {
  const accents = accentColors(themeTokens);

  return (
    <div style={s.surface.card}>
      <h2 style={{ ...s.text.subheading, marginBottom: themeTokens.spacing.xs }}>
        Extension zones used by this demo
      </h2>
      <p style={{ ...s.text.muted, marginBottom: themeTokens.spacing.lg }}>
        Generic zones the host mounts on its pages. A single registration
        targets a zone plus one or more route patterns — see the Code tab.
      </p>

      {ZONES.map((z, i) => (
        <div
          key={z.zone}
          style={{
            ...s.surface.elevated,
            borderLeft: `4px solid ${accents[i % accents.length]}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <h4 style={subheading(s, themeTokens)}>{z.zone}</h4>
              <p style={{ ...s.text.muted, marginBottom: themeTokens.spacing.xs }}>
                {z.desc}
              </p>
              <p style={{ ...s.text.body, fontStyle: 'italic' }}>
                In this demo: {z.usedFor}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
