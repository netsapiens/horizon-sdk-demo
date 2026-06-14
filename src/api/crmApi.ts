/**
 * Device API helper for the demo.
 *
 * Fetches the signed-in user's registered devices from the NetSapiens v2 API
 * through the SDK's authenticated `horizonContext.api` proxy and normalizes them
 * for the Hardphone Devices page.
 */
import type { HorizonApiClient } from '@netsapiens/horizon-sdk';

/** Raw NetSapiens device record (subset of fields the demo reads). */
interface NetSapiensDevice {
  device: string;
  'device-sip-registration-user-agent'?: string;
  'device-sip-registration-ip-address'?: string;
  'device-provisioning-mac-address'?: string;
  'device-provisioning-line'?: string;
  'device-sip-registration-state'?: string;
}

/**
 * A hardphone normalized from a NetSapiens device record for display. NetSapiens
 * does not expose vendor/model/firmware as discrete fields — they are encoded in
 * the SIP user-agent string, so we parse them best-effort (see parseSipUserAgent).
 */
export interface LiveHardphone {
  device: string;
  vendor: string;
  model: string;
  firmware: string;
  registered: boolean;
  ipAddress: string;
  macAddress: string;
  line: string;
  userAgent: string;
}

/**
 * Best-effort parse of a SIP user-agent string into vendor / model / firmware.
 * Handles the common hardphone formats, e.g.:
 *   "Yealink SIP-T46U 66.86.0.15"        -> Yealink / T46U / 66.86.0.15
 *   "PolycomVVX-VVX_450-UA/7.3.2.0016"   -> Poly    / VVX 450 / 7.3.2.0016
 *   "Mitel 6869i/5.0.0.1008"             -> Mitel   / 6869i / 5.0.0.1008
 * Falls back to showing the raw user-agent as the model when it can't be parsed.
 */
export function parseSipUserAgent(ua?: string): {
  vendor: string;
  model: string;
  firmware: string;
} {
  if (!ua) return { vendor: 'Unknown', model: '—', firmware: '—' };

  const KNOWN_VENDORS = [
    'Yealink',
    'Polycom',
    'Poly',
    'Mitel',
    'Snom',
    'Cisco',
    'Grandstream',
  ];
  const vendorMatch = KNOWN_VENDORS.find((v) =>
    ua.toLowerCase().includes(v.toLowerCase()),
  );
  const vendor =
    vendorMatch === 'Polycom' ? 'Poly' : (vendorMatch ?? 'Unknown');

  // Firmware: first dotted version number (e.g. 7.3.2.0016 or 66.86.0.15).
  const firmware = ua.match(/\d+(?:\.\d+){2,}/)?.[0] ?? '—';

  // Model: strip vendor + firmware noise, then pick the most model-like token.
  const model =
    ua
      .replace(new RegExp(vendorMatch ?? '', 'i'), '')
      .replace(/SIP[-_]?/i, '')
      .replace(/[-_]?UA/i, '')
      .replace(/\d+(?:\.\d+){2,}.*$/, '')
      .replace(/[/_]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] ?? ua;

  return { vendor, model: model || '—', firmware };
}

/**
 * Fetch the signed-in user's registered devices from the NetSapiens v2 API and
 * normalize them for the Hardphone Devices page.
 *
 * NOTE: NetSapiens exposes devices per user over REST
 * (`GET /domains/{domain}/users/{user}/devices`). A domain-wide device list is
 * delivered over the platform's socket channel, not REST, so this demo shows the
 * current user's live devices and falls back to sample data otherwise.
 */
export async function fetchUserDevices(
  domain: string,
  userId: string,
  apiClient: HorizonApiClient,
): Promise<LiveHardphone[]> {
  if (!apiClient) throw new Error('API client is not defined');
  if (!domain) throw new Error('domain is required');
  if (!userId) throw new Error('userId is required');

  const path = `/domains/${domain}/users/${userId}/devices`;
  const devices = await apiClient.get<NetSapiensDevice[]>(path);

  return (devices ?? []).map((d) => {
    const userAgent = d['device-sip-registration-user-agent'] ?? '';
    const { vendor, model, firmware } = parseSipUserAgent(userAgent);
    return {
      device: d.device,
      vendor,
      model,
      firmware,
      registered: d['device-sip-registration-state'] === 'registered',
      ipAddress: d['device-sip-registration-ip-address'] ?? '—',
      macAddress: d['device-provisioning-mac-address'] ?? '—',
      line: String(d['device-provisioning-line'] ?? ''),
      userAgent,
    };
  });
}
