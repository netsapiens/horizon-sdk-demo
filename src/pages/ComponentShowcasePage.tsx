/**
 * Component Showcase — the visual reference for everything the host hands over
 * on `horizonContext.ui`, and the page a partner developer is pointed at first.
 *
 * Each component has its own self-contained section under `showcase/sections/`
 * (live demo + copy-paste snippet + a note on where the host itself uses it);
 * this file is only the running order. The sections are grouped rather than
 * listed flat, because the page is long enough that a reader needs to know
 * whether they are still in "things you type into" or have reached "things that
 * draw data" — and because the groups are the shape of the kit itself.
 *
 * Every section renders nothing when its components are missing, so an older
 * host that predates a component simply shows a shorter page instead of a
 * broken one. That is the same guard partner code should use, demonstrated at
 * page scale.
 */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import {
  ActivityListSection,
  AlertSection,
  AvatarSection,
  ButtonsSection,
  CardSection,
  CarouselSection,
  ChartSection,
  CheckboxSection,
  ChipSection,
  DataGridSection,
  GroupHeading,
  IconButtonSection,
  IntroSection,
  LayoutSection,
  ListSection,
  RadioGroupSection,
  RadioSection,
  SearchFieldSection,
  SelectSection,
  SidePanelSection,
  StatBlockSection,
  SwitchSection,
  TableSection,
  TabsSection,
  TemplatesSection,
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
      subtitle='Every shared component the host hands your app, with the code to use it'
      breadcrumbs={[
        { label: 'Apps', url: '/apps' },
        { label: 'Component Showcase' },
      ]}
    >
      <Stack spacing={3}>
        <IntroSection />

        <GroupHeading
          title='Foundations'
          blurb='Text, surfaces and the layout primitives everything else sits on.'
        />
        <TypographySection />
        <LayoutSection />
        <CardSection />

        <GroupHeading
          title='Inputs'
          blurb='Controls a user types into, picks from, or toggles.'
        />
        <ButtonsSection />
        <IconButtonSection />
        <TextFieldSection />
        <SearchFieldSection />
        <SelectSection />
        <CheckboxSection />
        <RadioSection />
        <RadioGroupSection />
        <SwitchSection />
        <ToggleButtonGroupSection />

        <GroupHeading
          title='Feedback & navigation'
          blurb='Telling the user what happened, what something is, and where they are.'
        />
        <AlertSection />
        <ChipSection />
        <AvatarSection />
        <TooltipSection />
        <TabsSection />

        <GroupHeading
          title='Data display'
          blurb='Components that draw your data. These are also what dashboard widgets are built from, which is why they match the native cards exactly.'
        />
        <ListSection />
        <TableSection />
        <ChartSection />
        <StatBlockSection />
        <ActivityListSection />

        <GroupHeading
          title='Templates'
          blurb='Whole page and panel shells on ui.templates — the fastest route to a page that looks native, the host owns the layout and you own only the content.'
        />
        <TemplatesSection />
        <DataGridSection />
        <CarouselSection />
        <SidePanelSection />
      </Stack>
    </PageTemplate>
  );
}
