import type {
  ExtensionComponentProps,
  SidePanelContentProps,
} from '@netsapiens/horizon-sdk';
import { useSidePanel } from '@netsapiens/horizon-sdk';

import { CallDetailsPanel } from '../panels/CallDetailsPanel';

/**
 * Quick Action Button Extension
 * Zone: `table-row-actions` — appears on each Call Logs row.
 *
 * Demonstrates opening the shared SDK side panel from *anywhere* (here, a table
 * row) via `useSidePanel()`, populated with row-specific content.
 */

export function QuickActionButton({ context }: ExtensionComponentProps) {
  const row = context.pageContext?.row as Record<string, unknown> | undefined;
  const { IconButton } = context.ui || {};
  // Pass context.eventBus: extension components render outside HorizonContextProvider.
  const { open } = useSidePanel(context.eventBus);

  if (!row) return null;

  const handleAction = () => {
    // Close over `row` so the panel body renders this row's details.
    const Panel = (props: SidePanelContentProps) => (
      <CallDetailsPanel {...props} row={row} />
    );
    open({
      title: 'Call details',
      subtitle: 'Opened from a table row',
      width: 'sm',
      icon: 'material-symbols:phone-in-talk-outline',
      component: Panel,
    });
  };

  // Fallback if UI components not available
  if (!IconButton) {
    return (
      <button onClick={handleAction} title='Quick Action (Demo Extension)'>
        ⚡
      </button>
    );
  }

  return (
    <IconButton
      icon='material-symbols:bolt'
      iconSize={18}
      aria-label='quick-action'
      size='small'
      onClick={handleAction}
    />
  );
}
