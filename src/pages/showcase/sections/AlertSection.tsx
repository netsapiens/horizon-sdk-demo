/** Showcase section: Alert severities. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function AlertSection() {
  const { ui } = useHorizonContext();
  const { Alert, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Alert) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Alert
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Feedback messages with different severity levels
      </Typography>

      <Stack spacing={2}>
        <Alert severity='info'>This is an info alert — check it out!</Alert>
        <Alert severity='success'>
          This is a success alert — check it out!
        </Alert>
        <Alert severity='warning'>
          This is a warning alert — check it out!
        </Alert>
        <Alert severity='error'>This is an error alert — check it out!</Alert>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Alert } = horizonContext.ui;

<Stack spacing={2}>
  <Alert severity="info">This is an info alert — check it out!</Alert>
  <Alert severity="success">This is a success alert — check it out!</Alert>
  <Alert severity="warning">This is a warning alert — check it out!</Alert>
  <Alert severity="error">This is an error alert — check it out!</Alert>
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Form validation, notifications, status messages (e.g., save
        confirmations, error messages, warnings)
      </Typography>
    </Paper>
  );
}
