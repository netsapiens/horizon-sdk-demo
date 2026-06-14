/** Showcase section: IconButton. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function IconButtonSection() {
  const { ui } = useHorizonContext();
  const { IconButton, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !IconButton) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        IconButton
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Icon-only buttons
      </Typography>

      <Stack direction='row' spacing={1}>
        <IconButton icon='mdi:pencil' aria-label='Edit' />
        <IconButton icon='mdi:delete' color='error' aria-label='Delete' />
        <IconButton icon='mdi:settings' size='small' aria-label='Settings' />
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { IconButton } = horizonContext.ui;

<Stack direction="row" spacing={1}>
  <IconButton icon="mdi:pencil" aria-label="Edit" />
  <IconButton icon="mdi:delete" color="error" aria-label="Delete" />
  <IconButton icon="mdi:settings" size="small" aria-label="Settings" />
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Toolbars, data grids, side trays (e.g., edit/delete actions
        in user list, settings menu toggle)
      </Typography>
    </Paper>
  );
}
