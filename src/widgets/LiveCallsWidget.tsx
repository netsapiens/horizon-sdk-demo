/**
 * Live call console — a `kind: 'panel'` widget, and the demo's answer to "what
 * can I actually build in one of these?"
 *
 * Registered in `App.tsx` §4. Every other widget here maps onto something the
 * host already draws: a chart, a datagrid, a stat block, a tabbed card. This one
 * is deliberately the other case — a layout the platform has no equivalent for,
 * assembled entirely from `context.ui` primitives. That is the point of it. A
 * partner's product is usually not a restyled version of ours, and the kit has
 * to be able to express something we never anticipated without the app reaching
 * for its own styling.
 *
 * Nine kit components, no hand-styled markup, no colour literal anywhere:
 *
 *   ToggleButtonGroup   the status filter
 *   Switch              CRM enrichment on/off
 *   Paper               one card per call, `background` stepped for the ringing state
 *   Avatar              caller initials
 *   Chip                status, direction, sample badge
 *   IconButton          per-row actions
 *   Button              the empty state's two routes out
 *   Icon                the empty state's mark
 *   Divider / Stack / Typography / Box   the rest
 *
 * Data is pushed, not polled — `refreshPolicy: 'realtime'`. `App.tsx` subscribes
 * to the SIP stream once through `sdk.subscribeToCallEvents`,
 * `services/callEnrichment.ts` enriches each event from the mock CRM and
 * re-emits it, and this console listens to that one broadcast. A widget does not
 * open a second subscription to the host.
 *
 * When no call is in progress it shows the sample board from
 * `mocks/liveCalls.ts` rather than an empty card, and says so in the footer —
 * the same honesty `mocks/recentCalls.ts` uses. A console that is blank whenever
 * the phones are quiet demonstrates nothing.
 */
import type {
  SidePanelContentProps,
  WidgetComponentProps,
} from '@netsapiens/horizon-sdk';
import { useEffect, useMemo, useState } from 'react';
import { useSidePanel } from '@netsapiens/horizon-sdk';

import type { CallerInfo } from '../services/callEnrichment';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { buildSampleCalls } from '../mocks/liveCalls';
import { CallDetailsPanel } from '../panels/CallDetailsPanel';
import {
  activeCallsStore,
  CALL_REMOVED_EVENT,
  CALL_UPDATED_EVENT,
} from '../services/callEnrichment';

type StatusFilter = 'all' | 'ringing' | 'answered';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ringing', label: 'Ringing' },
  { value: 'answered', label: 'Active' },
];

/** Status → the semantic colour key the kit resolves. Never a literal. */
const STATUS_TONE: Record<CallerInfo['status'], string> = {
  ringing: 'warning',
  answered: 'success',
  missed: 'error',
  ended: 'default',
};

