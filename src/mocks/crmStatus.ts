/**
 * CRM sync state for a contact, as the demo's fixture sees it.
 *
 * Lives beside the other mocks rather than in the column component because two
 * surfaces read it — the column's `renderCell` and its `valueGetter`, so the
 * grid sorts and filters on the same string the reader sees — and because a
 * module that exports both a component and a helper loses React Fast Refresh.
 *
 * Deterministic from the extension rather than random or clock-driven: the grid
 * re-renders on sort, filter, paging and every colour-mode flip, and a value
 * that changed under any of those would read as data churning rather than as
 * one contact's settled state.
 */
import { MOCK_CRM_DIRECTORY } from './crm';

export type CrmStatus = 'Synced' | 'Queued' | 'Failed' | 'Not in CRM';

export function crmStatusOf(row: Record<string, unknown>): CrmStatus {
  const extension = String(
    row['extension'] ?? row['user'] ?? row['contact-id'] ?? '',
  );
  if (!extension || !MOCK_CRM_DIRECTORY[extension]) return 'Not in CRM';

  const digits = Number(extension.replace(/\D/g, '')) || 0;
  if (digits % 7 === 0) return 'Failed';
  if (digits % 3 === 0) return 'Queued';
  return 'Synced';
}
