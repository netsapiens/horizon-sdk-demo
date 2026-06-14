import type {
  ExtensionComponentProps,
  TableFilterBarContext,
} from '@netsapiens/horizon-sdk';
import React, { useState } from 'react';

export function ActiveCallsRecordingFilter({
  context,
}: ExtensionComponentProps) {
  const filterCtx = context.pageContext as TableFilterBarContext | undefined;
  const { ToggleButtonGroup } = context.ui ?? {};
  const [isActive, setIsActive] = useState(false);

  function handleChange(_e: React.SyntheticEvent, value: string | null) {
    const next = value === 'recorded';
    setIsActive(next);
    if (next) {
      filterCtx?.onFilterChange((row: unknown) => {
        const r = row as Record<string, unknown>;
        return (
          r['call-record-keep'] === 'yes' || r['call-record-keep'] === true
        );
      });
    } else {
      filterCtx?.onFilterChange(null);
    }
  }

  if (!ToggleButtonGroup) return null;

  return (
    <ToggleButtonGroup
      value={isActive ? 'recorded' : null}
      exclusive
      onChange={handleChange}
      options={[{ value: 'recorded', label: '● Recording' }]}
    />
  );
}
