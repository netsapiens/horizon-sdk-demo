/** Showcase section: Tooltip. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function TooltipSection() {
  const { ui } = useHorizonContext();
  const { Tooltip, IconButton, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Tooltip || !IconButton) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Tooltip
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Contextual help
      </Typography>

      <Stack direction='row' spacing={2}>
        <Tooltip title='Edit' arrow>
          <IconButton icon='mdi:pencil' aria-label='Edit' />
        </Tooltip>
        <Tooltip title='Delete' arrow>
          <IconButton icon='mdi:delete' color='error' aria-label='Delete' />
        </Tooltip>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Tooltip, IconButton } = horizonContext.ui;

<Stack direction="row" spacing={2}>
  <Tooltip title="Edit" arrow>
    <IconButton icon="mdi:pencil" aria-label="Edit" />
  </Tooltip>
  <Tooltip title="Delete" arrow>
    <IconButton icon="mdi:delete" color="error" aria-label="Delete" />
  </Tooltip>
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Icon buttons, help text, truncated content (e.g., action
        button labels, field descriptions)
      </Typography>
    </Paper>
  );
}
