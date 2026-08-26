/**
 * Component Showcase — a visual reference for every shared MUI Aurora component
 * the host exposes via `horizonContext.ui`. Each component has its own
 * self-contained section under `showcase/sections/` (live demo + copy-paste
 * snippet + usage note); this page just lays them out in order inside the
 * host's PageTemplate. Sections render nothing if their components are
 * unavailable, so the page degrades gracefully.
 */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import {
  AlertSection,
  AvatarSection,
  ButtonsSection,
  CarouselSection,
  CheckboxSection,
  ChipSection,
  DataGridSection,
  IconButtonSection,
  LayoutSection,
  RadioGroupSection,
  RadioSection,
  SelectSection,
  SidePanelSection,
  SwitchSection,
  TabsSection,
  TextFieldSection,
  ToggleButtonGroupSection,
  TooltipSection,
  TypographySection,
} from './showcase/sections';

export default function ComponentShowcasePage({ ...marker }: ZoneMarkerProps) {
  const { ui } = useHorizonContext();
  const { PageTemplate } = ui?.templates || {};
  const { Stack } = ui || {};

  if (!PageTemplate || !Stack) {
    return (
      <div {...marker} style={{ padding: 24 }}>
        UI components not available
      </div>
    );
  }

  return (
    <PageTemplate
      {...marker}
      title='Component Showcase'
      subtitle='Visual reference for all available MUI Aurora shared components'
      breadcrumbs={[
        { label: 'Apps', url: '/apps' },
        { label: 'Component Showcase' },
      ]}
    >
      <Stack spacing={3}>
        <TypographySection />
        <ButtonsSection />
        <IconButtonSection />
        <TextFieldSection />
        <SelectSection />
        <CheckboxSection />
        <RadioSection />
        <RadioGroupSection />
        <SwitchSection />
        <ToggleButtonGroupSection />
        <TabsSection />
        <AlertSection />
        <ChipSection />
        <AvatarSection />
        <TooltipSection />
        <LayoutSection />
        <CarouselSection />
        <DataGridSection />
        <SidePanelSection />
      </Stack>
    </PageTemplate>
  );
}
