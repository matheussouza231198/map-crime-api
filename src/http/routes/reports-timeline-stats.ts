import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import Elysia from 'elysia';
import z from 'zod/v4';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

const fetchOpenReports = (start: Date, end: Date) => {
  return db
    .select({
      date: sql<string>`DATE(${schema.reports.createdAt})`.as('date'),
      count: count(),
    })
    .from(schema.reports)
    .where(and(gte(schema.reports.createdAt, start), lt(schema.reports.createdAt, end)))
    .groupBy(sql`DATE(${schema.reports.createdAt})`);
};

const fetchResolvedReports = (start: Date, end: Date) => {
  return db
    .select({
      date: sql<string>`DATE(${schema.reports.completedAt})`.as('date'),
      count: count(),
    })
    .from(schema.reports)
    .where(
      and(
        gte(schema.reports.completedAt, start),
        lt(schema.reports.completedAt, end),
        eq(schema.reports.status, 'resolved'),
      ),
    )
    .groupBy(sql`DATE(${schema.reports.completedAt})`);
};

const buildDateMap = (start: Date, end: Date) => {
  const dateMap = new Map<string, { open: number; resolved: number }>();
  let currentDate = start;

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];

    dateMap.set(dateStr, { open: 0, resolved: 0 });
    currentDate = addDays(currentDate, 1);
  }

  return dateMap;
};

const populateOpenReports = (
  dateMap: Map<string, { open: number; resolved: number }>,
  openReports: Array<{ date: string; count: number }>,
) => {
  openReports.forEach((item) => {
    const existing = dateMap.get(item.date) || { open: 0, resolved: 0 };

    dateMap.set(item.date, { ...existing, open: item.count });
  });
};

const populateResolvedReports = (
  dateMap: Map<string, { open: number; resolved: number }>,
  resolvedReports: Array<{ date: string; count: number }>,
) => {
  resolvedReports.forEach((item) => {
    const existing = dateMap.get(item.date) || { open: 0, resolved: 0 };

    dateMap.set(item.date, { ...existing, resolved: item.count });
  });
};

const convertToTimeline = (dateMap: Map<string, { open: number; resolved: number }>) => {
  return Array.from(dateMap.entries())
    .map(([date, stats]) => ({
      date,
      open: stats.open,
      resolved: stats.resolved,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const DEFAULT_START_DATE = startOfDay(subDays(new Date(), 30));
const DEFAULT_END_DATE = endOfDay(new Date());

export const reportsTimelineStatsRoute = new Elysia().get(
  '/dashboard/reports-timeline',
  async ({ query }) => {
    const { startDate, endDate } = query;

    const openReports = await fetchOpenReports(startDate, endDate);
    const resolvedReports = await fetchResolvedReports(startDate, endDate);

    const dateMap = buildDateMap(startDate, endDate);

    populateOpenReports(dateMap, openReports);
    populateResolvedReports(dateMap, resolvedReports);

    const timeline = convertToTimeline(dateMap);

    return { timeline };
  },
  {
    query: z.object({
      startDate: z.coerce.date().default(DEFAULT_START_DATE),
      endDate: z.coerce.date().default(DEFAULT_END_DATE),
    }),
    detail: {
      tags: ['metrics'],
      description:
        'Get daily statistics of opened and resolved reports for a given date range. ' +
        'By default, returns data for the last 30 days.',
      summary: 'Reports timeline statistics',
    },
  },
);
