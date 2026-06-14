/**
 * Call enrichment service.
 *
 * Bridges the SDK's live call-event stream to the demo's UI: when a call rings
 * in, it looks the caller up in the mock CRM (`mocks/crm.ts`), stores the
 * enriched record, and broadcasts it on the event bus so the `CallerInfoWidget`
 * can render a populated caller card. On call-ended it clears the record.
 *
 * In production the CRM lookup would be a real API call; everything else (the
 * store + event contract) would stay the same.
 */
import type { HorizonEventBus } from '@netsapiens/horizon-sdk';

import { lookupCrmRecord, normalizePhoneNumber } from '../mocks/crm';

/** Enriched active-call record shared between this service and CallerInfoWidget. */
export interface CallerInfo {
  callId: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'answered' | 'missed' | 'ended';
  timestamp: number;
  callerName?: string;
  company?: string;
  lastContact?: string;
  notes?: string;
  callCount?: number;
}

/** In-memory store of active calls, shared across component instances. */
export const activeCallsStore = new Map<string, CallerInfo>();

/** Custom events the service emits on the host/remote event bus. */
export const CALL_UPDATED_EVENT = 'demo:call-updated';
export const CALL_REMOVED_EVENT = 'demo:call-removed';

/** The raw call event shape delivered by `sdk.subscribeToCallEvents`. */
interface RawCallEvent {
  type: 'call-started' | 'call-answered' | 'call-missed' | 'call-ended';
  callId: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  timestamp: number;
}

function statusForEvent(type: RawCallEvent['type']): CallerInfo['status'] {
  if (type === 'call-answered') return 'answered';
  if (type === 'call-missed') return 'missed';
  return 'ringing';
}

/**
 * Build a call-event handler bound to the given event bus. Pass the result to
 * `sdk.subscribeToCallEvents(...)`. Updates `activeCallsStore` and emits
 * `demo:call-updated` / `demo:call-removed` for the CallerInfoWidget.
 */
export function createCallEventHandler(eventBus: HorizonEventBus) {
  return (event: RawCallEvent) => {
    if (event.type === 'call-ended') {
      activeCallsStore.delete(event.callId);
      eventBus.emit(CALL_REMOVED_EVENT, event.callId);
      return;
    }

    const record = lookupCrmRecord(normalizePhoneNumber(event.from));

    const enriched: CallerInfo = {
      callId: event.callId,
      from: event.from,
      to: event.to,
      direction: event.direction,
      status: statusForEvent(event.type),
      timestamp: event.timestamp,
      callerName: record?.name,
      company: record?.company,
      lastContact: record?.lastContact,
      notes: record?.notes,
      callCount: record?.callCount,
    };

    activeCallsStore.set(event.callId, enriched);
    eventBus.emit(CALL_UPDATED_EVENT, enriched);
  };
}
