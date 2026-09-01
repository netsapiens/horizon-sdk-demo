/**
 * Live calls — a `kind: 'leaf'` widget with `leafOf: 'stat'`, and the demo's
 * `refreshPolicy: 'realtime'` example.
 *
 * Registered in `App.tsx` §4. It was a half-width **panel**, which was the wrong
 * type for what it shows: a single live number. A panel is a card, and a card
 * holding one figure is 800px of empty space next to a stats grid that fits nine
 * of them. The host's own *Active Calls* is the same concept and is a stat
 * block, so this is one too — it now sits in the host's stats container
 * alongside it, and `ui.StatBlock` draws it, so the two are the same component.
 *
 * Nothing here polls and nothing reads `widget.range`: the data arrives by
 * **push**, over the app-scoped event bus on `context.eventBus`. `App.tsx`
 * subscribes to the SIP stream once through `sdk.subscribeToCallEvents`,
 * `services/callEnrichment.ts` enriches each event from the mock CRM and
 * re-emits it, and this leaf and the `CallerInfoWidget` extension both listen to
 * that one broadcast. A widget does not open a second subscription to the host —
 * one app, one stream.
 *
 * It also carries the two gates beyond `requiredScopes`, which answer different
 * questions:
 *
 * - **`requiredPermissions: ['call-events:listen']`** — what the APP was
 *   granted. Checked before this reaches the catalogue, so a platform with call
 *   events switched off never offers a block that could only ever read zero.
 * - **`condition`** — the app's own predicate, evaluated last. It asks whether
 *   `context.eventBus` is present, because that is the one thing this cannot
 *   render without. A condition that throws hides the widget rather than taking
 *   the dashboard's render with it, so being strict costs nothing.
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

export function LiveCallsWidget({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { StatBlock } = context.ui ?? {};

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
  if (!StatBlock) return <div {...marker}>{calls.length}</div>;

  const ringing = calls.filter((call) => call.status === 'ringing').length;

  return (
    // No heading — the leaf frame drew "Live calls" from the registration's
    // `title`, exactly as it does for the native block beside this one.
    <StatBlock
      {...marker}
      value={calls.length}
      caption={
        calls.length === 0
          ? 'nothing in progress'
          : `${ringing} ringing · pushed live`
      }
      // Semantic, not decorative: the host resolves the colour, so this reads
      // right in both colour modes.
      tone={ringing > 0 ? 'warning' : 'primary'}
    />
  );
}
