/** DemoPage tab: Route Patterns — how extensions target host pages. */
import type { DemoStyles, DemoTheme } from './styles';
import { PATTERNS } from '../../content/demoContent';

export default function PatternsPanel({
  s,
  t,
}: {
  s: DemoStyles;
  t: DemoTheme;
}) {
  return (
    <div style={s.surface.card}>
      <h2 style={{ ...s.text.subheading, marginBottom: t.spacing.md }}>
        Route pattern matching
      </h2>
      <p style={{ ...s.text.muted, marginBottom: t.spacing.lg }}>
        Each extension lists the routes it applies to. Patterns support
        wildcards, named params, prefixes, and a global match — so one
        registration can target many pages.
      </p>

      <div style={s.surface.elevated}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', ...s.text.body }}
        >
          <thead>
            <tr style={{ borderBottom: `2px solid ${t.colors.border.light}` }}>
              <th style={{ textAlign: 'left', padding: t.spacing.sm }}>
                Pattern
              </th>
              <th style={{ textAlign: 'left', padding: t.spacing.sm }}>Type</th>
              <th style={{ textAlign: 'left', padding: t.spacing.sm }}>
                Example match
              </th>
            </tr>
          </thead>
          <tbody>
            {PATTERNS.map((p) => (
              <tr
                key={p.pattern}
                style={{ borderBottom: `1px solid ${t.colors.border.light}` }}
              >
                <td style={{ padding: t.spacing.sm }}>
                  <code>{p.pattern}</code>
                </td>
                <td style={{ padding: t.spacing.sm }}>{p.kind}</td>
                <td style={{ padding: t.spacing.sm, ...s.text.muted }}>
                  {p.matches}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
