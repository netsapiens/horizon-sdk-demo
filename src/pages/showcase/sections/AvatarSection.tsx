/** Showcase section: Avatar. */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { SectionCode } from '../SectionCode';

export default function AvatarSection() {
  const { ui } = useHorizonContext();
  const { Avatar, Box, Icon, Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack || !Avatar || !Box) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Avatar
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Initials, a photo, or a fallback — in three sizes, and stacked into a
        group when several people share a row.
      </Typography>

      <Stack spacing={2.5}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Sizes
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Avatar sx={{ width: 24, height: 24, fontSize: 11 }}>JD</Avatar>
            <Avatar>JD</Avatar>
            <Avatar sx={{ width: 56, height: 56, fontSize: 22 }}>JD</Avatar>
          </Stack>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Colour and content
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Avatar sx={{ bgcolor: 'primary.main' }}>AB</Avatar>
            <Avatar sx={{ bgcolor: 'success.main' }}>CD</Avatar>
            <Avatar sx={{ bgcolor: 'warning.main' }}>EF</Avatar>
            {Icon ? (
              <Avatar sx={{ bgcolor: 'background.elevation3' }}>
                <Icon icon='mdi:account' />
              </Avatar>
            ) : null}
            <Avatar variant='rounded' sx={{ bgcolor: 'info.main' }}>
              GH
            </Avatar>
          </Stack>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Overlapping group
          </Typography>
          <Stack direction='row' sx={{ pl: 0.5 }}>
            {['JD', 'AB', 'CD', '+4'].map((initials, index) => (
              <Avatar
                key={initials}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  ml: index === 0 ? 0 : -1,
                  border: '2px solid',
                  borderColor: 'background.paper',
                  bgcolor: index === 3 ? 'background.elevation3' : undefined,
                }}
              >
                {initials}
              </Avatar>
            ))}
          </Stack>
        </Box>
      </Stack>

      <SectionCode>
        {`const { Avatar } = horizonContext.ui;

<Avatar>JD</Avatar>                                   // initials
<Avatar src={user.photo} alt={user.name}>JD</Avatar>  // photo, initials as fallback
<Avatar variant="rounded">GH</Avatar>                 // square-ish

// Size is width + height together, and the font has to come with them,
// or the initials stay 20px inside a 56px circle.
<Avatar sx={{ width: 56, height: 56, fontSize: 22 }}>JD</Avatar>

// Colour from a PALETTE PATH, never a hex — this follows a reseller's brand
// and the dark/light toggle for free.
<Avatar sx={{ bgcolor: 'primary.main' }}>AB</Avatar>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: user lists, profiles, contacts — call history, user
        management, the directory. Always give an avatar a name in text nearby
        or an <code>alt</code>: two initials on their own tell a screen reader
        nothing.
      </Typography>
    </Paper>
  );
}
