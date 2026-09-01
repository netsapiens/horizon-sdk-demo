/**
 * Contacts synced — a `kind: 'leaf'` widget with `leafOf: 'demo-insight'`.
 *
 * Registered in `App.tsx` §4. The difference from `RecordedCallsStat.tsx` is
 * only where it lands: that leaf declares `leafOf: 'stat'` and drops into the
 * **host's** stat card, this one declares the demo's own category and drops into
 * `IntegrationHealthPanel.tsx`, the container this app ships. The component is
 * written identically either way — a leaf supplies a value, and its container
 * owns the frame, the heading and the width.
 *
 * The mini bar row under the value is here because the native stat blocks carry
 * a sparkline: a leaf sitting among them should read like one of them, and that
 * is a cheaper way to say so than a chart library in a card this size.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { CONTACTS_SYNCED_24H, SYNC_TREND_24H } from '../mocks/syncQueue';

const PEAK = Math.max(...SYNC_TREND_24H);

export function SyncedContactsStat({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Box } = context.ui ?? {};

  // Carve-out: with no kit there is nothing to render but the number.
  if (!Stack || !Typography) {
    return <div {...marker}>{CONTACTS_SYNCED_24H}</div>;
  }

  return (
    // No heading — the container's leaf frame drew "Contacts synced" from the
    // registration's `title`. A leaf has no box of its own either: `widget.pixel`
    // is `{ width: 0, height: 0 }`, so nothing here reads it.
    <Stack {...marker} direction='column' spacing={0.75}>
      <Typography variant='h4' fontWeight={600}>
        {CONTACTS_SYNCED_24H.toLocaleString()}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        contacts reconciled in the last 24 hours
      </Typography>
      {Box ? (
        <Stack
          direction='row'
          spacing={0.25}
          alignItems='flex-end'
          sx={{ height: 24 }}
        >
          {SYNC_TREND_24H.map((value, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: `${(value / PEAK) * 100}%`,
                borderRadius: 0.5,
                bgcolor: 'primary.main',
                opacity: 0.35 + (0.65 * value) / PEAK,
              }}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
