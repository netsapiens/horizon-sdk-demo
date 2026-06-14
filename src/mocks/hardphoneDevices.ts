/**
 * Hardphone device fixtures + status display maps for the Hardphone Devices
 * page. Sample devices are always shown so the page stays populated even when
 * the signed-in user has no live devices; the page tags them `source: 'sample'`
 * and prepends any live results from the NetSapiens v2 API.
 *
 * Assignments for internal extensions reference the shared `mocks/people.ts`
 * directory so names stay consistent with CRM enrichment.
 */
import { peopleByExtension } from './people';

export type DeviceStatus =
  | 'registered'
  | 'unregistered'
  | 'offline'
  | 'provisioning';

export interface HardphoneDevice {
  id: string;
  mac: string;
  model: string;
  vendor: string;
  status: DeviceStatus;
  ipAddress: string;
  assignedUser: string | null;
  assignedExtension: string | null;
  firmware: string;
  lastSeen: string;
  domain: string;
  /** Whether this row came from a live API call or the bundled sample set. */
  source: 'live' | 'sample';
}

/** Sample devices across two domains. Combined with live results at render. */
export const MOCK_DEVICES: Omit<HardphoneDevice, 'source'>[] = [
  {
    id: '1',
    mac: '00:A0:BB:12:34:56',
    model: 'T46U',
    vendor: 'Yealink',
    status: 'registered',
    ipAddress: '10.0.1.101',
    assignedUser: peopleByExtension['2001'].name,
    assignedExtension: '2001',
    firmware: '66.86.0.15',
    lastSeen: '2 minutes ago',
    domain: 'acme.corp',
  },
  {
    id: '2',
    mac: '00:A0:BB:22:AB:CD',
    model: 'T54W',
    vendor: 'Yealink',
    status: 'registered',
    ipAddress: '10.0.1.102',
    assignedUser: peopleByExtension['2002'].name,
    assignedExtension: '2002',
    firmware: '96.86.0.15',
    lastSeen: '5 minutes ago',
    domain: 'acme.corp',
  },
  {
    id: '3',
    mac: '00:90:4C:AB:CD:EF',
    model: 'VVX 450',
    vendor: 'Poly',
    status: 'offline',
    ipAddress: '10.0.1.115',
    assignedUser: peopleByExtension['2364'].name,
    assignedExtension: '2364',
    firmware: '7.3.2.0016',
    lastSeen: '3 hours ago',
    domain: 'acme.corp',
  },
  {
    id: '4',
    mac: '00:90:4C:11:22:33',
    model: 'VVX 350',
    vendor: 'Poly',
    status: 'unregistered',
    ipAddress: '—',
    assignedUser: null,
    assignedExtension: null,
    firmware: '6.4.6.0001',
    lastSeen: '2 days ago',
    domain: 'acme.corp',
  },
  {
    id: '5',
    mac: '08:00:0F:AB:12:78',
    model: '6869i',
    vendor: 'Mitel',
    status: 'provisioning',
    ipAddress: '10.0.1.130',
    assignedUser: peopleByExtension['3832'].name,
    assignedExtension: '3832',
    firmware: '5.0.0.1008',
    lastSeen: 'Just now',
    domain: 'acme.corp',
  },
  {
    id: '6',
    mac: '08:00:0F:CC:DD:EE',
    model: '6867i',
    vendor: 'Mitel',
    status: 'registered',
    ipAddress: '10.0.1.131',
    assignedUser: 'Sarah Johnson',
    assignedExtension: '3100',
    firmware: '5.0.0.1008',
    lastSeen: '1 minute ago',
    domain: 'globex.net',
  },
  {
    id: '7',
    mac: '00:04:13:77:88:99',
    model: 'D65',
    vendor: 'Snom',
    status: 'registered',
    ipAddress: '10.0.2.10',
    assignedUser: 'Mark Thompson',
    assignedExtension: '4001',
    firmware: '10.1.149.10',
    lastSeen: '10 minutes ago',
    domain: 'globex.net',
  },
  {
    id: '8',
    mac: '00:04:13:AA:BB:CC',
    model: 'D713',
    vendor: 'Snom',
    status: 'unregistered',
    ipAddress: '—',
    assignedUser: null,
    assignedExtension: null,
    firmware: '10.1.149.10',
    lastSeen: '5 days ago',
    domain: 'globex.net',
  },
];

/** MUI Chip color per status. */
export const STATUS_COLOR: Record<
  DeviceStatus,
  'success' | 'error' | 'warning' | 'default'
> = {
  registered: 'success',
  unregistered: 'default',
  offline: 'error',
  provisioning: 'warning',
};

/** Human label per status. */
export const STATUS_LABEL: Record<DeviceStatus, string> = {
  registered: 'Registered',
  unregistered: 'Unregistered',
  offline: 'Offline',
  provisioning: 'Provisioning',
};
