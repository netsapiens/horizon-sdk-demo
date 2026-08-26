/**
 * Accent colors cycled through the capability / zone cards on DemoPage.
 *
 * These are MUI palette **paths**, not resolved colors. `sx` looks each one up
 * in the host's live theme at render time, so an accent flips with the host
 * light/dark toggle. Reading `ui.theme.colors.*` here instead would bake in
 * whichever mode was active when the page first mounted — see CLAUDE.md,
 * "Never hand-roll UI".
 */
export const ACCENT_COLORS = ['primary.main', 'success.main', 'warning.main'];

/** The accent for card `index`, cycling through {@link ACCENT_COLORS}. */
export function accentAt(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}
