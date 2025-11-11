import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq } from 'drizzle-orm';
import Elysia from 'elysia';
import { z } from 'zod/v4';

const createReportParamsSchema = z.object({
  id: z.string(),
});

export const getReportById = new Elysia().get(
  '/reports/:id',
  async ({ status, params }) => {
    const report = await db.query.reports.findFirst({
      columns: {
        id: false,
        assignedToId: false,
      },
      with: {
        assignedTo: {
          columns: {
            id: true,
            name: true,
            organization: true,
          },
        },
        timeline: {
          columns: {
            id: false,
            reportId: false,
          },
          with: {
            createdBy: {
              columns: {
                name: true,
                organization: true,
              },
            },
          },
        },
      },
      where: eq(schema.reports.id, params.id),
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
