import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { count, gte } from 'drizzle-orm';
import { subYears } from 'date-fns';
import Elysia from 'elysia';

export const heatmapRoute = new Elysia().get(
  '/dashboard/heatmap',
  async () => {
    const oneYearAgo = subYears(new Date(), 1);
    const points = await db
      .select({
        lat: schema.reports.latitude,
        lng: schema.reports.longitude,
        weight: count(),
      })
      .from(schema.reports)
      .where(gte(schema.reports.createdAt, oneYearAgo))
      .groupBy(schema.reports.latitude, schema.reports.longitude);

    return { points };
  },
  {
    detail: {
      tags: ['Dashboard'],
      description: 'Get heatmap data for reports',
    },
  },
);
