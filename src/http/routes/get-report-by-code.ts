import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq, sql } from 'drizzle-orm';
import Elysia from 'elysia';
import { z } from 'zod/v4';

const createReportParamsSchema = z.object({
  code: z.string(),
});

export const getReportByCode = new Elysia().get(
  '/reports/:code/track',
  async ({ status, params }) => {
    const report = await db.query.reports.findFirst({
      columns: {
        id: false,
        assignedToId: false,
      },
      with: {
        timeline: {
          columns: {
            id: false,
          },
          extras: {
            loweredStatus: sql`lower(${schema.reports.status})`.as('lowered_status'),
          },
        },
      },
      where: eq(schema.reports.code, params.code),
    });

    if (!report) {
      return status(404);
    }

    return {
      report: {
        ...report,
        // timeline,
      },
    };
  },
  {
    detail: {
      tags: ['reports'],
      description: 'Create a new report with the given details',
    },
    params: createReportParamsSchema,
  },
);
