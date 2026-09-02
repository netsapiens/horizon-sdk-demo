/** Showcase section: Switch toggle. */
import { useState } from 'react';
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { SectionCode } from '../SectionCode';

export default function SwitchSection() {
  const { ui } = useHorizonContext();
  const { Switch, Typography, Stack, Paper } = ui || {};
  const [switchValue, setSwitchValue] = useState(true);
  if (!Paper || !Typography || !Stack || !Switch) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Switch
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Toggle on/off
      </Typography>

      <Stack spacing={1}>
        <Switch
          label='Enabled'
          checked={switchValue}
          onChange={(e) => setSwitchValue(e.target.checked)}
        />
        <Switch label='Disabled' disabled />
      </Stack>

      <SectionCode>
        {`const { Switch } = horizonContext.ui;
const [switchValue, setSwitchValue] = useState(true);

<Stack spacing={1}>
  <Switch
    label="Enabled"
    checked={switchValue}
    onChange={(e) => setSwitchValue(e.target.checked)}
  />
  <Switch label="Disabled" disabled />
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Settings, feature toggles (e.g., enable DND, activate
        voicemail, toggle dark mode)
      </Typography>
    </Paper>
  );
}
