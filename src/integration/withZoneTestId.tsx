/**
 * Tags an injected extension with a stable, machine-locatable marker so the
 * Playwright suite in netsapiens-horizon-testing can assert the SDK mounted it
 * into the right host zone.
 *
 * The marker is a `display: contents` <span>: it carries the `data-testid` /
 * `data-zone` attributes but contributes NO box to layout, so wrapping never
 * disturbs the host's toolbars, flex rows, or grid cells — the child renders
 * exactly as if unwrapped.
 *
 * Because a `display: contents` node has no bounding box, tests assert PRESENCE
 * (`toBeAttached()` / `count > 0`) on the marker — which already proves the
 * remote loaded, registered, matched the route, and mounted into the zone — and
 * assert visibility on the widget's own inner content where needed. The testId
 * strings are defined once in `zones.manifest.json`.
 */
import type { ComponentType } from 'react';

export function withZoneTestId<P extends object>(
  Component: ComponentType<P>,
  testId: string,
  zone?: string,
): ComponentType<P> {
  function ZoneTagged(props: P) {
    return (
      <span style={{ display: 'contents' }} data-testid={testId} data-zone={zone}>
        <Component {...props} />
      </span>
    );
  }
  ZoneTagged.displayName = `withZoneTestId(${Component.displayName || Component.name || 'Component'})`;
  return ZoneTagged;
}
