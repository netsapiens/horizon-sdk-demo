# DatagridTemplate — data tables in your app

`horizonContext.ui.templates.DatagridTemplate` is the table surface for extension
apps. It wraps the same grid Horizon's own pages use, so your table matches the
host's look and behaviour without your app shipping MUI.

Types: `DatagridTemplateProps`, `DatagridColumn`, `DatagridAction`,
`DatagridToolbarConfig` — all exported from `@netsapiens/horizon-sdk`.

> **Read [Page layout](#page-layout) first.** The most common cause of "my app
> doesn't look native" is rebuilding search, rows-per-page, pagination, or the
> primary action button by hand when the template already provides them — styled
> to match, for free.

## What you get for free

Everything below is built in — you do not wire any of it up:

- Quick-filter search, MUI filter panel with an active-filter badge
- CSV export (respects `valueFormatter` / `valueGetter` / `exportValue`, exports
  only filtered + visible rows) with a pre-export options dialog
- Column show/hide, plus **per-user persisted column order and width**, saved
  server-side and restored on next visit
- Autosize-to-content on first load; user-resizable and reorderable columns
- Row actions column (icon buttons with tooltips, conditional visibility/disable)
- Pagination footer: row count, rows-per-page selector, first/prev/next/last
- Auto-tooltips on truncated cell text; `headerName` and action `label` run
  through the host translator
- Extension zones — other apps can contribute columns and toolbar/filter/row-action
  content into your table

## Page layout

A native Horizon list page has a fixed anatomy. `PageTemplate` owns the top two
bands, `DatagridTemplate` owns the rest:

```text
┌──────────────────────────────────────────────────────────────┐
│ Manage / Domains                        ← PageTemplate       │
│ Domains  ⟨chip⟩                      [ + Add Domain ]        │  breadcrumbs,
│ optional subtitle                                            │  title, actions
├──────────────────────────────────────────────────────────────┤
│ ⌕ Search…                    [Export] [Filter] [Columns ⌄]   │ ← toolbar
├──────────────────────────────────────────────────────────────┤
│ ☐ │ Name        │ Description   │ Reseller    │ …            │ ← columns
│ ☐ │ acme_inc    │ Acme Inc.     │ partner_a   │ …            │   + rows
├──────────────────────────────────────────────────────────────┤
│ Showing 1–25 out of 800    Rows per page: 25 ⌄  ‹ 1 2 3 › ›› │ ← footer
└──────────────────────────────────────────────────────────────┘
```

Everything except your columns and your own domain-specific filters is supplied.
**Do not rebuild these** — a hand-rolled version will not match the host's
styling, and you will end up with two of each control on the same screen:

| You want                        | Use this                                                  | Do NOT                                                                                                                           |
| ------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A search box                    | `toolbar.enableSearch: true`                              | Your own `TextField` — the host's is a rounded filled field with a magnifier adornment, a plain outlined input will look foreign |
| The primary action button       | `PageTemplate`'s `actions` prop                           | A `Button` in `toolbar.customControls` — it belongs in the header, top-right                                                     |
| Rows-per-page / page arrows     | Nothing — the footer has them                             | Your own `Select` + arrows above the table                                                                                       |
| A row count ("1–25 of 75")      | Nothing — the footer shows it                             | Your own counter chip                                                                                                            |
| Export / Filter / Column picker | `toolbar.enableExport` / `enableFilter` / `enableColumns` | Hand-rolled menus                                                                                                                |
| App-specific filters            | `toolbar.customControls` or `filterBar`                   | — this _is_ the right slot for these                                                                                             |

`toolbar.customControls` is for controls the host cannot know about: a date-range
picker, a "show deleted" checkbox, a scope selector. It is not a general-purpose
header, and crowding it with a search field, a page-size selector, and a primary
button is what makes an extension page read as non-native.

### Putting the action button in the header

`PageTemplate`'s `actions` takes an **array of descriptors**, not JSX — passing a
node throws `actions.map is not a function`, and working around that by moving the
button into the table toolbar is the usual reason a primary action ends up in the
wrong place.

```tsx
<PageTemplate
  title='Inbox'
  subtitle='Faxes received on your assigned numbers'
  breadcrumbs={[{ label: 'Apps', url: '/apps' }, { label: 'SecureFax' }]}
  actions={[
    {
      label: 'Compose a fax',
      icon: 'mdi:plus',
      variant: 'primary', // 'primary' | 'secondary' | 'danger'
      onClick: () => setComposeOpen(true),
    },
  ]}
>
  <DatagridTemplate /* … */ />
</PageTemplate>
```

`variant: 'primary'` renders the filled blue button in the header's top-right,
matching "+ Add Domain" on native pages. For non-button header content (status
chips, a live badge) use `headerStatus`, which accepts arbitrary JSX.

## Quick start

```tsx
import { useHorizonContext } from '@netsapiens/horizon-sdk';

export default function DevicesPage() {
  const { ui } = useHorizonContext();
  const { DatagridTemplate } = ui?.templates ?? {};
  if (!DatagridTemplate) return null;

  return (
    <DatagridTemplate
      data={devices}
      columns={[
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'mac', headerName: 'MAC Address', width: 160 },
        { field: 'model', headerName: 'Model', width: 140 },
        { field: 'status', headerName: 'Status', width: 120 },
      ]}
      actions={[
        { label: 'Edit', icon: 'mdi:pencil', onClick: (row) => edit(row) },
        {
          label: 'Delete',
          icon: 'mdi:delete',
          color: 'error',
          onClick: (row) => remove(row),
          disabled: (row) => row.locked,
        },
      ]}
      toolbar={{
        enableSearch: true,
        enableFilter: true,
        enableColumns: true,
        enableExport: true,
        enableRefresh: true,
        onRefresh: refetch,
      }}
      getRowId={(row) => row.id}
      loading={isLoading}
      defaultPageSize={25}
      pageSizeOptions={[15, 25, 50, 100]}
      height='calc(100vh - 320px)'
    />
  );
}
```

`data` is generic — `TRow` is inferred from it, so `row` is typed inside
`onClick`, `renderCell`, `getRowId`, and friends.

## Pagination

**The footer is always rendered.** There is no prop that hides it. If it appears
to be missing, it is one of the four causes below — in rough order of how often
they come up.

### 1. `height` is unset, so the footer is below the fold

The default is the host's `calc(100vh - 377px)` — an offset tuned to the _host's_
page chrome. Your app renders its own heading, description, or cards above the
grid, and every pixel of that pushes the bottom of the grid (and therefore the
footer) further down. The grid still works; the pagination is simply off-screen.

**Always pass an explicit `height`** when the grid is not the first thing on the
page:

```text
height="520px"                  → fixed
height="60vh"                   → viewport-relative
height="calc(100vh - 320px)"    → viewport minus your own chrome
```

### 2. `height="auto"` collapses the grid

The grid runs with MUI's `autoHeight` disabled, so an auto-height parent gives it
nothing to measure and it collapses to zero — no rows, no footer. Never pass
`'auto'`. If you want the grid to size to a container, give that container a real
height and pass `height="100%"`.

### 3. Fewer rows than `defaultPageSize`

With 5 rows and `defaultPageSize={25}` there is exactly one page, so every page
arrow is correctly disabled and the rows-per-page selector has nothing to change.
This reads as "pagination is broken" but is working as intended. Test against
realistic row counts.

### 4. Expecting server-side pagination

Pagination is **client-side over the `data` array you pass**. There is no
`paginationMode`, `rowCount`, `page`, or `onPaginationModelChange` — those props
do not exist at any layer, including the host's `DataTable`.

For large datasets, fetch the pages yourself and hand over the accumulated rows,
then pass `infiniteLoading` so the footer reports progress instead of a total that
keeps jumping:

```tsx
<DatagridTemplate
  data={allRowsLoadedSoFar}
  infiniteLoading={{ totalCount, progress, isLoadingAny }}
  height='calc(100vh - 320px)'
  /* … */
/>
```

`totalCount` is the real total, `progress` is 0–100, and `isLoadingAny` is true
while any page is in flight.

## Columns

`DatagridColumn` mirrors the subset of MUI X `GridColDef` the shared DataTable
understands, and its index signature passes any other GridColDef key straight
through — so `type`, `valueOptions`, and similar all work.

```tsx
columns={[
  // Plain value — auto-wrapped in a tooltip when it overflows
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },

  // Typed column: gives the filter panel the right operators and editor
  { field: 'seats', headerName: 'Seats', type: 'number', width: 100 },
  { field: 'enabled', headerName: 'Enabled', type: 'boolean', width: 110 },
  {
    field: 'tier',
    headerName: 'Tier',
    type: 'singleSelect',
    valueOptions: ['Bronze', 'Silver', 'Gold'],
    width: 130,
  },

  // Custom cell + an export-friendly text form of the same data
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: ({ row }) => <StatusChip value={row.status} />,
    exportValue: ({ row }) => (row.status === 'up' ? 'Online' : 'Offline'),
  },

  // Derived value — sorts and filters on the computed result
  {
    field: 'fullName',
    headerName: 'Name',
    flex: 1,
    valueGetter: ({ row }) => `${row.first} ${row.last}`,
  },

  { field: 'internal', headerName: 'Internal ID', disableExport: true },
]}
```

Set a `type` whenever a column is not free text. Without it the filter panel
offers string operators for numeric and boolean data, which is the most common
column-definition mistake.

## Actions

```tsx
actions={[
  {
    label: 'Edit',
    icon: 'mdi:pencil',              // any Iconify code
    onClick: (row) => edit(row),
  },
  {
    label: 'Delete',
    icon: 'mdi:delete',
    color: 'error',
    onClick: (row) => remove(row),
    visible: (row) => row.canDelete,          // hide per row
    disabled: (row) => row.inUse,             // disable per row
    getTooltip: (row) =>                      // overrides `label`
      row.inUse ? 'In use by an active call' : 'Delete',
  },
]}
```

Use `getTooltip` to explain _why_ an action is disabled — a disabled icon button
with no explanation is the most common usability complaint on these tables.

## Toolbar

```tsx
toolbar={{
  enableSearch: true,
  searchPlaceholder: 'Search devices…',
  enableFilter: true,
  showFilterBadge: true,      // default true
  enableColumns: true,
  enableExport: true,
  exportFilename: 'devices',
  enableExportDialog: true,   // default true; false exports immediately
  enableRefresh: true,
  onRefresh: refetch,
  refreshing: isFetching,
  customControls: <DateRangePicker … />,   // inline with search
  customActions: <ViewToggle … />,         // right group, left of Filter
  toolbarPosition: 'top',                  // 'none' hides the toolbar
}}
```

`filterBar` is also accepted as a top-level prop (equivalent to
`toolbar.filterBar`) for status chips and `table-filter-bar` zone content.

## Selection and export

```tsx
<DatagridTemplate
  enableCheckboxSelection
  onSelectionChange={(rows) => setSelected(rows)}
  getRowId={(row) => row.id}
  /* … */
/>
```

**Set `getRowId` unless your rows have an `id` field.** Selection, export of
selected rows, and detail panels all resolve rows through it; without it they
silently misbehave.

## Persisted column layout

Column visibility, order, and widths are saved per user, keyed off the grid's
zone id. If one page swaps between two different column sets, give each set its
own `columnVisibilityVariant` so their saved choices don't overwrite each other:

```tsx
<DatagridTemplate
  key={simpleView ? 'simple' : 'detailed'}
  columns={simpleView ? simpleColumns : detailedColumns}
  columnVisibilityVariant={simpleView ? 'simple' : undefined}
  /* … */
/>
```

## Interop with other extension apps

- `dynamicColumnsZone="<zone-id>"` lets other federated apps contribute columns
  to your table (they participate fully in sorting, filtering, and export).
- `pageContext={memoizedObject}` merges state into the shared page-context store
  so other apps' extensions can read it. Memoize it, or it re-publishes every
  render.

## Hierarchy and detail panels

```tsx
// Tree data
<DatagridTemplate treeData getTreeDataPath={(row) => row.path} defaultGroupingExpansionDepth={-1} />

// Master-detail
<DatagridTemplate
  getDetailPanelContent={({ row }) => <DeviceDetail id={row.id} />}
  getDetailPanelHeight={() => 'auto'}
/>
```

`defaultGroupingExpansionDepth`: `-1` expands all, `0` collapses all.

## Not available

- **`apiRef`** — withheld deliberately. It returns a grid API object belonging to
  the host's own MUI instance, which your app cannot construct or type (you ship no
  MUI). Nothing is lost: the column autosize, resize, reorder, layout persistence,
  and export features it drives are all handled internally and are on by default.
- **Server-side pagination** — see [Pagination](#pagination).
- **Density selector** — not exposed. Use `rowHeight` or `getRowHeight` instead.

## Version notes

`DatagridTemplateProps` mirrors the host grid's prop surface. If you are on an
older SDK release and a prop documented here is missing from the types, upgrade
`@netsapiens/horizon-sdk` — the prop very likely already works at runtime and was
simply not declared yet. Props added to the host grid appear in the package on its
next release.

This guide is published in two places, kept identical: here, and inside the
installed package at `node_modules/@netsapiens/horizon-sdk/DATAGRID.md`. If they
ever disagree, the copy in the package matches the version you have installed.
