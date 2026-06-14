/**
 * Table Toolbar Info Extension
 * Zone: `table-toolbar` — the toolbar row above a DataTable. Good for
 * table-scoped actions, hints, or status chips.
 */
import type { ExtensionComponentProps } from '@netsapiens/horizon-sdk';

export function TableToolbarInfo({ context }: ExtensionComponentProps) {
  const { Tooltip, IconButton } = context.ui ?? {};

  const handleClick = () => {
    alert(
      'Tip: use the Priority column to triage missed and long-running calls first.',
    );
  };

  if (!Tooltip || !IconButton) {
    return (
      <button onClick={handleClick} title='Table tips (Demo Extension)'>
        ℹ️
      </button>
    );
  }

  return (
    <Tooltip title='Table tips (Demo Extension)'>
      <IconButton
        icon='material-symbols:info-outline'
        iconSize={18}
        size='small'
        aria-label='table-tips'
        onClick={handleClick}
      />
    </Tooltip>
  );
}
