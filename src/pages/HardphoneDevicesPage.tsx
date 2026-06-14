/**
 * Hardphone Devices — a full management page registered into the host's
 * /manage navigation by this remote app.
 *
 * On load it makes a *live* NetSapiens v2 API call for the signed-in user's
 * devices via the SDK's authenticated client and shows them alongside the
 * bundled sample devices (`mocks/hardphoneDevices.ts`) so the page is never
 * empty. Device fixtures, status maps, and the detail drawer live in their own
 * modules; this file is the page composition + live-fetch wiring.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useHorizonContext, useLocale } from '@netsapiens/horizon-sdk';

import type { DeviceStatus, HardphoneDevice } from '../mocks/hardphoneDevices';
import { fetchUserDevices } from '../api/crmApi';
import {
  MOCK_DEVICES,
  STATUS_COLOR,
  STATUS_LABEL,
} from '../mocks/hardphoneDevices';
import DeviceDetailPanel from '../panels/DeviceDetailPanel';

/** How the live device fetch resolved — drives the status banner. */
type LiveStatus = 'loading' | 'live' | 'empty' | 'error';

export default function HardphoneDevicesPage() {
  const horizonContext = useHorizonContext();
  const { t } = useLocale();
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [selectedDevice, setSelectedDevice] = useState<HardphoneDevice | null>(
    null,
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [liveDevices, setLiveDevices] = useState<HardphoneDevice[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('loading');

  const { user, api } = horizonContext;

  // Live API call: fetch the signed-in user's registered devices from the
  // NetSapiens v2 API and prepend them to the sample set. Any failure (no
  // devices, permission denied, network) falls back to sample data so the page
  // is never empty during a demo.
  useEffect(() => {
    const userId = user?.extension;
    const domain = user?.domain;
    if (!api || !userId || !domain) {
      setLiveStatus('error');
      return;
    }

    let cancelled = false;
    setLiveStatus('loading');

    fetchUserDevices(domain, userId, api)
      .then((devices) => {
        if (cancelled) return;
        const mapped: HardphoneDevice[] = devices.map((d, i) => ({
          id: `live-${d.device || i}`,
          mac: d.macAddress,
          model: d.model,
          vendor: d.vendor,
          status: d.registered ? 'registered' : 'unregistered',
          ipAddress: d.ipAddress,
          assignedUser: user.displayName ?? userId,
          assignedExtension: userId,
          firmware: d.firmware,
          lastSeen: d.registered ? 'Just now' : '—',
          domain,
          source: 'live',
        }));
        setLiveDevices(mapped);
        setLiveStatus(mapped.length > 0 ? 'live' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          '[Demo App] Live device fetch failed — showing sample data.',
          err,
        );
        setLiveStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [api, user?.extension, user?.domain, user?.displayName]);

  const { PageTemplate, DatagridTemplate } = horizonContext.ui?.templates || {};
  const { Chip, Stack, Paper, Typography, ToggleButtonGroup, Divider, Alert } =
    horizonContext.ui || {};

  // Live devices first, then the bundled sample set (tagged here).
  const allDevices = useMemo<HardphoneDevice[]>(
    () => [
      ...liveDevices,
      ...MOCK_DEVICES.map((d) => ({ ...d, source: 'sample' as const })),
    ],
    [liveDevices],
  );

  const stats = useMemo(
    () => [
      {
        label: 'Total Devices',
        value: allDevices.length,
        color: 'primary.main',
      },
      {
        label: 'Registered',
        value: allDevices.filter((d) => d.status === 'registered').length,
        color: 'success.main',
      },
      {
        label: 'Offline',
        value: allDevices.filter((d) => d.status === 'offline').length,
        color: 'error.main',
      },
      {
        label: 'Unregistered',
        value: allDevices.filter((d) => d.status === 'unregistered').length,
        color: 'text.secondary',
      },
      {
        label: 'Provisioning',
        value: allDevices.filter((d) => d.status === 'provisioning').length,
        color: 'warning.main',
      },
    ],
    [allDevices],
  );

  const filteredDevices = useMemo(
    () =>
      statusFilter === 'all'
        ? allDevices
        : allDevices.filter((d) => d.status === statusFilter),
    [statusFilter, allDevices],
  );

  function simulateAction(action: string, device: HardphoneDevice) {
    setActionFeedback(`${action} sent to ${device.model} (${device.mac})`);
    setSelectedDevice(null);
    setTimeout(() => setActionFeedback(null), 3000);
  }

  if (
    !PageTemplate ||
    !DatagridTemplate ||
    !Stack ||
    !Paper ||
    !Typography ||
    !Chip
  ) {
    return <div style={{ padding: 24 }}>UI components not available</div>;
  }

  const columns = [
    { field: 'mac', headerName: 'MAC Address', width: 160 },
    { field: 'model', headerName: 'Model', width: 110 },
    { field: 'vendor', headerName: 'Vendor', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: { value: DeviceStatus }) => (
        <Chip
          label={STATUS_LABEL[params.value]}
          color={STATUS_COLOR[params.value]}
          size='small'
        />
      ),
    },
    { field: 'ipAddress', headerName: 'IP Address', width: 130 },
    {
      field: 'assignedUser',
      headerName: 'Assigned User',
      flex: 1,
      minWidth: 140,
    },
    {
      field: 'assignedExtension',
      headerName: 'Ext.',
      width: 70,
      // Custom renderCell only to handle null → em dash; no font override.
      renderCell: (params: { value: string | null }) => params.value ?? '—',
    },
    { field: 'domain', headerName: 'Domain', width: 120 },
    { field: 'firmware', headerName: 'Firmware', width: 120 },
    { field: 'lastSeen', headerName: 'Last Seen', width: 130 },
    {
      field: 'source',
      headerName: 'Source',
      width: 100,
      renderCell: (params: { value: 'live' | 'sample' }) =>
        params.value === 'live' ? (
          <Chip
            label='● Live'
            color='success'
            size='small'
            variant='outlined'
          />
        ) : (
          <Chip label='Sample' size='small' variant='outlined' />
        ),
    },
  ];

  const rowActions = [
    {
      label: 'View Details',
      icon: 'mdi:eye-outline',
      onClick: (row: HardphoneDevice) => setSelectedDevice(row),
    },
    {
      label: 'Reboot',
      icon: 'mdi:restart',
      onClick: (row: HardphoneDevice) => simulateAction('Reboot', row),
    },
    {
      label: 'Re-provision',
      icon: 'mdi:refresh',
      onClick: (row: HardphoneDevice) => simulateAction('Re-provision', row),
    },
    {
      label: 'Factory Reset',
      icon: 'mdi:restore',
      onClick: (row: HardphoneDevice) => simulateAction('Factory Reset', row),
      color: 'error' as const,
    },
  ];

  return (
    <PageTemplate
      title='Hardphone Device Management'
      subtitle='Provision, monitor, and manage physical SIP phones across your UCaaS platform'
      breadcrumbs={[
        { label: t('MANAGE'), url: '/manage' },
        { label: 'Hardphone Devices' },
      ]}
    >
      <Stack spacing={3}>
        {/* Live data status — the page makes a real NetSapiens v2 API call for
            the signed-in user's devices and falls back to sample data. */}
        {Alert &&
          (liveStatus === 'live' ? (
            <Alert severity='success'>
              Loaded {liveDevices.length} live device
              {liveDevices.length === 1 ? '' : 's'} for{' '}
              <strong>
                {user?.extension}@{user?.domain}
              </strong>{' '}
              via{' '}
              <code>
                GET /domains/{user?.domain}/users/{user?.extension}/devices
              </code>
              . Sample devices are shown alongside them.
            </Alert>
          ) : liveStatus === 'loading' ? (
            <Alert severity='info'>
              Loading live devices from the NetSapiens v2 API…
            </Alert>
          ) : (
            <Alert severity='info'>
              No live devices for the current user — showing sample data. The
              page still calls{' '}
              <code>
                GET /domains/{'{domain}'}/users/{'{user}'}/devices
              </code>{' '}
              on load.
            </Alert>
          ))}

        {/* Stats row */}
        <Stack direction='row' spacing={2} flexWrap='wrap'>
          {stats.map((stat) => (
            <Paper
              key={stat.label}
              sx={{ p: 2, flex: '1 1 120px', minWidth: 100 }}
            >
              <Typography
                variant='h4'
                sx={{ color: stat.color, lineHeight: 1, mb: 0.5 }}
              >
                {stat.value}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Stack>

        {/* Device table — filterBar prop carries the status filter row.
            DatagridTemplate renders it above the grid, giving the host
            (and future table-filter-bar extension zones) a consistent slot. */}
        <DatagridTemplate
          data={filteredDevices}
          columns={columns}
          actions={rowActions}
          toolbar={{
            enableSearch: true,
            searchPlaceholder: 'Search MAC, model, vendor, user...',
            enableExport: true,
            enableFilter: true,
            enableColumns: true,
          }}
          defaultPageSize={10}
          filterBar={
            ToggleButtonGroup ? (
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                flexWrap='wrap'
              >
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={(
                    _e: React.SyntheticEvent,
                    v: DeviceStatus | 'all',
                  ) => v && setStatusFilter(v)}
                  options={[
                    { value: 'all', label: t('TIME_ALL') },
                    { value: 'registered', label: STATUS_LABEL.registered },
                    { value: 'offline', label: STATUS_LABEL.offline },
                    { value: 'unregistered', label: STATUS_LABEL.unregistered },
                    { value: 'provisioning', label: STATUS_LABEL.provisioning },
                  ]}
                />
                {actionFeedback && (
                  <Typography
                    variant='body2'
                    color='success.main'
                    sx={{ fontWeight: 500 }}
                  >
                    ✓ {actionFeedback}
                  </Typography>
                )}
              </Stack>
            ) : undefined
          }
        />

        {Divider && <Divider />}

        {/* Footer note */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            About this integration
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            This page is dynamically injected into the <strong>/manage</strong>{' '}
            navigation tree by a remote UCaaS application via the Horizon SDK.
            It demonstrates how a 3rd-party platform can surface hardphone
            device provisioning and lifecycle management without modifying the
            host application.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            On load, this page makes a <strong>live</strong> call to the
            NetSapiens v2 API through the SDK's authenticated client (
            <code>horizonContext.api</code>) to fetch the signed-in user's
            registered devices, and shows sample devices alongside them. A full
            domain-wide registration feed comes from the platform's socket
            channel rather than REST. Actions such as reboot, re-provision, and
            factory reset are simulated here; in production they would call your
            device-management endpoints or send TR-069/HTTPS commands to the
            phones.
          </Typography>
        </Paper>
      </Stack>

      {/* Device detail side panel */}
      {selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onAction={simulateAction}
        />
      )}
    </PageTemplate>
  );
}