function initials(call: CallerInfo): string {
  const name = call.callerName?.trim();
  if (!name) return call.from.replace(/\D/g, '').slice(-2) || '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Talk time so far, from the event timestamp. */
function elapsed(call: CallerInfo, nowMs: number): string {
  const seconds = Math.max(0, Math.floor((nowMs - call.timestamp) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LiveCallsWidget({
  context,
  widget,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const {
    Stack,
    Typography,
    Box,
    Paper,
    Avatar,
    Chip,
    Button,
    IconButton,
    Divider,
    Switch,
    ToggleButtonGroup,
    Icon,
  } = context.ui ?? {};

  // A widget renders outside HorizonContextProvider, exactly as a zone
  // extension does, so the hook is handed the bus rather than reading context.
  const { open } = useSidePanel(context.eventBus);
  const navigate = context.navigate;

  const [live, setLive] = useState<CallerInfo[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [enriched, setEnriched] = useState(true);

  useEffect(() => {
    if (!context.eventBus) return;

    const sync = () => setLive(Array.from(activeCallsStore.values()));

    // The bus is string-keyed and typed `(data: unknown) => void`, so check the
    // field the store is keyed by rather than trusting the payload.
    const onUpdated = (data: unknown) => {
      const info = data as CallerInfo | undefined;
      if (typeof info?.callId !== 'string') return;
      activeCallsStore.set(info.callId, info);
      sync();
    };
    const onRemoved = (data: unknown) => {
      if (typeof data !== 'string') return;
      activeCallsStore.delete(data);
      sync();
    };

    context.eventBus.on(CALL_UPDATED_EVENT, onUpdated);
    context.eventBus.on(CALL_REMOVED_EVENT, onRemoved);
    // Seed from the store: a console added mid-call should not wait for the
    // next event to have anything to say.
    sync();

    return () => {
      context.eventBus?.off(CALL_UPDATED_EVENT, onUpdated);
      context.eventBus?.off(CALL_REMOVED_EVENT, onRemoved);
    };
  }, [context.eventBus]);

  // One clock for every row, ticking only while there is something to tick.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const showingSample = live.length === 0;
  const calls = useMemo(
    () => (showingSample ? buildSampleCalls(new Date(nowMs)) : live),
    // `nowMs` deliberately absent: the sample board is built once per switch to
    // sample mode, not rebuilt every second under the ticking clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showingSample, live],
  );

  const shown = useMemo(
    () => (filter === 'all' ? calls : calls.filter((c) => c.status === filter)),
    [calls, filter],
  );

  // Carve-out: the kit is what supplies every visible element, so with none of
  // it there is nothing to fall back to but the count.
  if (!Stack || !Typography || !Paper) {
    return <div {...marker}>{calls.length} calls</div>;
  }

  const ringing = calls.filter((c) => c.status === 'ringing').length;
  const wide = widget.pixel.width >= 520;

  /**
   * Open the shared side panel on one call.
   *
   * `CallDetailsPanel` takes the row as a prop, so it is closed over here — the
   * same shape `QuickActionButton` uses to open it from a table row. The panel
   * body is the app's; the drawer, its header and its dismissal are the host's.
   */
  const openDetails = (call: CallerInfo) => {
    const Panel = (props: SidePanelContentProps) => (
      <CallDetailsPanel
        {...props}
        row={{
          'call-from': call.from,
          'call-to': call.to,
          'call-direction': call.direction,
          'call-status': call.status,
          'caller-name': call.callerName ?? '',
          company: call.company ?? '',
          'last-contact': call.lastContact ?? '',
          notes: call.notes ?? '',
        }}
      />
    );
    open({
      title: call.callerName ?? call.from,
      subtitle: 'Live call · opened from a dashboard widget',
      width: 'sm',
      icon: 'mdi:phone-in-talk',
      component: Panel,
    });
  };

  return (
    <Stack {...marker} direction='column' spacing={1.5} sx={{ height: '100%' }}>
      {/* Controls. A dashboard card is allowed to be interactive — the frame
          owns the card, the menu and the drag handle, and everything inside it
          is the app's to compose. */}
      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        justifyContent='space-between'
        flexWrap='wrap'
        useFlexGap
      >
        {ToggleButtonGroup ? (
          <ToggleButtonGroup
            exclusive
            size='small'
            value={filter}
            options={FILTERS}
            onChange={(_event: unknown, next: string | null) =>
              setFilter((current) => (next as StatusFilter) ?? current)
            }
          />
        ) : null}

        {Switch ? (
          <Switch
            size='small'
            label='CRM'
            checked={enriched}
            onChange={(_event: unknown, checked: boolean) =>
              setEnriched(checked)
            }
          />
        ) : null}
      </Stack>

      {/* The board. */}
      <Stack
        direction='column'
        spacing={1}
        sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {shown.length === 0 ? (
          <Stack
            direction='column'
            spacing={1.5}
            alignItems='center'
            justifyContent='center'
            sx={{ flexGrow: 1, textAlign: 'center', px: 2 }}
          >
            {Icon ? (
              <Icon
                icon='mdi:phone-off-outline'
                sx={{ fontSize: 32, color: 'text.disabled' }}
              />
            ) : null}
            <Typography variant='body2' color='text.secondary'>
              Nothing {filter === 'all' ? 'in progress' : `is ${filter}`} right
              now.
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {Button && navigate ? (
                <Button
                  size='small'
                  variant='soft'
                  onClick={() => navigate('/manage/crm-integration')}
                >
                  Open CRM Integration
                </Button>
              ) : null}
              {Button ? (
                <Button
                  size='small'
                  variant='text'
                  onClick={() => setFilter('all')}
                >
                  Clear filter
                </Button>
              ) : null}
            </Stack>
          </Stack>
        ) : (
          shown.map((call) => (
            // `background` is a palette step the host resolves per colour mode,
            // not a colour this file chose — a ringing call lifts off the card
            // without anything here knowing what "lifted" looks like in dark.
            <Paper
              key={call.callId}
              variant='outlined'
              background={call.status === 'ringing' ? 5 : undefined}
              sx={{ p: 1.25 }}
            >
              <Stack direction='row' spacing={1.25} alignItems='center'>
                {Avatar ? (
                  <Avatar sx={{ width: 34, height: 34, fontSize: 13 }}>
                    {initials(call)}
                  </Avatar>
                ) : null}

                <Stack
                  direction='column'
                  spacing={0.25}
                  sx={{ flexGrow: 1, minWidth: 0 }}
                >
                  <Typography variant='body2' fontWeight={600} noWrap>
                    {call.callerName ?? call.from}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' noWrap>
                    {enriched && call.company
                      ? `${call.company} · ${call.callCount ?? 0} calls`
                      : call.from}
                  </Typography>
                </Stack>

                {wide && Chip ? (
                  <Chip
                    size='small'
                    variant='outlined'
                    label={call.direction === 'inbound' ? 'In' : 'Out'}
                  />
                ) : null}

                {Chip ? (
                  <Chip
                    size='small'
                    color={STATUS_TONE[call.status]}
                    label={
                      call.status === 'answered'
                        ? elapsed(call, nowMs)
                        : call.status
                    }
                  />
                ) : null}

                {IconButton ? (
                  <IconButton
                    icon='mdi:open-in-new'
                    size='small'
                    aria-label={`Details for ${call.callerName ?? call.from}`}
                    onClick={() => openDetails(call)}
                  />
                ) : null}
              </Stack>
            </Paper>
          ))
        )}
      </Stack>

      {Divider ? <Divider /> : null}

      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        flexWrap='wrap'
        useFlexGap
      >
        {Chip ? (
          <>
            <Chip
              size='small'
              variant='outlined'
              color={ringing > 0 ? 'warning' : 'default'}
              label={`${ringing} ringing`}
            />
            <Chip
              size='small'
              variant='outlined'
              label={`${calls.length} on the board`}
            />
            {/* Never passes a sample off as live. */}
            {showingSample ? (
              <Chip size='small' variant='soft' label='Sample data' />
            ) : (
              <Chip
                size='small'
                variant='soft'
                color='success'
                label='Live feed'
              />
            )}
          </>
        ) : null}
        {Box ? <Box sx={{ flexGrow: 1 }} /> : null}
      </Stack>
    </Stack>
  );
}
