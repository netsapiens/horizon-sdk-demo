/**
 * CRM sync queue — a `kind: 'panel'` widget in the **tables** category, and the
 * demo's `refreshPolicy: 'own-cadence'` example.
 *
 * Registered in `App.tsx` §4. The three refresh policies are a declaration of
 * where a widget's data comes from, and the host reads them:
 *
 * - `'shared-range'` — the dashboard's range control drives it, and the host
 *   hands over `widget.range`. The Recent activity panel and the Call volume
 *   chart take this one.
 * - `'own-cadence'` — **this widget.** It owns a timer, the host hands it no
 *   range at all (`widget.range` is `undefined` for anything that did not ask
 *   to follow it), and the interval below is the whole implementation.
 * - `'realtime'` — data arrives by push. See `LiveCallsWidget.tsx`.
 *
 * It is also where `actions.refresh()` is worth calling. Refresh is implemented
 * host-side as a **remount**: the grid bumps a token in this component's key,
 * React discards the subtree, and whatever the widget does on mount runs again.
 * That is the only refresh a host can honestly offer — it holds no handle on an
 * app's queries — and it is exactly right here, because the poll count below
 * restarts from zero and the reader can see that it did.
 *
 * The table is `ui.Table` and friends, not hand-rolled markup: the kit carries
 * static table primitives, and a widget is the last place to start painting your
 * own borders. Anything data-shaped — sorting, filtering, export, pagination —
 * belongs to `templates.DatagridTemplate` instead.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';
import { useEffect, useMemo, useState } from 'react';

import type { SyncState } from '../mocks/syncQueue';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { buildSyncQueue } from '../mocks/syncQueue';

/** How often this widget polls. Its own business — the host is not consulted. */
const POLL_MS = 5_000;

/** Chip colour per state. Palette keys, so all four follow the theme toggle. */
const STATE_COLOR: Record<SyncState, string> = {
  Synced: 'success',
  Syncing: 'info',
  Queued: 'default',
  Failed: 'error',
};

/** Rows the card has room for, from the host-supplied box. */
function rowsThatFit(pixelHeight: number): number {
  if (pixelHeight <= 0) return 5;
  const CHROME = 96; // the footer caption, inside the frame's own padding
  const ROW = 41;
  return Math.max(2, Math.min(10, Math.floor((pixelHeight - CHROME) / ROW)));
}

export function SyncQueueTable({
  context,
  widget,
  actions,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const {
    Stack,
    Typography,
    Chip,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
  } = context.ui ?? {};

  // The cadence this widget declared. A remount from `actions.refresh()` resets
  // it to zero, which is the visible proof of what Refresh actually does.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((current) => current + 1), POLL_MS);
    return () => clearInterval(timer);
  }, []);

  const rows = useMemo(() => buildSyncQueue(tick), [tick]);
  const failed = rows.filter((row) => row.state === 'Failed').length;

  // Carve-out: with no kit there is nothing to render but the count.
  if (!Stack || !Typography || !Table) {
    return <div {...marker}>{rows.length} contacts queued</div>;
  }

  const visible = rows.slice(0, rowsThatFit(widget.pixel.height));

  return (
    // The marker rides this root. No card and no heading — the frame drew both
    // before this rendered, because `chrome` is left at its default.
    <Stack {...marker} direction='column' spacing={1} sx={{ height: '100%' }}>
      <Stack direction='column' sx={{ flexGrow: 1, minHeight: 0 }}>
        <Table size='small'>
          {TableHead && TableRow && TableCell ? (
            <TableHead>
              <TableRow>
                <TableCell>Contact</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell align='right'>State</TableCell>
              </TableRow>
            </TableHead>
          ) : null}
          {TableBody && TableRow && TableCell ? (
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography variant='body2' noWrap>
                      {row.contact}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' noWrap>
                      {row.company}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {row.direction}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    {Chip ? (
                      <Chip
                        size='small'
                        variant='outlined'
                        color={STATE_COLOR[row.state]}
                        label={
                          row.state === 'Failed'
                            ? `Failed ×${row.attempts}`
                            : row.state
                        }
                      />
                    ) : (
                      <Typography variant='body2'>{row.state}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : null}
        </Table>
      </Stack>

      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        justifyContent='space-between'
        flexWrap='wrap'
        useFlexGap
      >
        {/* Printing the poll count is demo licence — a real widget would not.
            A partner reading this wants to see the cadence tick, and see it
            restart when Refresh remounts the component. */}
        <Typography variant='caption' color='text.secondary'>
          Polled {tick}× · every {POLL_MS / 1000}s · {failed} failing ·{' '}
          {visible.length} of {rows.length} rows
        </Typography>
        {Button ? (
          <Button size='small' variant='text' onClick={() => actions.refresh()}>
            Refresh
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
