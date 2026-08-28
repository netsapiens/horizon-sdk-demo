/**
 * Recent Activity — a `kind: 'panel'` dashboard widget.
 *
 * Registered in `App.tsx` §4. This file is the **content of a card, not the
 * card**: `chrome` defaults to `'host'`, so the frame around this draws the
 * card surface, the title row from the registration's `title`, the inner
 * padding and the overflow menu. Drawing any of those here is what gets a
 * widget two titles and a double inset — the one mistake the guide calls out by
 * name. There is no `<Paper>`, no heading and no `p:` in this file, and that is
 * the point.
 *
 * It shows the three inputs a panel is handed:
 *
 * - **`widget.range`** — the dashboard's resolved from/to window, because the
 *   registration declares `refreshPolicy: 'shared-range'`. Always timestamps,
 *   never a preset label like "Last 7 days", so there is nothing to parse. The
 *   feed is filtered by it: change the dashboard's range and the list changes.
 * - **`widget.pixel`** — the card's box, derived by the host from the grid
 *   arithmetic rather than measured here. Used below to decide how many rows
 *   fit and whether there is room for the party column. A chart needs this
 *   signal for a different reason: ECharts sizes to its container at init and
 *   does not observe container resize.
 * - **`actions`** — `resize()` and `remove()`, the same entries the frame's
 *   menu offers, called from the content to show a widget can drive them itself
 *   (an inline control, or an empty state that offers to take itself away).
 *
 * `actions.refresh()` is in the contract and is deliberately **not** called
 * here: against the host as it stands the grid passes a no-op for it and the
 * frame's menu never offers Refresh, so a button wired to it would look like a
 * demonstration and do nothing.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';
import { useMemo } from 'react';

import type { ActivityKind } from '../mocks/widgetActivity';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { buildActivityFeed } from '../mocks/widgetActivity';

/** Row dot colour + label per kind. Palette paths, so both follow the theme toggle. */
const KIND_META: Record<ActivityKind, { label: string; color: string }> = {
  answered: { label: 'Answered', color: 'success.main' },
  missed: { label: 'Missed', color: 'error.main' },
  voicemail: { label: 'Voicemail', color: 'warning.main' },
  transferred: { label: 'Transferred', color: 'info.main' },
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many rows the card has room for, from the host-supplied box.
 *
 * `pixel` is `{ width: 0, height: 0 }` on the first paint, before the grid's
 * ResizeObserver has measured — hence the floor rather than a bare division.
 */
function rowsThatFit(pixelHeight: number): number {
  if (pixelHeight <= 0) return 5;
  const CHROME = 150; // summary chips + footer, inside the frame's own padding
  const ROW = 34;
  return Math.max(2, Math.min(9, Math.floor((pixelHeight - CHROME) / ROW)));
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function RecentActivityWidget({
  context,
  widget,
  actions,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Chip, Box, Button, Divider } = context.ui ?? {};

  // Keyed on the two timestamps rather than on `widget.range` itself: the host
  // rebuilds that object every render, so an object dep would recompute the feed
  // on every paint while a change of window is what actually matters.
  const from = widget.range?.from;
  const to = widget.range?.to;

  const { events, windowLabel } = useMemo(() => {
    // A dashboard on the shared range always resolves a window; this fallback
    // covers the first paint, and a host that has not sent one.
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - DAY_MS);

    const filtered = buildActivityFeed(toDate).filter((event) => {
      const at = new Date(event.at).getTime();
      return at >= fromDate.getTime() && at <= toDate.getTime();
    });

    return {
      events: filtered,
      windowLabel: `${formatClock(fromDate.toISOString())} → ${formatClock(toDate.toISOString())}`,
    };
  }, [from, to]);

  const counts = useMemo(
    () => ({
      answered: events.filter((e) => e.kind === 'answered').length,
      missed: events.filter((e) => e.kind === 'missed').length,
    }),
    [events],
  );

  // Carve-out: the kit is what supplies every visible element, so when it is
  // missing there is nothing to fall back to but uncoloured text.
  if (!Stack || !Typography) {
    return <div {...marker}>{events.length} events in the selected range</div>;
  }

  const visible = events.slice(0, rowsThatFit(widget.pixel.height));
  // Wide enough for a third column. Narrow cards drop the party rather than
  // truncating three things at once.
  const wide = widget.pixel.width >= 420;

  return (
    // The marker rides this root — a real, visible box the Playwright suite can
    // assert. No card and no heading: the frame drew both before this rendered.
    <Stack {...marker} direction='column' spacing={1.5} sx={{ height: '100%' }}>
      {Chip ? (
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Chip
            size='small'
            variant='outlined'
            label={`${events.length} events`}
          />
          <Chip
            size='small'
            color='success'
            variant='outlined'
            label={`${counts.answered} answered`}
          />
          <Chip
            size='small'
            color='error'
            variant='outlined'
            label={`${counts.missed} missed`}
          />
        </Stack>
      ) : null}

      {events.length === 0 ? (
        <Stack
          direction='column'
          spacing={1}
          alignItems='flex-start'
          sx={{ flexGrow: 1 }}
        >
          <Typography variant='body2' color='text.secondary'>
            No activity in this window. Widen the dashboard&rsquo;s range, or
            take the card off the grid.
          </Typography>
          {/* The guide's stated use for `actions`: an empty state that offers to
              remove the widget, rather than sitting there empty. */}
          {Button ? (
            <Button
              size='small'
              variant='text'
              color='error'
              onClick={() => actions.remove()}
            >
              Remove widget
            </Button>
          ) : null}
        </Stack>
      ) : (
        <Stack
          direction='column'
          spacing={0.75}
          sx={{ flexGrow: 1, minHeight: 0 }}
        >
          {visible.map((event) => (
            <Stack
              key={event.id}
              direction='row'
              spacing={1}
              alignItems='center'
            >
              {Box ? (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: KIND_META[event.kind].color,
                  }}
                />
              ) : null}
              <Typography
                variant='body2'
                noWrap
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                {KIND_META[event.kind].label} &middot; {event.agent}
              </Typography>
              {wide ? (
                <Typography variant='caption' color='text.secondary' noWrap>
                  {event.party}
                </Typography>
              ) : null}
              <Typography variant='caption' color='text.secondary' noWrap>
                {formatClock(event.at)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {Divider ? <Divider /> : null}

      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        justifyContent='space-between'
        flexWrap='wrap'
        useFlexGap
      >
        {/* Printing the resolved window and the derived box is demo licence: a
            real widget would not, but a partner reading this wants to see that
            both arrive and both change. */}
        <Typography variant='caption' color='text.secondary'>
          {windowLabel} &middot; {widget.pixel.width}&times;
          {widget.pixel.height}px &middot; showing {visible.length} of{' '}
          {events.length}
        </Typography>
        {Button ? (
          <Button
            size='small'
            variant='text'
            onClick={() =>
              actions.resize(widget.size === 'full' ? 'half' : 'full')
            }
          >
            {widget.size === 'full' ? 'Half width' : 'Full width'}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
