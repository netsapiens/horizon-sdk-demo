/**
 * Sync failures — the second `leafOf: 'demo-insight'` leaf.
 *
 * Registered in `App.tsx` §4. A container with one leaf shows that leaves land
 * in it; a container with two shows the rest of the contract — they reorder
 * within that card and nowhere else, and removing one leaves the container on
 * the grid rather than deleting it.
 *
 * Drawn with `ui.StatBlock` like its neighbour, and reading the same
 * `mocks/syncQueue.ts` fixture the sync queue pages through, so the failing rows
 * in that panel and the count here always agree. Two surfaces disagreeing about
 * one number is the thing a dashboard is least forgiven for.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { CONTACTS_SYNCED_24H, SYNC_FAILURES_24H } from '../mocks/syncQueue';

const FAILURE_RATE = (
  (SYNC_FAILURES_24H / (CONTACTS_SYNCED_24H + SYNC_FAILURES_24H)) *
  100
).toFixed(2);

/** Retry attempts across the window — the shape the failures arrived in. */
const FAILURE_TREND = [0, 1, 0, 2, 1, 0, 1, 2];

export function SyncFailuresStat({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { StatBlock } = context.ui ?? {};

  if (!StatBlock) return <div {...marker}>{SYNC_FAILURES_24H}</div>;

  return (
    <StatBlock
      {...marker}
      value={SYNC_FAILURES_24H}
      caption={`${FAILURE_RATE}% of attempts`}
      spark={FAILURE_TREND}
      // Semantic, not decorative: the host resolves the colour, so this stays
      // right in both colour modes.
      tone={SYNC_FAILURES_24H > 0 ? 'error' : 'success'}
    />
  );
}
