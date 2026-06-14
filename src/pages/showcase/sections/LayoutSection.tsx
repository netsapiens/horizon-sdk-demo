/** Showcase section: Stack & Divider layout primitives. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function LayoutSection() {
  const { ui } = useHorizonContext();
  const { Box, Avatar, Chip, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Box) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Stack & Divider
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Layout components for spacing and separation. Stack is vertical (column)
        by default — pass direction="row" for horizontal.
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Horizontal Stack (direction="row")
          </Typography>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack direction='row' spacing={2} alignItems='center'>
              {Avatar && <Avatar>JD</Avatar>}
              <Typography>John Doe</Typography>
              {Chip && <Chip label='Admin' size='small' color='primary' />}
            </Stack>
          </Paper>
        </Box>

        {Divider && <Divider />}

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Vertical Stack (default — no direction needed)
          </Typography>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant='body2'>Item 1</Typography>
              <Typography variant='body2'>Item 2</Typography>
              <Typography variant='body2'>Item 3</Typography>
            </Stack>
          </Paper>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Divider Examples
          </Typography>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant='body2'>Content above divider</Typography>
              {Divider && <Divider />}
              <Typography variant='body2'>Content below divider</Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Stack, Divider, Avatar, Chip, Typography } = horizonContext.ui;

// Horizontal Stack
<Stack direction="row" spacing={2} alignItems="center">
  <Avatar>JD</Avatar>
  <Typography>John Doe</Typography>
  <Chip label="Admin" size="small" color="primary" />
</Stack>

// Vertical Stack
<Stack spacing={1.5}>
  <Typography variant="body2">Item 1</Typography>
  <Typography variant="body2">Item 2</Typography>
  <Typography variant="body2">Item 3</Typography>
</Stack>

// Divider Example
<Stack spacing={2}>
  <Typography variant="body2">Content above divider</Typography>
  <Divider />
  <Typography variant="body2">Content below divider</Typography>
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User cards, form layouts, list items, card sections (e.g.,
        user profile displays, settings panels)
      </Typography>
    </Paper>
  );
}
