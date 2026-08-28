/**
 * Activity fixtures for the dashboard widgets in `src/widgets/`.
 *
 * Unlike every other fixture in this folder, these timestamps are built
 * **relative to a caller-supplied `now`**. The Recent Activity panel filters
 * them by `widget.range` — the resolved from/to window a dashboard hands a
 * widget that follows the shared range — and `callRecordings.ts` pins its dates
 * to a fixed month so table sorting stays stable under test. A widget fixture
 * pinned the same way would fall outside every preset the dashboard's range
 * control offers, and the panel would read as broken rather than as filtered.
 *
 * `now` is a parameter rather than a `Date.now()` read in here, so a render stays
 * a pure function of its inputs: the widget passes `widget.range.to`, and two
 * renders of the same window produce the same feed.
 */
import { INTERNAL_PEOPLE } from './people';

export type ActivityKind = 'answered' | 'missed' | 'voicemail' | 'transferred';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  /** Handling agent, from the shared demo directory (`mocks/people.ts`). */
  agent: string;
  /** The other party — E.164, as the CDR feed reports it. */
  party: string;
  /** ISO 8601, resolved against the `now` passed to {@link buildActivityFeed}. */
  at: string;
  durationSeconds: number;
}

/**
 * Minutes before `now`, ascending. Deliberately spread from a few minutes to
 * ~three weeks back, so the shorter presets on the dashboard's range control
 * (an hour, a day) visibly cut the list down instead of returning everything.
 */
const MINUTES_AGO = [
  4, 12, 27, 51, 88, 143, 219, 305, 486, 742, 1_090, 1_615, 2_480, 3_270, 4_640,
  6_120, 8_450, 11_300, 15_700, 21_800, 28_900,
];

/** Cycled so every kind appears, with answered calls the plurality. */
const KINDS: readonly ActivityKind[] = [
  'answered',
  'answered',
  'missed',
  'answered',
  'voicemail',
  'answered',
  'transferred',
];

const PARTIES = [
  '+13025551000',
  '+14155550142',
  '+17705550188',
  '+12065550117',
  '+19045550163',
];

/**
 * The feed, newest first, with every timestamp resolved against `now`.
 *
 * Cheap enough to call on every range change: 21 rows, no allocation beyond the
 * array itself.
 */
export function buildActivityFeed(now: Date): ActivityEvent[] {
  return MINUTES_AGO.map((minutes, index): ActivityEvent => {
    const kind = KINDS[index % KINDS.length];
    return {
      id: `activity-${String(index + 1).padStart(2, '0')}`,
      kind,
      agent: INTERNAL_PEOPLE[index % INTERNAL_PEOPLE.length].name,
      party: PARTIES[index % PARTIES.length],
      at: new Date(now.getTime() - minutes * 60_000).toISOString(),
      // A missed call has no talk time; the others get a spread of durations.
      durationSeconds: kind === 'missed' ? 0 : 35 + ((index * 47) % 900),
    };
  });
}
