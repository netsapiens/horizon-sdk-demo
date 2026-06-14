# Mock fixtures

Static demo data — **not** real data and not fetched from any API. These modules
keep sample content out of the page/component files so those stay focused on UI.

| File                  | Used by                                       | What it is                                                                                                                             |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `people.ts`           | `crm.ts`, `hardphoneDevices.ts`               | Shared internal directory (extension → name/department). Single source of truth so the same person reads consistently across surfaces. |
| `crm.ts`              | `services/callEnrichment.ts`                  | CRM records (external callers + internal people) for enriching inbound calls, plus `normalizePhoneNumber` / `lookupCrmRecord`.         |
| `hardphoneDevices.ts` | `pages/HardphoneDevicesPage.tsx`              | Sample SIP phones + status display maps. Shown alongside any live devices fetched from the NetSapiens v2 API.                          |
| `datagridSample.ts`   | `pages/showcase/sections/DataGridSection.tsx` | Sample users for the DatagridTemplate example.                                                                                         |

> The only **live** data in the demo is the Hardphone Devices page's call to
> `GET /domains/{domain}/users/{user}/devices` via `horizonContext.api`.
