/**
 * Live calls — a `kind: 'panel'` widget in the **stats** category, and the
 * demo's `refreshPolicy: 'realtime'` example.
 *
 * Registered in `App.tsx` §4. Nothing here polls and nothing reads
 * `widget.range`: the data arrives by **push**, over the app-scoped event bus on
 * `context.eventBus`. `App.tsx` subscribes to the SIP stream once through
 * `sdk.subscribeToCallEvents`, `services/callEnrichment.ts` enriches each event
 * from the mock CRM and re-emits it as `demo:call-updated`, and this widget and
 * the `CallerInfoWidget` extension both listen to that one broadcast. A widget
 * does not open a second subscription to the host — one app, one stream.
 *
 * It is also the demo's example of the two gates a widget can declare beyond
 * `requiredScopes`, and they answer different questions:
 *
 * - **`requiredPermissions: ['call-events:listen']`** — what the APP was
 *   granted. The host checks it against this app's capability grants before the
 *   widget reaches the catalogue at all, so a platform that has switched call
 *   events off never offers a card that could only ever be empty. This is not
 *   decoration: it is the same capability `subscribeToCallEvents` is gated on,
 *   declared where the dashboard can see it.
 * - **`condition`** — the app's own predicate, evaluated last, on every read.
 *   Here it asks whether `context.eventBus` is present, because that is the one
 *   thing this widget cannot render without. A `condition` that throws hides the
 *   widget rather than taking the dashboard's render with it, so it costs
 *   nothing to be strict.
 */
import type { WidgetComponentProps } from '@netsapiens/horizon-sdk';
import { useEffect, useState } from 'react';

import type { CallerInfo } from '../services/callEnrichment';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import {
  activeCallsStore,
  CALL_REMOVED_EVENT,
  CALL_UPDATED_EVENT,
} from '../services/callEnrichment';

/** Dot colour per call status. Palette paths, so they follow the theme toggle. */
const STATUS_COLOR: Record<CallerInfo['status'], string> = {
  ringing: 'warning.main',
  answered: 'success.main',
  missed: 'error.main',
  ended: 'text.disabled',
};

export function LiveCallsWidget({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Box, Chip, Divider } = context.ui ?? {};

  const [calls, setCalls] = useState<CallerInfo[]>([]);

  useEffect(() => {
    if (!context.eventBus) return;

    const sync = () => setCalls(Array.from(activeCallsStore.values()));

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
    // Seed from the store: a widget added mid-call should not wait for the next
    // event to have anything to say.
    sync();

    return () => {
      context.eventBus?.off(CALL_UPDATED_EVENT, onUpdated);
      context.eventBus?.off(CALL_REMOVED_EVENT, onRemoved);
    };
  }, [context.eventBus]);

  // Carve-out: with no kit there is nothing to render but the count.
  if (!Stack || !Typography) return <div {...marker}>{calls.length}</div>;

  const ringing = calls.filter((call) => call.status === 'ringing').length;

  return (
    // No card and no heading: `chrome` defaults to `'host'`, so the frame drew
    // "Live calls" from the registration's `title` before this rendered.
    <Stack {...marker} direction='column' spacing={1} sx={{ height: '100%' }}>
      <Typography variant='h4' fontWeight={600}>
        {calls.length}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {calls.length === 0
          ? 'No calls in progress — this card updates the moment one rings.'
          : `${ringing} ringing · pushed over the app's event bus`}
      </Typography>

      {calls.length > 0 && Divider ? <Divider /> : null}

      <Stack
        direction='column'
        spacing={0.75}
        sx={{ flexGrow: 1, minHeight: 0 }}
      >
        {calls.slice(0, 4).map((call) => (
          <Stack
            key={call.callId}
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
                  bgcolor: STATUS_COLOR[call.status],
                }}
              />
            ) : null}
            <Typography
              variant='body2'
              noWrap
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {call.callerName ?? call.from}
            </Typography>
            {Chip ? (
              <Chip size='small' variant='outlined' label={call.status} />
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
