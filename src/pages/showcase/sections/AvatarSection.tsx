/** Showcase section: Avatar. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function AvatarSection() {
  const { ui } = useHorizonContext();
  const { Avatar, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Avatar) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Avatar
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        User avatars
      </Typography>

      <Stack direction='row' spacing={1}>
        <Avatar>JD</Avatar>
        <Avatar sx={{ bgcolor: 'primary.main' }}>AB</Avatar>
        <Avatar sx={{ bgcolor: 'success.main' }}>CD</Avatar>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Avatar } = horizonContext.ui;

<Stack direction="row" spacing={1}>
  <Avatar>JD</Avatar>
  <Avatar sx={{ bgcolor: 'primary.main' }}>AB</Avatar>
  <Avatar sx={{ bgcolor: 'success.main' }}>CD</Avatar>
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User lists, profiles, contacts (e.g., call history, user
        management, directory)
      </Typography>
    </Paper>
  );
}
