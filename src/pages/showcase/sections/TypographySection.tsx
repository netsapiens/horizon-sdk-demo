/** Showcase section: Typography variants. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { SectionCode } from '../SectionCode';

export default function TypographySection() {
  const { ui } = useHorizonContext();
  const { Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Typography
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Text components with MUI Aurora styling
      </Typography>

      <Stack spacing={2}>
        <Typography variant='h4'>Heading 4</Typography>
        <Typography variant='h5'>Heading 5</Typography>
        <Typography variant='h6'>Heading 6</Typography>
        <Typography variant='subtitle1'>Subtitle 1</Typography>
        <Typography variant='subtitle2'>Subtitle 2</Typography>
        <Typography variant='body1'>Body 1 - Default body text</Typography>
        <Typography variant='body2'>Body 2 - Smaller text</Typography>
        <Typography variant='caption' color='text.secondary'>
          Caption text
        </Typography>
      </Stack>

      <SectionCode>
        {`const { Typography } = horizonContext.ui;

<Stack spacing={2}>
  <Typography variant="h4">Heading 4</Typography>
  <Typography variant="h5">Heading 5</Typography>
  <Typography variant="h6">Heading 6</Typography>
  <Typography variant="subtitle1">Subtitle 1</Typography>
  <Typography variant="subtitle2">Subtitle 2</Typography>
  <Typography variant="body1">Body 1 - Default body text</Typography>
  <Typography variant="body2">Body 2 - Smaller text</Typography>
  <Typography variant="caption" color="text.secondary">
    Caption text
  </Typography>
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Page titles, section headers, descriptions (e.g., dashboard
        headings, form labels, card titles)
      </Typography>
    </Paper>
  );
}
