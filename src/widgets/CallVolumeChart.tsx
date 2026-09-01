/**
 * Call volume — a `kind: 'panel'` widget in the **charts** category, and the
 * demo's one `chrome: 'self'` widget.
 *
 * Registered in `App.tsx` §4. Three things separate it from the Recent activity
 * panel next door, and each is deliberate:
 *
 * - **`chrome: 'self'`.** The frame draws no title row and no inner padding, and
 *   floats its controls over the content instead. That is the *exception*, not
 *   the pattern to copy: the guide's advice is the default `'host'`, because
 *   reproducing the host's padding and type scale by hand is how a card drifts
 *   from the ones beside it. A plot that has to bleed to the card's edges is the
 *   case where it earns its keep — the heading and the axis strip below are
 *   inset, the bars are not. Note what this file does NOT do: it draws no
 *   `Paper`. The frame is already one, and a second would double the border.
 * - **`category: 'charts'`.** The category picks the catalogue section AND the
 *   loading wireframe — a chart skeleton with axes and a legend, rather than the
 *   generic panel one. It is the cheapest correctness this contract offers.
 * - **`size: { default: 'full', height: 5 }`.** A full-width panel, five rows
 *   tall. `height` also reserves the slot before the code arrives, so the grid
 *   does not reflow when this lands.
 *
 * The bars are read out of `widget.pixel`, which is the honest reason that field
 * exists: the host derives the box from its grid arithmetic and hands it over,
 * so a chart does not need its own ResizeObserver. Charting libraries need the
 * same signal for a blunter reason — ECharts sizes to its container at init and
 * never observes it again.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';
import { useMemo } from 'react';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { buildActivityFeed } from '../mocks/widgetActivity';

const DAY_MS = 24 * 60 * 60 * 1000;

interface Bucket {
  label: string;
  answered: number;
  missed: number;
}

/**
 * How many columns the plot has room for, from the host-supplied box.
 *
 * `pixel` is `{ width: 0, height: 0 }` until the grid's ResizeObserver has
 * measured, hence the floor rather than a bare division.
 */
function bucketsThatFit(pixelWidth: number): number {
  if (pixelWidth <= 0) return 8;
  const COLUMN = 46;
  return Math.max(4, Math.min(12, Math.floor(pixelWidth / COLUMN)));
}

function bucketLabel(at: Date, spanMs: number): string {
  return spanMs > DAY_MS
    ? at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : at.toLocaleTimeString(undefined, { hour: 'numeric' });
}

export function CallVolumeChart({
  context,
  widget,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Box, Chip } = context.ui ?? {};

  // Keyed on the timestamps, not on `widget.range` — the host rebuilds that
  // object every render, so an object dep would rebucket on every paint.
  const from = widget.range?.from;
  const to = widget.range?.to;
  const columns = bucketsThatFit(widget.pixel.width);

  const buckets = useMemo<Bucket[]>(() => {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - DAY_MS);
    const spanMs = Math.max(toDate.getTime() - fromDate.getTime(), 60_000);
    const width = spanMs / columns;

    const empty: Bucket[] = Array.from({ length: columns }, (_, index) => ({
      label: bucketLabel(new Date(fromDate.getTime() + index * width), spanMs),
      answered: 0,
      missed: 0,
    }));

    for (const event of buildActivityFeed(toDate)) {
      const offset = new Date(event.at).getTime() - fromDate.getTime();
      if (offset < 0 || offset > spanMs) continue;
      const slot = Math.min(columns - 1, Math.floor(offset / width));
      if (event.kind === 'missed') empty[slot].missed += 1;
      else empty[slot].answered += 1;
    }

    return empty;
  }, [from, to, columns]);

  // Carve-out: the kit is what supplies every visible element, so with none of
  // it there is nothing to fall back to but uncoloured text.
  if (!Stack || !Typography || !Box) {
    return <div {...marker}>Call volume unavailable</div>;
  }

  const peak = Math.max(1, ...buckets.map((b) => b.answered + b.missed));
  // The plot gets whatever is left after the heading and axis strip. Floored so
  // the bars stay visible on the first paint, before the box has been measured.
  const plotHeight = Math.max(80, widget.pixel.height - 96);

  return (
    // `chrome: 'self'`, so the padding below is this widget's own — the frame
    // adds none. `pr` leaves room for the controls the frame floats top-right.
    <Stack
      {...marker}
      direction='column'
      spacing={1.5}
      sx={{ height: '100%', pt: 3, pb: 2, px: { xs: 3, md: 5 } }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        spacing={1}
        sx={{ pr: 6 }}
      >
        {/* The heading the frame would have drawn from `title`. Owning it is
            the whole cost of `chrome: 'self'` — match the host's h6/700 or the
            card reads as a different kind of card. */}
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          Call volume
        </Typography>
        {Chip ? (
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            <Chip
              size='small'
              color='success'
              variant='outlined'
              label='Answered'
            />
            <Chip
              size='small'
              color='error'
              variant='outlined'
              label='Missed'
            />
          </Stack>
        ) : null}
      </Stack>

      {/* The plot, bled past the heading's inset to the card's edges. */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          mx: { xs: -3, md: -5 },
          px: { xs: 3, md: 5 },
        }}
      >
        {buckets.map((bucket) => {
          const total = bucket.answered + bucket.missed;
          return (
            <Stack
              key={bucket.label}
              direction='column'
              spacing={0.5}
              alignItems='center'
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Typography variant='caption' color='text.secondary'>
                {total || ''}
              </Typography>
              {/* One stacked column: missed sits on top of answered. Heights
                  come from the host's box, which is the point of this widget. */}
              <Box
                sx={{
                  width: '100%',
                  height: (plotHeight * total) / peak,
                  minHeight: total ? 4 : 2,
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  bgcolor: total ? 'transparent' : 'action.hover',
                }}
              >
                <Box
                  sx={{ flexGrow: bucket.answered, bgcolor: 'success.main' }}
                />
                <Box sx={{ flexGrow: bucket.missed, bgcolor: 'error.main' }} />
              </Box>
              <Typography variant='caption' color='text.secondary' noWrap>
                {bucket.label}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    </Stack>
  );
}
