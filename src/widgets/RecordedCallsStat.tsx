/**
 * Recordings processed — a `kind: 'leaf'` dashboard widget.
 *
 * Registered in `App.tsx` §4 with `leafOf: 'stat'`, which puts it **inside** the
 * host's existing stat container on the dashboard, alongside the native stat
 * blocks, rather than making it a card of its own. It is the half of the
 * contract that is easy to miss: an app can contribute into a host container and
 * reorder within it, not only add top-level panels.
 *
 * What a leaf does *not* get, and why this file is so short:
 *
 * - **No size.** `size` is panels only. A leaf's width is its container's grid
 *   to decide, so the registration declares none and there is no resize control.
 * - **No box.** `widget.pixel` is `{ width: 0, height: 0 }` for a leaf — nothing
 *   here reads it, because there is nothing true to read. (The panel next door
 *   uses it; that is the difference between the two kinds in one line.)
 * - **No chrome.** The host's leaf frame draws the surface, the heading from the
 *   registration's `title` and the overflow menu. A leaf supplies a value.
 *
 * The number is the same `SAMPLE_CALL_RECORDINGS` fixture the Call Recordings
 * page lists, so the dashboard stat and the page agree — which is what a real
 * widget-plus-page pairing looks like.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { SAMPLE_CALL_RECORDINGS } from '../mocks/callRecordings';

// Derived once at module load: the fixture is static, so recomputing it per
// render would be work with no chance of a different answer.
const TOTAL = SAMPLE_CALL_RECORDINGS.length;
const PROCESSED = SAMPLE_CALL_RECORDINGS.filter(
  (recording) => recording.status === 'Processed',
).length;
const FAILED = SAMPLE_CALL_RECORDINGS.filter(
  (recording) => recording.status === 'Failed',
).length;

export function RecordedCallsStat({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Chip } = context.ui ?? {};

  // Carve-out: with no kit there is nothing to render but the number itself.
  if (!Stack || !Typography) return <div {...marker}>{PROCESSED}</div>;

  return (
    // No heading here — the leaf frame already drew "Recordings processed" from
    // the registration's `title`, which is what makes this sit in the stat panel
    // looking like the blocks beside it.
    <Stack {...marker} direction='column' spacing={1}>
      <Typography variant='h4' fontWeight={600}>
        {PROCESSED}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        of {TOTAL} recordings in the last 24 hours
      </Typography>
      {Chip ? (
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Chip
            size='small'
            variant='outlined'
            color={FAILED > 0 ? 'warning' : 'success'}
            label={`${FAILED} failed`}
          />
          <Chip size='small' variant='outlined' label='From a remote app' />
        </Stack>
      ) : null}
    </Stack>
  );
}
