/** Showcase section: Button variants. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function ButtonsSection() {
  const { ui } = useHorizonContext();
  const { Box, Button, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Button || !Box) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Buttons
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Action buttons with variants
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Contained Variant
          </Typography>
          <Stack spacing={1} sx={{ maxWidth: 200 }}>
            <Button variant='contained' color='primary'>
              Primary
            </Button>
            <Button variant='contained' color='secondary'>
              Secondary
            </Button>
            <Button variant='contained' color='success'>
              Success
            </Button>
            <Button variant='contained' color='error'>
              Error
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Outlined Variant
          </Typography>
          <Stack spacing={1} sx={{ maxWidth: 200 }}>
            <Button variant='outlined' color='primary'>
              Outlined Primary
            </Button>
            <Button variant='outlined' color='secondary'>
              Outlined Secondary
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Text Variant
          </Typography>
          <Stack spacing={1} sx={{ maxWidth: 200 }}>
            <Button variant='text'>Text Button</Button>
            <Button variant='text' color='primary'>
              Text Primary
            </Button>
          </Stack>
        </Box>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Button } = horizonContext.ui;

// Contained Variant
<Stack spacing={1} sx={{ maxWidth: 200 }}>
  <Button variant="contained" color="primary">Primary</Button>
  <Button variant="contained" color="secondary">Secondary</Button>
  <Button variant="contained" color="success">Success</Button>
  <Button variant="contained" color="error">Error</Button>
</Stack>

// Outlined Variant
<Stack spacing={1} sx={{ maxWidth: 200 }}>
  <Button variant="outlined" color="primary">Outlined Primary</Button>
  <Button variant="outlined" color="secondary">Outlined Secondary</Button>
</Stack>

// Text Variant
<Stack spacing={1} sx={{ maxWidth: 200 }}>
  <Button variant="text">Text Button</Button>
  <Button variant="text" color="primary">Text Primary</Button>
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Form actions, toolbars, dialogs (e.g., Save/Cancel in user
        settings, Add User button in user management)
      </Typography>
    </Paper>
  );
}
