/** Showcase section: Checkbox. */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function CheckboxSection() {
  const { ui } = useHorizonContext();
  const { Checkbox, Typography, Stack, Paper, Divider } = ui || {};
  const [checked, setChecked] = useState(true);
  if (!Paper || !Typography || !Stack || !Checkbox) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Checkbox
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Boolean selection
      </Typography>

      <Stack spacing={1}>
        <Checkbox
          label='Checked'
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <Checkbox label='Unchecked' checked={false} onChange={() => {}} />
        <Checkbox label='Disabled' disabled />
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Checkbox } = horizonContext.ui;
const [checked, setChecked] = useState(true);

<Stack spacing={1}>
  <Checkbox
    label="Checked"
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
  />
  <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
  <Checkbox label="Disabled" disabled />
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Multi-select lists, feature toggles, permissions (e.g., bulk
        user selection, enable call recording, assign permissions)
      </Typography>
    </Paper>
  );
}
