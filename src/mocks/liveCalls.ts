/**
 * Sample calls for the Live calls console (`src/widgets/LiveCallsWidget.tsx`).
 *
 * The console renders **real** calls when any are in progress. Most of the time
 * there are none, and a console that is empty whenever nobody is on the phone
 * demonstrates nothing — so it falls back to these, badged as samples the same
 * way `mocks/recentCalls.ts` marks its rows with `source`. The widget never
 * passes a sample off as live: the footer says which it is showing.
 *
 * Shapes match `CallerInfo` from `services/callEnrichment.ts`, so the console
 * renders one row component for both and there is no second code path to keep
 * in step.
 */
import type { CallerInfo } from '../services/callEnrichment';
import { MOCK_CRM_DIRECTORY } from './crm';

/** Built from the shared CRM directory so the enrichment toggle has data to show. */
export function buildSampleCalls(now: Date): CallerInfo[] {
  const entries = Object.entries(MOCK_CRM_DIRECTORY).slice(0, 4);
  const statuses: CallerInfo['status'][] = [
    'ringing',
    'answered',
    'answered',
    'ringing',
  ];

  return entries.map(([party, record], index) => ({
    callId: `sample-call-${index + 1}`,
    from: party,
    to: '2001',
    direction: index % 2 === 0 ? 'inbound' : 'outbound',
    status: statuses[index % statuses.length],
    // Staggered so the durations below read as a plausible live board.
    timestamp: now.getTime() - (index + 1) * 47_000,
    callerName: record.name,
    company: record.company,
    lastContact: record.lastContact,
    notes: record.notes,
    callCount: record.callCount,
  }));
}
