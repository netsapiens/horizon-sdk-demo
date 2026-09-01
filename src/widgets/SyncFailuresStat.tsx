/**
 * Sync failures — the second `leafOf: 'demo-insight'` leaf.
 *
 * Registered in `App.tsx` §4. A container with one leaf demonstrates that
 * leaves land in it; a container with two demonstrates the rest of the contract
 * — they reorder *within* this card and nowhere else, and removing one leaves
 * the container on the grid rather than deleting it.
 *
 * It reads the same `mocks/syncQueue.ts` fixture the Sync queue table pages
 * through, so the failing rows in that panel and the count here agree. Two
 * surfaces disagreeing about one number is the thing a dashboard is least
 * forgiven for.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { CONTACTS_SYNCED_24H, SYNC_FAILURES_24H } from '../mocks/syncQueue';

const FAILURE_RATE = (
  (SYNC_FAILURES_24H / (CONTACTS_SYNCED_24H + SYNC_FAILURES_24H)) *
  100
).toFixed(2);

export function SyncFailuresStat({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Chip } = context.ui ?? {};

  // Carve-out: with no kit there is nothing to render but the number.
  if (!Stack || !Typography) {
    return <div {...marker}>{SYNC_FAILURES_24H}</div>;
  }

  return (
    <Stack {...marker} direction='column' spacing={0.75}>
      <Typography
        variant='h4'
        fontWeight={600}
        color={SYNC_FAILURES_24H > 0 ? 'error.main' : 'text.primary'}
      >
        {SYNC_FAILURES_24H}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        rows that exhausted their retries
      </Typography>
      {Chip ? (
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Chip
            size='small'
            variant='outlined'
            color={SYNC_FAILURES_24H > 0 ? 'warning' : 'success'}
            label={`${FAILURE_RATE}% failure rate`}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
