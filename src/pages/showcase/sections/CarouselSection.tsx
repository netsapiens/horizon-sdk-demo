/** Showcase section: CarouselTemplate (horizontally-rotating strip). */
import { useHorizonContext } from '@netsapiens/horizon-sdk';

import { CodeBlock } from '../../../components/CodeBlock';

const FEATURED = [
  {
    icon: 'mdi:rocket-launch',
    name: 'Horizon SDK Demo',
    note: 'Every extension surface',
  },
  {
    icon: 'mdi:account-sync',
    name: 'CRM Integration',
    note: 'Live CDRs + contact matching',
  },
  {
    icon: 'mdi:record-rec',
    name: 'Call Recordings',
    note: 'Filterable recording library',
  },
  {
    icon: 'mdi:palette',
    name: 'Component Showcase',
    note: 'The whole host kit',
  },
  {
    icon: 'mdi:chart-line',
    name: 'Call Analytics',
    note: 'Injected below Call Logs',
  },
  {
    icon: 'mdi:shield-check',
    name: 'Compliance',
    note: 'A gated form section',
  },
];

export default function CarouselSection() {
  const { ui } = useHorizonContext();
  const { Box, Typography, Stack, Paper, Divider, Chip } = ui || {};
  const { CarouselTemplate, Icon } = ui?.templates || {};
  if (!Paper || !Typography || !Stack || !Box || !CarouselTemplate) return null;

  const slide = (item: (typeof FEATURED)[number]) => (
    <Paper key={item.name} variant='outlined' sx={{ p: 2, height: '100%' }}>
      <Stack spacing={1}>
        {Icon ? <Icon name={item.icon} size={24} /> : null}
        <Typography variant='subtitle2' fontWeight={600}>
          {item.name}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {item.note}
        </Typography>
      </Stack>
    </Paper>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom>
        CarouselTemplate
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        A horizontally-rotating strip. Items are children, so a slide is
        whatever you make it — here each one is an outlined Paper.
      </Typography>

      <Stack spacing={4}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            With a title and an action
          </Typography>
          <CarouselTemplate
            title='Featured apps'
            action={Chip ? <Chip label='6 apps' size='small' /> : undefined}
            itemMinWidth={240}
            aria-label='Featured apps'
          >
            {FEATURED.map(slide)}
          </CarouselTemplate>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Auto-rotating, narrower items (
            <code>itemMinWidth=&#123;180&#125;</code>)
          </Typography>
          <CarouselTemplate
            autoRotate
            itemMinWidth={180}
            showDots
            aria-label='Auto-rotating featured apps'
          >
            {FEATURED.map(slide)}
          </CarouselTemplate>
        </Box>
      </Stack>

      {Divider && <Divider sx={{ my: 3 }} />}
      <CodeBlock>
        {`const { CarouselTemplate } = horizonContext.ui.templates;

// Slides are children — one per item, and a slide is whatever you render.
// itemMinWidth (px) drives how many fit per page at each breakpoint.
<CarouselTemplate
  title="Featured apps"
  action={<Chip label="6 apps" size="small" />}
  itemMinWidth={240}
  aria-label="Featured apps"        // REQUIRED — a scrolling region needs a name
>
  {apps.map((app) => (
    <AppCard key={app.id} app={app} />
  ))}
</CarouselTemplate>

// autoRotate: false (default) | true for the default dwell | milliseconds
<CarouselTemplate autoRotate={5000} showDots showArrows aria-label="Promotions">
  {promos.map((p) => <PromoCard key={p.id} promo={p} />)}
</CarouselTemplate>`}
      </CodeBlock>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: app galleries, featured/promoted rows, onboarding highlights
        — anywhere a horizontal row beats a vertical list
      </Typography>

      <Typography
        variant='caption'
        color='info.main'
        sx={{ mt: 2, display: 'block' }}
      >
        ♿ <strong>What it handles for you:</strong> auto-rotation pauses on
        hover <em>and</em> on keyboard focus,{' '}
        <code>prefers-reduced-motion</code> disables it outright, and the active
        dot is derived from scroll progress so a partial last page still lights
        the right one. These are the parts that are easy to get wrong and hard
        to catch in review, which is why the strip is a template rather than
        something each app rebuilds.
      </Typography>
    </Paper>
  );
}
