/**
 * Tags an injected extension with a stable, machine-locatable marker so the
 * Playwright suite in netsapiens-horizon-testing can assert the SDK mounted it
 * into the right host zone.
 *
 * The marker rides on the wrapped component's OWN root element: this HOC injects
 * `data-testid` / `data-zone` as props, and each extension component spreads
 * them onto its root (host UI components forward `data-*` to their root DOM
 * node). There is no wrapper element, so layout is untouched AND the marker sits
 * on a real box — a normal DevTools hover highlight, and tests can assert
 * visibility. A component that renders `null` (an inactive zone) simply has no
 * marker, which is the accurate signal.
 *
 * The testId strings are defined once in `zones.manifest.json`.
 */
import type { ComponentType } from 'react';

/** data-* attributes the SDK test suite locates zones by. */
export interface ZoneMarkerProps {
  'data-testid'?: string;
  'data-zone'?: string;
}

export function withZoneTestId<P extends object>(
  Component: ComponentType<P & ZoneMarkerProps>,
  testId: string,
  zone?: string,
): ComponentType<P> {
  function ZoneTagged(props: P) {
    return <Component {...props} data-testid={testId} data-zone={zone} />;
  }
  ZoneTagged.displayName = `withZoneTestId(${Component.displayName || Component.name || 'Component'})`;
  return ZoneTagged;
}
