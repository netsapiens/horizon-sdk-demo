/**
 * Device detail drawer for the Hardphone Devices page. Renders the selected
 * device's info and lifecycle actions inside the host's shared SidePanel,
 * using the SideTrayComponents building blocks for a consistent look.
 */
import { useHorizonContext, useLocale } from '@netsapiens/horizon-sdk';

import type { HardphoneDevice } from '../mocks/hardphoneDevices';
import { STATUS_COLOR, STATUS_LABEL } from '../mocks/hardphoneDevices';

interface DeviceDetailPanelProps {
  device: HardphoneDevice;
  onClose: () => void;
  /** Fired for a lifecycle action (Reboot / Re-provision / Factory Reset). */
  onAction: (action: string, device: HardphoneDevice) => void;
}

export default function DeviceDetailPanel({
  device,
  onClose,
  onAction,
}: DeviceDetailPanelProps) {
  const horizonContext = useHorizonContext();
  const { t } = useLocale();

  const { SidePanel, SideTrayComponents } = horizonContext.ui?.templates || {};
  const { Button, Chip, Stack, IconButton } = horizonContext.ui || {};

  if (!SidePanel || !SideTrayComponents || !Stack || !Chip) return null;

  return (
    <SidePanel
      title={`${device.vendor} ${device.model}`}
      subtitle={device.mac}
      icon={IconButton && <IconButton icon='mdi:deskphone' iconSize={20} />}
      open
      onClose={onClose}
      width='lg'
      footer={
        Button ? (
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='outlined' color='primary' onClick={onClose}>
              {t('CANCEL')}
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => onAction('Reboot', device)}
            >
              Reboot
            </Button>
          </Stack>
        ) : undefined
      }
    >
      <Stack spacing={3}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip
            label={STATUS_LABEL[device.status]}
            color={STATUS_COLOR[device.status]}
            size='small'
          />
          {Button && (
            <>
              <Button
                variant='outlined'
                color='primary'
                onClick={() => onAction('Re-provision', device)}
              >
                Re-provision
              </Button>
              <Button
                variant='outlined'
                color='error'
                onClick={() => onAction('Factory Reset', device)}
              >
                Factory Reset
              </Button>
            </>
          )}
        </Stack>

        <SideTrayComponents.Divider />

        <SideTrayComponents.Section title={t('DEVICES')}>
          <SideTrayComponents.Field label='MAC Address' value={device.mac} />
          <SideTrayComponents.Field label='Model' value={device.model} />
          <SideTrayComponents.Field label='Vendor' value={device.vendor} />
          <SideTrayComponents.Field label='Firmware' value={device.firmware} />
          <SideTrayComponents.Field
            label='IP Address'
            value={device.ipAddress}
          />
          <SideTrayComponents.Field label='Last Seen' value={device.lastSeen} />
        </SideTrayComponents.Section>

        <SideTrayComponents.Divider />

        <SideTrayComponents.Section title='Assignment'>
          <SideTrayComponents.Field
            label='Assigned User'
            value={device.assignedUser ?? 'Unassigned'}
          />
          <SideTrayComponents.Field
            label='Extension'
            value={device.assignedExtension ?? '—'}
          />
          <SideTrayComponents.Field label={t('DOMAIN')} value={device.domain} />
        </SideTrayComponents.Section>
      </Stack>
    </SidePanel>
  );
}
