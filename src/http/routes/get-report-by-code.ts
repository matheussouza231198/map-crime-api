import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq } from 'drizzle-orm';
import Elysia from 'elysia';
import { z } from 'zod/v4';

const createReportParamsSchema = z.object({
  code: z.string(),
});

export const getReportByCode = new Elysia().get(
  '/reports/track/:code',
  async ({ status, params }) => {
    const report = await db.query.reports.findFirst({
      columns: {
        id: false,
        assignedToId: false,
      },
      with: {
        assignedTo: {
          columns: {
            entity: true,
          },
        },
        timeline: {
          columns: {
            id: false,
            reportId: false,
            userId: false,
          },
          with: {
            createdBy: {
              columns: {
                entity: true,
              },
            },
          },
        },
      },
      where: eq(schema.reports.code, params.code),
    });

    if (!report) {
      return status(404);
    }

    return {
      report,
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
