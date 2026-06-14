/**
 * Header Status Badge Extension
 * Zone: `page-header-secondary` — secondary content beside the page title
 * (badges, status indicators). Renders via Horizon's PageHeader / PageTemplate.
 */
import type { ExtensionComponentProps } from '@netsapiens/horizon-sdk';

export function HeaderStatusBadge({ context }: ExtensionComponentProps) {
  const { Chip } = context.ui ?? {};

  // Fallback if the host UI surface is unavailable
  if (!Chip) {
    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: 12,
          background: '#10b98120',
          color: '#10b981',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        ● Live
      </span>
    );
  }

  return (
    <Chip
      size='small'
      color='success'
      variant='outlined'
      label='● Live (Demo Extension)'
    />
  );
}
