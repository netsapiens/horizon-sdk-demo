/** Showcase section: ToggleButtonGroup (exclusive + multi-select). */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function ToggleButtonGroupSection() {
  const { ui } = useHorizonContext();
  const { ToggleButtonGroup, Box, Typography, Stack, Paper, Divider } =
    ui || {};
  const [toggleValue, setToggleValue] = useState('left');
  const [toggleMultiple, setToggleMultiple] = useState(['bold']);
  if (!Paper || !Typography || !Stack || !ToggleButtonGroup || !Box)
    return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        ToggleButtonGroup
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Toggle button groups
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Exclusive (single selection)
          </Typography>
          <ToggleButtonGroup
            value={toggleValue}
            exclusive
            onChange={(e, v) => v && setToggleValue(v)}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </Box>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Multi-select (non-exclusive)
          </Typography>
          <ToggleButtonGroup
            value={toggleMultiple}
            onChange={(e, v) => setToggleMultiple(v)}
            options={[
              { value: 'bold', label: 'Bold' },
              { value: 'italic', label: 'Italic' },
              { value: 'underline', label: 'Underline' },
            ]}
          />
        </Box>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { ToggleButtonGroup } = horizonContext.ui;
const [toggleValue, setToggleValue] = useState('left');

<ToggleButtonGroup
  value={toggleValue}
  exclusive
  onChange={(e, v) => v && setToggleValue(v)}
  options={[
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ]}
/>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: View switchers, filters (e.g., call log view toggle, date
        range selector, status filter)
      </Typography>
    </Paper>
  );
}
