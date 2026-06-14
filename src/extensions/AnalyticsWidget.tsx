/**
 * Analytics Widget Extension
 * Computes call statistics from the live filtered rows published by DataTable.
 * No API calls — the data is already in memory from the page's own query.
 */
import type { ExtensionComponentProps } from '@netsapiens/horizon-sdk';
import { useMemo } from 'react';

// Shape of a CDR row as published by the call-logs DataTable
interface CdrRow {
  'call-total-duration-seconds'?: number;
  'call-start-datetime'?: string;
  'call-direction'?: number; // 1=inbound, 2=missed, 3=inter-company, -1=not-routed, 0=outbound
}

interface CallLogsPageContext {
  rows?: CdrRow[];
}

function fmtDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STAT_CONFIGS = [
  { key: 'totalCalls' as const, label: 'Total Calls', color: 'primary.main' },
  { key: 'avgDuration' as const, label: 'Avg Duration', color: 'success.main' },
  { key: 'peakHour' as const, label: 'Peak Hour', color: 'warning.main' },
  {
    key: 'successRate' as const,
    label: 'Success Rate',
    suffix: '%',
    color: 'secondary.main',
  },
] as const;

type StatKey = (typeof STAT_CONFIGS)[number]['key'];

export function AnalyticsWidget({ context }: ExtensionComponentProps) {
  const { Paper, Typography } = context.ui ?? {};
  const rows =
    (context.pageContext as CallLogsPageContext | undefined)?.rows ?? [];

  const stats = useMemo<Record<StatKey, string | number>>(() => {
    const n = rows.length;

    if (n === 0) {
      return {
        totalCalls: '—',
        avgDuration: '—',
        peakHour: '—',
        successRate: '—',
      };
    }

    // Average call duration
    const totalSecs = rows.reduce(
      (sum, r) => sum + (r['call-total-duration-seconds'] ?? 0),
      0,
    );
    const avgDuration = fmtDuration(totalSecs / n);

    // Peak hour — bucket by hour of call-start-datetime.
    // The API returns datetimes as "YYYY-MM-DDTHH:mm:ssZ[Timezone]" which is non-standard
    // ISO 8601 — strip the bracket timezone suffix before parsing (same as formatDate does).
    const hourCounts = new Array(24).fill(0) as number[];
    let parsedDateCount = 0;
    rows.forEach((r) => {
      if (r['call-start-datetime']) {
        const cleaned = r['call-start-datetime'].replace(/Z\[.+\]$/, '');
        const hour = new Date(cleaned).getHours();
        if (!isNaN(hour)) {
          hourCounts[hour]++;
          parsedDateCount++;
        }
      }
    });
    let peakHour = '—';
    if (parsedDateCount > 0) {
      const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
      const h12 = maxHour % 12 || 12;
      peakHour = `${h12}:00 ${maxHour < 12 ? 'AM' : 'PM'}`;
    }

    // Success rate — exclude missed (2) and not-routed (-1)
    const successful = rows.filter(
      (r) => r['call-direction'] !== 2 && r['call-direction'] !== -1,
    ).length;
    const successRate = Number(((successful / n) * 100).toFixed(1));

    return { totalCalls: n, avgDuration, peakHour, successRate };
  }, [rows]);

  if (!Paper || !Typography) return null;

  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2.5,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
        width: '100%',
        alignSelf: 'stretch',
      }}
    >
      {STAT_CONFIGS.map(({ key, label, color, suffix }) => (
        <Paper
          key={key}
          variant='outlined'
          sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}
        >
          <Typography variant='caption' color='text.secondary'>
            {label}
          </Typography>
          <Typography variant='h5' fontWeight={600} sx={{ color }}>
            {stats[key]}
            {suffix && stats[key] !== '—' ? suffix : ''}
          </Typography>
        </Paper>
      ))}
    </Paper>
  );
}
