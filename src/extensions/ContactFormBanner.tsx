/**
 * Contact Form Banner Extension
 * Demonstrates form-section-before zone
 * Shows contextual information at the top of contact forms
 */
import { type ExtensionComponentProps } from '@netsapiens/horizon-sdk';

export default function ContactFormBanner({
  context,
}: ExtensionComponentProps) {
  const { Alert, Stack, Typography } = context.ui ?? {};
  if (!Alert || !Stack || !Typography) return null;

  const pageContext = context.pageContext as {
    formType: string;
    mode: 'add' | 'edit';
    formData?: Record<string, unknown>;
  };

  const isEditMode = pageContext.mode === 'edit';
  const email = pageContext.formData?.email as string | undefined;

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Alert severity='info'>
        <Typography variant='body2' fontWeight={600}>
          CRM Integration Active
        </Typography>
        <Typography variant='body2'>
          {isEditMode
            ? 'Contact data will be synced with your CRM system on save.'
            : 'This contact will be automatically added to your CRM system.'}
        </Typography>
      </Alert>

      {isEditMode && email && (
        <Alert severity='success'>
          <Typography variant='body2' fontWeight={600}>
            Recent Activity
          </Typography>
          <Typography variant='body2'>
            Last contacted: 2 days ago • Total interactions: 12 • Last purchase:
            $1,250
          </Typography>
        </Alert>
      )}
    </Stack>
  );
}
