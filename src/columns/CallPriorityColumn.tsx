/**
 * Call Priority Column Extension
 * Adds a priority/importance column to call logs table
 */
import React from 'react';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

interface CallPriorityProps {
  /** DataGrid renderCell params — only the row record is read here. */
  params: { row: Record<string, unknown> };
}

export function CallPriorityCell({
  params,
  ...marker
}: CallPriorityProps & ZoneMarkerProps) {
  // Calculate priority based on call data
  const duration = Number(params.row['call-total-duration-seconds'] ?? 0);
  const direction = params.row['call-direction'];

  let priority = 'Low';
  let color = '#6b7280'; // gray

  // High priority: long inbound calls or missed calls
  if (direction === 2) {
    // Missed call
    priority = 'High';
    color = '#ef4444'; // red
  } else if (direction === 1 && duration > 300) {
    // Inbound call > 5 min
    priority = 'High';
    color = '#ef4444';
  } else if (duration > 180) {
    // Any call > 3 min
    priority = 'Medium';
    color = '#f59e0b'; // orange
  }

  return (
    <div
      {...marker}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: `${color}20`,
        color: color,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {priority}
    </div>
  );
}
