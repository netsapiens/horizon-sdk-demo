/**
 * Shared inline-style helpers and types for the DemoPage tab panels. `themeTokens` is the
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
export function tabStyle(themeTokens: DemoTheme, active: boolean): CSSProperties {
  return {
    padding: `${themeTokens.spacing.sm} ${themeTokens.spacing.lg}`,
    backgroundColor: 'transparent',
    color: active ? themeTokens.colors.primary : themeTokens.colors.text.secondary,
    border: 'none',
    borderBottom: `3px solid ${active ? themeTokens.colors.primary : 'transparent'}`,
    cursor: 'pointer',
    fontSize: themeTokens.typography.fontSize.sm,
    fontWeight: active
      ? themeTokens.typography.fontWeight.semibold
      : themeTokens.typography.fontWeight.medium,
    fontFamily: themeTokens.typography.fontFamily.sans,
    transition: 'all 0.2s',
    borderRadius: `${themeTokens.borderRadius.sm} ${themeTokens.borderRadius.sm} 0 0`,
  };
}

/** Consistent style for the small card/section headings. */
export function subheading(s: DemoStyles, themeTokens: DemoTheme): CSSProperties {
  return {
    ...s.text.subheading,
    fontSize: themeTokens.typography.fontSize.base,
    fontWeight: themeTokens.typography.fontWeight.semibold,
    marginBottom: themeTokens.spacing.xs,
  };
}

/** Accent colors cycled through the capability/zone cards. */
export const accentColors = (themeTokens: DemoTheme): string[] => [
  themeTokens.colors.primary,
  themeTokens.colors.success,
  themeTokens.colors.warning,
];
