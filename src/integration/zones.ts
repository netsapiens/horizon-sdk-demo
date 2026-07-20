/**
 * Turns the declarative `zones.manifest.json` into registration-ready
 * descriptors, so `App.tsx` registers extensions by iterating the manifest
 * (the same manifest the Playwright suite asserts against) instead of
 * hand-writing each call. Adding/removing a zone extension is a manifest edit
 * plus a component entry in COMPONENTS below.
 */
import type { ComponentType } from 'react';

import { ActiveCallsRecordingFilter } from '../extensions/ActiveCallsRecordingFilter';
import { AnalyticsWidget } from '../extensions/AnalyticsWidget';
import { CallerInfoWidget } from '../extensions/CallerInfoWidget';
import ComplianceCheckbox from '../extensions/ComplianceCheckbox';
import ContactFormBanner from '../extensions/ContactFormBanner';
import { ExportButton } from '../extensions/ExportButton';
import { HeaderStatusBadge } from '../extensions/HeaderStatusBadge';
import { QuickActionButton } from '../extensions/QuickActionButton';
import { TableToolbarInfo } from '../extensions/TableToolbarInfo';
import { TopbarHelpButton } from '../extensions/TopbarHelpButton';
import manifestJson from './zones.manifest.json';
import { withZoneTestId } from './withZoneTestId';

interface ExtensionManifestEntry {
  id: string;
  zone: string;
  routes: string[];
  testId: string;
  priority?: number;
  requiredPermissions?: string[];
}
interface RouteManifestEntry {
  id: string;
  parentPath: string;
  path: string;
  fullPath: string;
  testId: string;
}
interface ColumnManifestEntry {
  id: string;
  zone: string;
  field: string;
  routes: string[];
  testId: string;
}
interface ZonesManifest {
  appId: string;
  webpackModule: string;
  remoteEntryUrl: string;
  extensions: ExtensionManifestEntry[];
  routes: RouteManifestEntry[];
  columns: ColumnManifestEntry[];
}

export const manifest = manifestJson as unknown as ZonesManifest;

// Manifest id -> the component that renders in that zone.
const COMPONENTS: Record<string, ComponentType> = {
  'demo-export-button': ExportButton,
  'demo-analytics-widget': AnalyticsWidget,
  'demo-quick-action': QuickActionButton,
  'demo-caller-info-widget': CallerInfoWidget,
  'demo-contact-form-banner': ContactFormBanner,
  'demo-compliance-checkbox': ComplianceCheckbox,
  'demo-active-calls-recording-filter': ActiveCallsRecordingFilter,
  'demo-header-status-badge': HeaderStatusBadge,
  'demo-table-toolbar-info': TableToolbarInfo,
  'demo-topbar-help': TopbarHelpButton,
};

export interface ExtensionRegistration {
  id: string;
  zone: string;
  routes: Array<{ pattern: string }>;
  component: ComponentType;
  priority?: number;
  requiredPermissions?: string[];
}

/** Registration-ready descriptors, each component wrapped with its zone testId. */
export const extensionRegistrations: ExtensionRegistration[] =
  manifest.extensions.map((e) => {
    const Component = COMPONENTS[e.id];
    if (!Component) {
      throw new Error(`zones.manifest.json: no component mapped for "${e.id}"`);
    }
    return {
      id: e.id,
      zone: e.zone,
      routes: e.routes.map((pattern) => ({ pattern })),
      component: withZoneTestId(Component, e.testId, e.zone),
      ...(e.priority !== undefined ? { priority: e.priority } : {}),
      ...(e.requiredPermissions
        ? { requiredPermissions: e.requiredPermissions }
        : {}),
    };
  });

/** testId for a full-page route, by manifest id (used to tag the page root). */
export function routeTestId(id: string): string {
  const testId = manifest.routes.find((r) => r.id === id)?.testId;
  if (!testId) throw new Error(`zones.manifest.json: no route testId for "${id}"`);
  return testId;
}

/** testId for a dynamic column, by manifest id (used to tag each cell). */
export function columnTestId(id: string): string {
  const testId = manifest.columns.find((c) => c.id === id)?.testId;
  if (!testId) throw new Error(`zones.manifest.json: no column testId for "${id}"`);
  return testId;
}
