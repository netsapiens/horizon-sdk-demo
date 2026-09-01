/**
 * CRM sync-queue fixtures for the dashboard widgets in `src/widgets/`.
 *
 * Built from a caller-supplied `tick` rather than read from a clock, for the
 * same reason `widgetActivity.ts` takes a `now`: the Sync queue panel declares
 * `refreshPolicy: 'own-cadence'` and polls on a timer it owns, so a render has
 * to stay a pure function of its inputs — the same tick yields the same rows,
 * and two renders between polls agree.
 *
 * The queue drains as the tick advances (queued → syncing → synced) with a
 * fixed pair of failures that stay put, so a reader watching the panel sees the
 * table move without the numbers turning into noise.
 */
import { MOCK_CRM_DIRECTORY } from './crm';

export type SyncState = 'Synced' | 'Syncing' | 'Queued' | 'Failed';

export interface SyncQueueRow {
  id: string;
  contact: string;
  /** Org/team, from the shared CRM directory. */
  company: string;
  direction: 'Push' | 'Pull';
  state: SyncState;
  /** Delivery attempts so far — >1 only for the rows that are failing. */
  attempts: number;
}

/** The contacts the demo "syncs", in a stable order. */
const CONTACTS = Object.entries(MOCK_CRM_DIRECTORY).map(([key, record]) => ({
  key,
  name: record.name,
  company: record.company,
}));

/** Rows that never drain, so the panel always has a failure state to show. */
const FAILING = new Set([2, 6]);

/** One full pass of the queue, plus a few idle ticks before it wraps. */
const CYCLE = CONTACTS.length + 3;

/**
 * The queue as of `tick`. Cheap enough to call on every poll: ten rows, no
 * allocation beyond the array.
 */
export function buildSyncQueue(tick: number): SyncQueueRow[] {
  const head = tick % CYCLE;

  return CONTACTS.map((contact, index): SyncQueueRow => {
    const state: SyncState = FAILING.has(index)
      ? 'Failed'
      : index < head
        ? 'Synced'
        : index === head
          ? 'Syncing'
          : 'Queued';

    return {
      id: `sync-${contact.key}`,
      contact: contact.name,
      company: contact.company,
      // Internal extensions are pulled from the CRM; external numbers are
      // pushed to it. Keyed off the id so a row keeps its direction.
      direction: /^\d{4}$/.test(contact.key) ? 'Pull' : 'Push',
      state,
      attempts: state === 'Failed' ? 3 : 1,
    };
  });
}

/** Contacts reconciled in the last 24h — the `contacts-synced` leaf's number. */
export const CONTACTS_SYNCED_24H = 1_284;

/** Rows that exhausted their retries in the same window — the `sync-failures` leaf. */
export const SYNC_FAILURES_24H = FAILING.size;

/**
 * Eight buckets of reconciled contacts, oldest first. Rendered as the mini bar
 * row under a leaf's value, so an app's leaf reads like the native stat blocks
 * beside it rather than as a bare number.
 */
export const SYNC_TREND_24H = [96, 141, 118, 187, 152, 204, 173, 213];
