/**
 * Call Priority Column Extension
 * Adds a priority/importance column to call logs table
 *
 * Also the reference for the second argument the host hands `renderCell`: the
 * same `ExtensionContext` zone extensions get. Rendering the cell from
 * `context.ui` is what makes it follow the host's light/dark toggle — the
 * hardcoded-hex version this replaced looked identical in both schemes.
 */
import type { ExtensionContext } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

interface CallPriorityProps {
  /** DataGrid renderCell params — only the row record is read here. */
  params: { row: Record<string, unknown> };
  /** Host-built extension context (`ui`, `theme`, `t`, scoped `eventBus`). */
  context: ExtensionContext;
}

type Priority = 'High' | 'Medium' | 'Low';

/** App-owned semantics: which priority a row lands in. */
function priorityOf(row: Record<string, unknown>): Priority {
  const duration = Number(row['call-total-duration-seconds'] ?? 0);
  const direction = row['call-direction'];

  if (direction === 2) return 'High'; // Missed call
  if (direction === 1 && duration > 300) return 'High'; // Inbound call > 5 min
  if (duration > 180) return 'Medium'; // Any call > 3 min
  return 'Low';
}

/** Host semantic colour slots — the host maps these per colour scheme. */
const CHIP_COLOR: Record<Priority, 'error' | 'warning' | 'default'> = {
  High: 'error',
  Medium: 'warning',
  Low: 'default',
};

/**
 * Fallback palette for when the host UI surface isn't available. These are values
 * the app owns, so they branch on `context.theme` rather than being read from
 * `ui.theme` — those tokens are a snapshot and go stale after a toggle.
 */
const FALLBACK_COLOR: Record<'light' | 'dark', Record<Priority, string>> = {
  light: { High: '#dc2626', Medium: '#d97706', Low: '#6b7280' },
  dark: { High: '#f87171', Medium: '#fbbf24', Low: '#9ca3af' },
};

export function CallPriorityCell({
  params,
  context,
  ...marker
}: CallPriorityProps & ZoneMarkerProps) {
  const { Chip } = context.ui ?? {};
  const priority = priorityOf(params.row);

  // Preferred path: a host component, themed by the host, so the cell re-colours
  // with the colour scheme without this app tracking the mode at all.
  if (Chip) {
    return (
      <Chip
        {...marker}
        size='small'
        variant='outlined'
        color={CHIP_COLOR[priority]}
        label={priority}
      />
    );
  }

  // Degraded path: own markup, so pick a mode-appropriate value per the theming
  // contract. `context.theme` is the reactive signal — the host rebuilds the
  // column context when the scheme flips.
  const color =
    FALLBACK_COLOR[context.theme === 'dark' ? 'dark' : 'light'][priority];

  return (
    <div
      {...marker}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: `${color}20`,
        color,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {priority}
    </div>
  );
}
