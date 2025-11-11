import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { and, count, eq, gte, lt } from 'drizzle-orm';
import Elysia from 'elysia';

type ReportsByStatus = Array<{
  status: string | null;
  count: number;
}>;

const calculateResolutionRate = (reportsData: ReportsByStatus) => {
  const total = reportsData.reduce((sum, item) => sum + item.count, 0);
  const resolved = reportsData
    .filter((item) => item.status === 'completed' || item.status === 'resolved')
    .reduce((sum, item) => sum + item.count, 0);

  return {
    total,
    resolved,
    rate: total > 0 ? (resolved / total) * 100 : 0,
  };
};

const getMonthDates = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return {
    currentMonthStart: new Date(currentYear, currentMonth, 1),
    nextMonthStart: new Date(currentYear, currentMonth + 1, 1),
    lastMonthStart: new Date(currentYear, currentMonth - 1, 1),
    lastMonthEnd: new Date(currentYear, currentMonth, 1),
  };
};

const fetchActiveUsers = async () => {
  const [result] = await db
    .select({ count: count() })
    .from(schema.users)
    .where(eq(schema.users.status, 'active'));

  return result?.count || 0;
};

const fetchTotalReports = async () => {
  const [result] = await db.select({ count: count() }).from(schema.reports);

  return result?.count || 0;
};

const fetchReportsByStatus = () => {
  return db
    .select({
      status: schema.reports.status,
      count: count(),
    })
    .from(schema.reports)
    .groupBy(schema.reports.status);
};

const fetchMonthReports = (startDate: Date, endDate: Date) => {
  return db
    .select({
      status: schema.reports.status,
      count: count(),
    })
    .from(schema.reports)
    .where(and(gte(schema.reports.createdAt, startDate), lt(schema.reports.createdAt, endDate)))
    .groupBy(schema.reports.status);
};

const buildResolutionComparison = (
  currentStats: ReturnType<typeof calculateResolutionRate>,
  lastStats: ReturnType<typeof calculateResolutionRate>,
  currentMonthStart: Date,
  lastMonthStart: Date,
) => {
  const rateDifference = currentStats.rate - lastStats.rate;
  const percentageChange = lastStats.rate > 0 ? (rateDifference / lastStats.rate) * 100 : null;

  return {
    currentMonth: {
      month: currentMonthStart.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      total: currentStats.total,
      resolved: currentStats.resolved,
      rate: Number(currentStats.rate.toFixed(2)),
    },
    lastMonth: {
      month: lastMonthStart.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      total: lastStats.total,
      resolved: lastStats.resolved,
      rate: Number(lastStats.rate.toFixed(2)),
    },
    difference: Number(rateDifference.toFixed(2)),
    percentageChange: percentageChange !== null ? Number(percentageChange.toFixed(2)) : null,
  };
};

const getMetrics = async () => {
  const { currentMonthStart, nextMonthStart, lastMonthStart, lastMonthEnd } = getMonthDates();

  const totalActiveUsers = await fetchActiveUsers();
  const totalReports = await fetchTotalReports();
  const reportsByStatus = await fetchReportsByStatus();

  const currentMonthReports = await fetchMonthReports(currentMonthStart, nextMonthStart);
  const lastMonthReports = await fetchMonthReports(lastMonthStart, lastMonthEnd);

  const currentMonthStats = calculateResolutionRate(currentMonthReports);
  const lastMonthStats = calculateResolutionRate(lastMonthReports);

  const resolutionRateComparison = buildResolutionComparison(
    currentMonthStats,
    lastMonthStats,
    currentMonthStart,
    lastMonthStart,
  );

  return {
    metrics: {
      totalActiveUsers,
      totalReports,
      reportsByStatus: reportsByStatus.reduce((acc, item) => {
        acc[item.status || 'unknown'] = item.count;

        return acc;
      }, {} as Record<string, number>),
      resolutionRateComparison,
    },
  };
};

export const metricsRoute = new Elysia().get('/dashboard/metrics', getMetrics, {
  detail: {
    tags: ['metrics'],
    description:
      'Get system metrics including active users, total reports, ' +
      'reports by status, and resolution rate comparison between current and last month',
  },
});
