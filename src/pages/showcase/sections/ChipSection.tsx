/** Showcase section: Chip tags/labels. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function ChipSection() {
  const { ui } = useHorizonContext();
  const { Chip, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Chip) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Chip
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Tags and labels
      </Typography>

      <Stack direction='row' spacing={1} flexWrap='wrap'>
        <Chip label='Default' />
        <Chip label='Primary' color='primary' />
        <Chip label='Success' color='success' />
        <Chip label='Error' color='error' />
        <Chip label='Small' size='small' />
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Chip } = horizonContext.ui;

<Stack direction="row" spacing={1} flexWrap="wrap">
  <Chip label="Default" />
  <Chip label="Primary" color="primary" />
  <Chip label="Success" color="success" />
  <Chip label="Error" color="error" />
  <Chip label="Small" size="small" />
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Status indicators, tags, labels (e.g., user roles, device
        status, call states)
      </Typography>
    </Paper>
  );
}
