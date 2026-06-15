/**
 * Recent-calls API helper for the CRM Integration page.
 *
 * Fetches the signed-in user's recent call detail records (CDRs) from the
 * NetSapiens v2 API through the SDK's authenticated `horizonContext.api` proxy.
 * Credentials never reach this remote app — the host injects auth and audits the
 * call. The page falls back to sample data on any failure so it's never empty.
 *
 * NetSapiens does not expose a single canonical CDR shape across versions, so the
 * fields below are read best-effort with fallbacks (mirroring the user-agent
 * parsing approach the demo uses elsewhere).
 */
import type { HorizonApiClient } from '@netsapiens/horizon-sdk';

import type { RecentCall } from '../mocks/recentCalls';
import { normalizePhoneNumber } from '../mocks/crm';

/** Raw NetSapiens CDR record (the subset of fields the demo reads). */
interface NetSapiensCdr {
  id?: string;
  'cdr-id'?: string;
  'time-start'?: string;
  'orig-from-uri'?: string;
  'orig-from-user'?: string;
  'term-to-uri'?: string;
  'term-to-user'?: string;
  duration?: number | string;
  'duration-seconds'?: number | string;
  direction?: string;
  type?: string;
}

function toSeconds(v: number | string | undefined): number {
  const n = typeof v === 'string' ? parseInt(v, 10) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function relativeTime(start?: string): string {
  if (!start) return '—';
  // Best-effort: show the date/time as-is rather than guessing a relative label.
  return start;
}

/**
 * Fetch the signed-in user's recent calls from the NetSapiens v2 API and
 * normalize them for the CRM Integration page.
 */
export async function fetchRecentCalls(
  domain: string,
  userId: string,
  apiClient: HorizonApiClient,
): Promise<RecentCall[]> {
  if (!apiClient) throw new Error('API client is not defined');
  if (!domain) throw new Error('domain is required');
  if (!userId) throw new Error('userId is required');

  // User-scoped CDRs over REST. The host proxies this with the operator's
  // credentials; the remote only ever sees the relative path and the response.
  const path = `/domains/${domain}/users/${userId}/cdrs`;
  const cdrs = await apiClient.get<NetSapiensCdr[]>(path);

  return (cdrs ?? []).map((c, i) => {
    const direction: RecentCall['direction'] =
      (c.direction ?? c.type)?.toLowerCase() === 'outbound'
        ? 'outbound'
        : 'inbound';
    // The "other party" is the far end for the call's direction.
    const rawParty =
      direction === 'outbound'
        ? (c['term-to-user'] ?? c['term-to-uri'] ?? '')
        : (c['orig-from-user'] ?? c['orig-from-uri'] ?? '');
    const seconds = toSeconds(c['duration-seconds'] ?? c.duration);
    return {
      id: `live-${c.id ?? c['cdr-id'] ?? i}`,
      party: normalizePhoneNumber(rawParty),
      direction,
      timeLabel: relativeTime(c['time-start']),
      durationSeconds: seconds,
      answered: seconds > 0,
      source: 'live' as const,
    };
  });
}
