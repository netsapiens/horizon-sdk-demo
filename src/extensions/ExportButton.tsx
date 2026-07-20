/**
 * Export Button Extension
 * Shows on multiple pages using route patterns
 */
import type { ExtensionComponentProps } from '@netsapiens/horizon-sdk';
import React from 'react';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

export function ExportButton({
  context,
  ...marker
}: ExtensionComponentProps & ZoneMarkerProps) {
  const { Button, Icon } = context.ui || {};

  const handleExport = () => {
    // Determine what page we're on from the route
    const pathParts = context.route.split('/');
    const pageType = pathParts[pathParts.length - 1]; // 'call-logs', 'contacts', 'users', etc.

    // The host hands the current table state to this zone via `pageContext` —
    // the user's selection when there is one, otherwise the full row set. A real
    // app would stream these rows to a file or an external system.
    const ctx = (context.pageContext ?? {}) as Record<string, unknown>;
    const selectedRows = (ctx.selectedRows ?? ctx.selected ?? null) as
      | unknown[]
      | null;
    const allRows = (ctx.rows ?? ctx.data ?? null) as unknown[] | null;

    console.groupCollapsed(`[Demo App] 📥 Export requested from "${pageType}"`);
    console.log('Route:', context.route);
    console.log('Params:', context.params);
    console.log('Selected rows:', selectedRows);
    console.log('All rows:', allRows);
    console.groupEnd();

    const exportData = selectedRows?.length ? selectedRows : allRows;
    const count = Array.isArray(exportData) ? exportData.length : 0;
    alert(
      `Exporting ${count} row(s) from ${pageType}… (see console for the dataset)`,
    );
  };

  // Fallback if UI components not available
  if (!Button || !Icon) {
    return (
      <button {...marker} onClick={handleExport}>
        📥 Export Data
      </button>
    );
  }

  // Use Horizon's Button and Icon components for consistent styling
  return (
    <Button
      {...marker}
      variant='text'
      sx={{ px: 1 }}
      onClick={handleExport}
      startIcon={
        <Icon icon='material-symbols:download' sx={{ fontSize: 20 }} />
      }
    >
      Export Data
    </Button>
  );
}
