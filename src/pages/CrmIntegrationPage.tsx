/**
 * CRM Integration — a full page registered into the host's Manage menu by this
 * remote app (parentPath '/manage', placed after Call Logs), proving the Manage
 * tree can be extended, not just /apps. It does something the host can't do
 * natively: surface a third-party CRM next to the user's NetSapiens telephony
 * data.
 *
 *   - apiProxy  — the recent-call list is fetched live from the NetSapiens v2
 *                 API through horizonContext.api; credentials never reach this
 *                 remote app.
 *   - CRM match — selecting a call resolves the caller in the (mock) CRM — the
 *                 same directory that powers the CallerInfoWidget — so the page
 *                 reuses one source of truth.
 *
 * CRM data is mock for now. Authenticating to a real CRM backend on behalf of
 * the Horizon user is the remoteAuth flow — demonstrated standalone on the
 * "Remote Auth" tab — and can gate this page's CRM pane later.
 *
 * As with the rest of the demo, the live call falls back to sample data so the
 * page is never empty.
 */
import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useHorizonContext, useLocale } from '@netsapiens/horizon-sdk';

import type { RecentCall } from '../mocks/recentCalls';
import { fetchRecentCalls } from '../api/callsApi';
import { lookupCrmRecord, normalizePhoneNumber } from '../mocks/crm';
import { formatDuration, SAMPLE_RECENT_CALLS } from '../mocks/recentCalls';

const VENDOR_NAME = 'Acme CRM';
/**
 * Where the vendor CRM lives. A real integration would deep-link to the matched
 * contact in your CRM; this demo opens an illustrative per-contact URL.
 */
const VENDOR_CRM_BASE_URL = 'https://app.acmecrm.example';

/** How the live CDR fetch resolved — drives the apiProxy status banner. */
type LiveStatus = 'loading' | 'live' | 'empty' | 'error';

