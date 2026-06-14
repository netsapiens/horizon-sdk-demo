/** Showcase section: SidePanel drawer + SideTrayComponents building blocks. */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function SidePanelSection() {
  const { ui } = useHorizonContext();
  const { Button, IconButton, Chip, Stack, Typography, Paper, Divider } =
    ui || {};
  const { SidePanel, SideTrayComponents } = ui?.templates || {};
  const [open, setOpen] = useState(false);
  if (
    !Paper ||
    !Typography ||
    !Button ||
    !SidePanel ||
    !SideTrayComponents ||
    !Stack
  )
    return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        SidePanel
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Right-side drawer shell with pre-built building blocks for details and
        editing
      </Typography>

      <Button variant='contained' onClick={() => setOpen(true)}>
        Open Side Panel Example
      </Button>

      <SidePanel
        title='User Details'
        subtitle='View and edit user information'
        icon={IconButton && <IconButton icon='mdi:account' iconSize={20} />}
        open={open}
        onClose={() => setOpen(false)}
        width='lg'
        footer={
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => setOpen(false)}
            >
              Save Changes
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <SideTrayComponents.UserCard
            name='John Doe'
            subtitle='john.doe@example.com'
            trailing={
              Chip && <Chip label='Admin' size='small' color='primary' />
            }
          />

          <SideTrayComponents.Divider />

          <SideTrayComponents.Section title='Basic Information'>
            <SideTrayComponents.Field label='Full Name' value='John Doe' />
            <SideTrayComponents.Field
              label='Email'
              value='john.doe@example.com'
            />
            <SideTrayComponents.Field label='Role' value='Administrator' />
            <SideTrayComponents.Field label='Status' value='Active' />
          </SideTrayComponents.Section>

          <SideTrayComponents.Divider />

          <SideTrayComponents.Section title='Edit Information'>
            <SideTrayComponents.Input
              label='Display Name'
              value='John Doe'
              placeholder='Enter display name'
            />
            <SideTrayComponents.Input
              label='Phone Number'
              value='+1 (555) 123-4567'
              placeholder='Enter phone number'
              type='tel'
            />
            <SideTrayComponents.Input
              label='Notes'
              placeholder='Add notes...'
              multiline
              rows={4}
            />
          </SideTrayComponents.Section>
        </Stack>
      </SidePanel>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { SidePanel, SideTrayComponents } = horizonContext.ui.templates;
const [open, setOpen] = useState(false);

<Button variant="contained" onClick={() => setOpen(true)}>Open Side Panel</Button>

<SidePanel
  title="User Details"
  open={open}
  onClose={() => setOpen(false)}
  width="lg"
  footer={<Button onClick={() => setOpen(false)}>Save Changes</Button>}
>
  <Stack spacing={3}>
    <SideTrayComponents.UserCard name="John Doe" subtitle="john.doe@example.com" />
    <SideTrayComponents.Divider />
    <SideTrayComponents.Section title="Basic Information">
      <SideTrayComponents.Field label="Full Name" value="John Doe" />
      <SideTrayComponents.Field label="Email" value="john.doe@example.com" />
    </SideTrayComponents.Section>
  </Stack>
</SidePanel>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User details, device configuration, editing forms (e.g.,
        Edit User panel, Device Settings, Call Log Details)
      </Typography>
    </Paper>
  );
}
