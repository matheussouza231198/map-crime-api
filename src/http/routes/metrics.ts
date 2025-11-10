import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { sql } from 'drizzle-orm';
import Elysia from 'elysia';

const SECONDS_IN_DAY = 86400;

export const metricsRoute = new Elysia().get('/metrics', async () => {
  const statusCounts = await db
    .select({
      status: schema.reports.status,
      count: sql<number>`cast(count(${schema.reports.id}) as int)`,
      averageResolutionTime: sql<number>`round(avg(extract(epoch from (${schema.reports.completedAt} - ${schema.reports.createdAt}))) / ${SECONDS_IN_DAY}, 2)`,
    })
    .from(schema.reports)
    .groupBy(schema.reports.status)
    .orderBy(schema.reports.status);

  const threeMonthsAgo = new Date();

  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const last3Months = await db
    .select({
      date: sql<string>`date_trunc('day', ${schema.reports.createdAt})::date`,
      count: sql<number>`cast(count(${schema.reports.id}) as int)`,
    })
    .from(schema.reports)
    .where(sql`${schema.reports.createdAt} >= ${threeMonthsAgo}`)
    .groupBy(sql`date_trunc('day', ${schema.reports.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${schema.reports.createdAt})::date`);

  return { statusCounts, last3Months };
});
