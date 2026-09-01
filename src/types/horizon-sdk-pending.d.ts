/**
 * TEMPORARY — delete when `@netsapiens/horizon-sdk` 0.2.11 is published.
 *
 * These members exist in the host today and in the SDK's source, but not in the
 * 0.2.9 package this app builds against. Declaring them here lets the widgets
 * use them now with real types rather than casts; on the release, delete this
 * file and the build tells you if anything actually diverged.
 *
 * The `[key: string]: unknown` index on each component matches the SDK's own
 * `HostComponent` convention — MUI props ride it, so `sx` and friends still pass.
 */
import type { ComponentType } from 'react';

declare module '@netsapiens/horizon-sdk' {
  type ChartTone =
    | 'primary'
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'neutral';

  interface ChartSeries {
    key: string;
    label: string;
    tone?: ChartTone;
  }

  interface HorizonUI {
    Chart?: ComponentType<{
      kind?: 'line' | 'area' | 'bar';
      data: Array<Record<string, unknown>>;
      xKey: string;
      series: ChartSeries[];
      stacked?: boolean;
      showLegend?: boolean;
      height?: number | string;
      [key: string]: unknown;
    }>;
    Donut?: ComponentType<{
      slices: Array<{ label: string; value: number; tone?: ChartTone }>;
      centerLabel?: string;
      height?: number | string;
      [key: string]: unknown;
    }>;
    StatBlock?: ComponentType<{
      value: number | string;
      caption?: string;
      delta?: { pct: number; label?: string };
      spark?: number[];
      tone?: ChartTone;
      [key: string]: unknown;
    }>;
  }

  interface ExtensionContext {
    /** Navigate the host to a path. See the host's useExtensionContext. */
    navigate?: (path: string) => void;
  }
}
