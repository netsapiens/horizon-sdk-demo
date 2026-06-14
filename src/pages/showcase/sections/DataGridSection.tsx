/** Showcase section: DatagridTemplate (sortable/filterable data table). */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';
import { DATAGRID_SAMPLE_USERS } from '../../../mocks/datagridSample';

export default function DataGridSection() {
  const { ui } = useHorizonContext();
  const { Box, Typography, Paper, Divider } = ui || {};
  const { DatagridTemplate } = ui?.templates || {};
  if (!Paper || !Typography || !Box || !DatagridTemplate) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        DatagridTemplate
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Pre-built data table with sorting, filtering, and actions
      </Typography>

      <Box>
        <DatagridTemplate
          data={DATAGRID_SAMPLE_USERS}
          columns={[
            { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
            { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
            { field: 'role', headerName: 'Role', width: 120 },
            { field: 'status', headerName: 'Status', width: 100 },
          ]}
          actions={[
            {
              label: 'Edit',
              icon: 'mdi:pencil',
              onClick: (row) => console.log('Edit:', row),
            },
            {
              label: 'Delete',
              icon: 'mdi:delete',
              onClick: (row) => console.log('Delete:', row),
              color: 'error',
            },
          ]}
          toolbar={{
            enableSearch: true,
            searchPlaceholder: 'Search users...',
            enableExport: true,
            enableFilter: true,
            enableColumns: true,
          }}
          defaultPageSize={5}
        />
      </Box>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { DatagridTemplate } = horizonContext.ui.templates;

<DatagridTemplate
  data={users}
  columns={[
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'status', headerName: 'Status', width: 100 },
  ]}
  actions={[
    { label: 'Edit', icon: 'mdi:pencil', onClick: (row) => edit(row) },
    { label: 'Delete', icon: 'mdi:delete', onClick: (row) => remove(row), color: 'error' },
  ]}
  toolbar={{ enableSearch: true, enableExport: true, enableFilter: true, enableColumns: true }}
  defaultPageSize={5}
/>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User lists, device tables, call logs, any tabular data
        (e.g., User Management, Device Management, Reports)
      </Typography>

      <Typography
        variant='caption'
        color='info.main'
        sx={{ mt: 2, display: 'block' }}
      >
        🔌 <strong>Dynamic Columns:</strong> Other federated apps can add
        columns to your table by registering dynamic columns for a specific
        zone. Add <code>dynamicColumnsZone="your-zone-id"</code> to enable this
        (e.g., "users-columns", "call-logs-columns"). Registered columns
        right-align by default to match native columns.
      </Typography>
    </Paper>
  );
}