export default function CrmIntegrationPage() {
  const horizonContext = useHorizonContext();
  const { t } = useLocale();
  const { user, api } = horizonContext;

  // apiProxy: the signed-in user's recent calls from the NetSapiens v2 API.
  const [liveCalls, setLiveCalls] = useState<RecentCall[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.extension;
    const domain = user?.domain;
    if (!api || !userId || !domain) {
      setLiveStatus('error');
      return;
    }
    let cancelled = false;
    setLiveStatus('loading');
    fetchRecentCalls(domain, userId, api)
      .then((calls) => {
        if (cancelled) return;
        setLiveCalls(calls);
        setLiveStatus(calls.length > 0 ? 'live' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          '[Demo App] Live call fetch failed — showing sample data.',
          err,
        );
        setLiveStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [api, user?.extension, user?.domain]);

  // Live calls first, then the bundled sample set.
  const allCalls = useMemo<RecentCall[]>(
    () => [...liveCalls, ...SAMPLE_RECENT_CALLS],
    [liveCalls],
  );

  // Default the selection to the first call once the list is known.
  useEffect(() => {
    if (!selectedId && allCalls.length) setSelectedId(allCalls[0].id);
  }, [allCalls, selectedId]);

  const selectedCall = allCalls.find((c) => c.id === selectedId) ?? null;
  const selectedRecord = selectedCall
    ? lookupCrmRecord(normalizePhoneNumber(selectedCall.party))
    : undefined;

  const { PageTemplate } = horizonContext.ui?.templates || {};
  const { Paper, Stack, Typography, Chip, Alert, Divider, Box, Button } =
    horizonContext.ui || {};

  if (!PageTemplate || !Paper || !Stack || !Typography || !Chip || !Box) {
    return <div style={{ padding: 24 }}>UI components not available</div>;
  }

  const callLabel = (c: RecentCall) => {
    const rec = lookupCrmRecord(normalizePhoneNumber(c.party));
    // CRM match wins; otherwise the API's friendly name; otherwise the number.
    return rec?.name ?? c.name ?? c.party;
  };

  return (
    <PageTemplate
      title={`${VENDOR_NAME} Integration`}
      subtitle="The signed-in user's NetSapiens calls, matched to their CRM record"
      breadcrumbs={[
        { label: t('MANAGE') || 'Manage', url: '/manage' },
        { label: `${VENDOR_NAME} Integration` },
      ]}
    >
      <Stack spacing={3}>
        {/* apiProxy status banner — the recent-call list is a live v2 API call. */}
        {Alert &&
          (liveStatus === 'live' ? (
            <Alert severity='success'>
              Loaded {liveCalls.length} live call
              {liveCalls.length === 1 ? '' : 's'} for{' '}
              <strong>
                {user?.extension}@{user?.domain}
              </strong>{' '}
              via{' '}
              <code>
                GET /domains/{user?.domain}/users/{user?.extension}/cdrs
              </code>
              . Sample calls are shown alongside them.
            </Alert>
          ) : liveStatus === 'loading' ? (
            <Alert severity='info'>
              Loading recent calls from the NetSapiens v2 API…
            </Alert>
          ) : (
            <Alert severity='info'>
              Showing sample calls. The page still calls{' '}
              <code>
                GET /domains/{'{domain}'}/users/{'{user}'}/cdrs
              </code>{' '}
              through <code>horizonContext.api</code> on load.
            </Alert>
          ))}

        {/* Master/detail: recent calls (NetSapiens) ↔ matched CRM record. */}
        <Stack
          direction='row'
          spacing={3}
          flexWrap='wrap'
          alignItems='flex-start'
        >
          {/* Left: recent calls */}
          <Paper
            sx={{ p: 0, flex: '1 1 360px', minWidth: 300, overflow: 'hidden' }}
          >
            <Typography
              variant='subtitle1'
              sx={{ px: 2, pt: 2, pb: 1, fontWeight: 600 }}
            >
              Recent calls · NetSapiens
            </Typography>
            {Divider && <Divider />}
            <Stack divider={Divider ? <Divider /> : undefined}>
              {allCalls.map((c) => {
                const isSel = c.id === selectedId;
                return (
                  <Box
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      bgcolor: isSel ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Stack
                      direction='row'
                      spacing={1.5}
                      alignItems='center'
                      sx={{ minWidth: 0 }}
                    >
                      <Typography component='span' sx={{ opacity: 0.6 }}>
                        {c.direction === 'outbound' ? '↑' : '↓'}
                      </Typography>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant='body2'
                          noWrap
                          sx={{ fontWeight: 500 }}
                        >
                          {callLabel(c)}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {c.timeLabel} ·{' '}
                          {c.answered
                            ? formatDuration(c.durationSeconds)
                            : 'missed'}
                        </Typography>
                      </Box>
                    </Stack>
                    {c.source === 'live' && (
                      <Chip
                        label='● Live'
                        color='success'
                        size='small'
                        variant='outlined'
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Paper>

          {/* Right: matched CRM record (mock data) */}
          <Paper sx={{ p: 3, flex: '1 1 320px', minWidth: 280 }}>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              sx={{ mb: 2 }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                Matched CRM record
              </Typography>
              <Chip label='Sample CRM data' size='small' variant='outlined' />
            </Stack>

            {selectedRecord ? (
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant='h6'>{selectedRecord.name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {selectedRecord.company}
                  </Typography>
                </Box>
                {Divider && <Divider />}
                <Field
                  label='Last contact'
                  value={selectedRecord.lastContact}
                  T={Typography}
                />
                <Field
                  label='Lifetime calls'
                  value={String(selectedRecord.callCount)}
                  T={Typography}
                />
                <Field
                  label='Notes'
                  value={selectedRecord.notes}
                  T={Typography}
                />
                {Button && (
                  <Button
                    variant='text'
                    sx={{ alignSelf: 'flex-start', px: 0 }}
                    onClick={() =>
                      window.open(
                        `${VENDOR_CRM_BASE_URL}/contacts/${encodeURIComponent(
                          normalizePhoneNumber(selectedCall?.party ?? ''),
                        )}`,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    Open in {VENDOR_NAME} ↗
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No CRM match for{' '}
                <strong>{selectedCall ? selectedCall.party : '—'}</strong>. In a
                real integration you'd offer to create the contact here.
              </Typography>
            )}
          </Paper>
        </Stack>

        {Divider && <Divider />}

        {/* Footer — what the SDK made possible on this page. */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            About this integration
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            This page is injected into the <strong>Manage</strong> menu (after
            Call Logs) by a remote app via the Horizon SDK — no host changes,
            and not limited to the Apps menu. It surfaces a third-party CRM{' '}
            <em>inside</em> Horizon, something the host doesn't do natively.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            The recent-call list is a live <code>horizonContext.api</code> call
            to the NetSapiens v2 API, proxied and audited by the host —
            credentials never reach this remote. Caller matching reuses the same
            mock CRM directory that powers the inbound-call widget. In a real
            integration, your app would authenticate to the CRM backend on
            behalf of the Horizon user via <code>auth.requestRemoteAuth</code>{' '}
            (see the <strong>Remote Auth</strong> tab) and pull live records
            instead of mock data.
          </Typography>
        </Paper>
      </Stack>
    </PageTemplate>
  );
}

/** One label/value row in the CRM record card. `T` is the host Typography. */
function Field({
  label,
  value,
  T,
}: {
  label: string;
  value: string;
  T: ComponentType<Record<string, unknown>>;
}) {
  return (
    <div>
      <T variant='caption' color='text.secondary'>
        {label}
      </T>
      <T variant='body2'>{value}</T>
    </div>
  );
}
