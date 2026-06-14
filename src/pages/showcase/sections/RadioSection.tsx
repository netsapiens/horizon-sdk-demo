/** Showcase section: Radio (single). */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function RadioSection() {
  const { ui } = useHorizonContext();
  const { Radio, Typography, Stack, Paper, Divider } = ui || {};
  const [radioValue, setRadioValue] = useState('option1');
  if (!Paper || !Typography || !Stack || !Radio) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        Radio
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Single selection
      </Typography>

      <Stack spacing={1}>
        <Radio
          label='Option 1'
          checked={radioValue === 'option1'}
          onChange={() => setRadioValue('option1')}
        />
        <Radio
          label='Option 2'
          checked={radioValue === 'option2'}
          onChange={() => setRadioValue('option2')}
        />
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { Radio } = horizonContext.ui;
const [radioValue, setRadioValue] = useState('option1');

<Stack spacing={1}>
  <Radio
    label="Option 1"
    checked={radioValue === 'option1'}
    onChange={() => setRadioValue('option1')}
  />
  <Radio
    label="Option 2"
    checked={radioValue === 'option2'}
    onChange={() => setRadioValue('option2')}
  />
</Stack>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Forms with exclusive choices, settings (e.g., payment method
        selection, notification preferences)
      </Typography>
    </Paper>
  );
}
