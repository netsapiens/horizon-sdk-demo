/** Showcase section: RadioGroup (pre-built). */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

export default function RadioGroupSection() {
  const { ui } = useHorizonContext();
  const { RadioGroup, Typography, Stack, Paper, Divider } = ui || {};
  const [radioGroupValue, setRadioGroupValue] = useState('all');
  if (!Paper || !Typography || !Stack || !RadioGroup) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        RadioGroup
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Pre-built radio button group
      </Typography>

      <RadioGroup
        label='Preference'
        value={radioGroupValue}
        onChange={(e) => setRadioGroupValue(e.target.value)}
        options={[
          { value: 'all', label: 'All notifications' },
          { value: 'important', label: 'Important only' },
          { value: 'none', label: 'None' },
        ]}
      />

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { RadioGroup } = horizonContext.ui;
const [radioGroupValue, setRadioGroupValue] = useState('all');

<RadioGroup
  label="Preference"
  value={radioGroupValue}
  onChange={(e) => setRadioGroupValue(e.target.value)}
  options={[
    { value: 'all', label: 'All notifications' },
    { value: 'important', label: 'Important only' },
    { value: 'none', label: 'None' }
  ]}
/>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Settings panels, configuration forms (e.g., notification
        preferences, call routing options)
      </Typography>
    </Paper>
  );
}
