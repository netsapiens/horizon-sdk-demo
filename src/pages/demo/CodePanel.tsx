/** DemoPage tab: Code — the registration snippets this demo uses. */
import type { DemoStyles, DemoTheme } from './styles';
import { CODE_EXAMPLES } from '../../content/demoContent';
import { subheading } from './styles';

export default function CodePanel({ s, t }: { s: DemoStyles; t: DemoTheme }) {
  return (
    <div style={s.surface.card}>
      <h2 style={{ ...s.text.subheading, marginBottom: t.spacing.lg }}>
        How this demo registers
      </h2>

      {CODE_EXAMPLES.map((example, i) => (
        <div key={example.title}>
          <h4 style={subheading(s, t)}>{example.title}</h4>
          <pre
            style={
              i < CODE_EXAMPLES.length - 1
                ? { ...s.surface.code, marginBottom: t.spacing.lg }
                : s.surface.code
            }
          >
            {example.code}
          </pre>
        </div>
      ))}
    </div>
  );
}
