/** Showcase section: Tooltip. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { SectionCode } from '../SectionCode';

export default function TooltipSection() {
  const { ui } = useHorizonContext();
  const { Tooltip, IconButton, Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack || !Tooltip || !IconButton) return null;

  return (
    <Paper>
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

      <SectionCode>
        {`const { Tooltip, IconButton } = horizonContext.ui;

<Stack direction="row" spacing={2}>
  <Tooltip title="Edit" arrow>
    <IconButton icon="mdi:pencil" aria-label="Edit" />
  </Tooltip>
  <Tooltip title="Delete" arrow>
    <IconButton icon="mdi:delete" color="error" aria-label="Delete" />
  </Tooltip>
</Stack>`}
      </SectionCode>

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
