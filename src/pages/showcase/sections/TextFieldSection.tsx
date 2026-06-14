/** Showcase section: TextField. */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function TextFieldSection() {
  const { ui } = useHorizonContext();
  const { TextField, Typography, Stack, Paper, Divider } = ui || {};
  const [inputValue, setInputValue] = useState('');
  if (!Paper || !Typography || !Stack || !TextField) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        TextField
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Text input fields
      </Typography>

      <Stack spacing={2}>
        <TextField
          label='Basic Input'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
        />
        <TextField label='Required' required fullWidth />
        <TextField label='Disabled' disabled fullWidth />
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { TextField } = horizonContext.ui;
const [inputValue, setInputValue] = useState('');

<Stack spacing={2}>
  <TextField
    label="Basic Input"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    fullWidth
  />
  <TextField label="Required" required fullWidth />
  <TextField label="Disabled" disabled fullWidth />
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Forms, search bars, filters (e.g., user details form, device
        name input, search users)
      </Typography>
    </Paper>
  );
}
