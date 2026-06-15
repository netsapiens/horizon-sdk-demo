# Mock fixtures

Static demo data — **not** real data and not fetched from any API. These modules
keep sample content out of the page/component files so those stay focused on UI.

| File                | Used by                                                  | What it is                                                                                                                             |
| ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `people.ts`         | `crm.ts`                                                 | Shared internal directory (extension → name/department). Single source of truth so the same person reads consistently across surfaces. |
| `crm.ts`            | `services/callEnrichment.ts`, `pages/CrmIntegrationPage` | CRM records (external callers + internal people), plus `normalizePhoneNumber` / `lookupCrmRecord`.                                     |
| `recentCalls.ts`    | `pages/CrmIntegrationPage.tsx`                           | Sample recent calls keyed to the CRM directory, shown alongside the user's live calls. Includes `formatDuration`.                      |
| `datagridSample.ts` | `pages/showcase/sections/DataGridSection.tsx`            | Sample users for the DatagridTemplate example.                                                                                         |

> The only **live** data in the demo is the CRM Integration page's call to
> `GET /domains/{domain}/users/{user}/cdrs` via `horizonContext.api`.
