# Device API helper

`crmApi.ts` fetches the signed-in user's registered devices from the NetSapiens
v2 API and normalizes them for the **Hardphone Devices** demo page. It calls the
API through the SDK's authenticated proxy (`horizonContext.api`) — credentials
never reach the remote app.

## Usage

```ts
import { fetchUserDevices } from './api/crmApi';

const { api, user } = horizonContext;

// GET /domains/{domain}/users/{user}/devices, normalized to LiveHardphone[]
const devices = await fetchUserDevices(user.domain, user.extension, api);
// [
//   {
//     device: 'sip:1001@acme.example',
//     vendor: 'Yealink',
//     model: 'T46U',
//     firmware: '66.86.0.15',
//     registered: true,
//     ipAddress: '10.0.1.101',
//     macAddress: '00:15:65:aa:bb:cc',
//     line: '1',
//     userAgent: 'Yealink SIP-T46U 66.86.0.15',
//   },
// ]
```

`HardphoneDevicesPage` calls this on mount and falls back to sample data if the
user has no live devices (or the call fails), so the page is never empty.

## Exports

| Export                                        | Kind     | Purpose                                                                  |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `fetchUserDevices(domain, userId, apiClient)` | function | Fetch + normalize the user's devices to `LiveHardphone[]`                |
| `parseSipUserAgent(ua)`                       | function | Best-effort parse of a SIP user-agent into `{ vendor, model, firmware }` |
| `LiveHardphone`                               | type     | A device normalized for display                                          |

## Why a user-agent parser?

NetSapiens devices don't expose vendor / model / firmware as discrete fields —
they're encoded in the SIP **user-agent** string (e.g. `Yealink SIP-T46U 66.86.0.15`).
`parseSipUserAgent` extracts them best-effort, falling back to the raw string as
the model when it can't confidently parse.

## Scope note

This helper is **per-user** because that's what the NetSapiens v2 REST API
exposes (`/domains/{domain}/users/{user}/devices`). A domain-wide device /
registration feed is delivered over the platform's socket channel rather than
REST, so it's out of scope for the SDK's REST `api` client.
