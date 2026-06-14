/**
 * Shared inline-style helpers and types for the DemoPage tab panels. `t` is the
 * host theme tokens and `s` the host style presets, both from
 * `horizonContext.ui` — passed into each panel so they track the host theme.
 */
import type { HorizonContext } from '@netsapiens/horizon-sdk';
import type { CSSProperties } from 'react';

type Ui = NonNullable<HorizonContext['ui']>;
/** Host style presets (surface/text/badge), i.e. `horizonContext.ui.styles`. */
export type DemoStyles = NonNullable<Ui['styles']>;
/** Host theme tokens, i.e. `horizonContext.ui.theme`. */
export type DemoTheme = NonNullable<Ui['theme']>;

/** Tab button styling, with an active (selected) state. */
export function tabStyle(t: DemoTheme, active: boolean): CSSProperties {
  return {
    padding: `${t.spacing.sm} ${t.spacing.lg}`,
    backgroundColor: 'transparent',
    color: active ? t.colors.primary : t.colors.text.secondary,
    border: 'none',
    borderBottom: `3px solid ${active ? t.colors.primary : 'transparent'}`,
    cursor: 'pointer',
    fontSize: t.typography.fontSize.sm,
    fontWeight: active
      ? t.typography.fontWeight.semibold
      : t.typography.fontWeight.medium,
    fontFamily: t.typography.fontFamily.sans,
    transition: 'all 0.2s',
    borderRadius: `${t.borderRadius.sm} ${t.borderRadius.sm} 0 0`,
  };
}

/** Consistent style for the small card/section headings. */
export function subheading(s: DemoStyles, t: DemoTheme): CSSProperties {
  return {
    ...s.text.subheading,
    fontSize: t.typography.fontSize.base,
    fontWeight: t.typography.fontWeight.semibold,
    marginBottom: t.spacing.xs,
  };
}

/** Accent colors cycled through the capability/zone cards. */
export const accentColors = (t: DemoTheme): string[] => [
  t.colors.primary,
  t.colors.success,
  t.colors.warning,
];
