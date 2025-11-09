import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq } from 'drizzle-orm';
import Elysia from 'elysia';
import z from 'zod';

const reportUpdateStatusRouteBodySchema = z.object({
  status: z.enum(['pending', 'in_review', 'resolved', 'rejected']),
});

const reportUpdateStatusRouteParamsSchema = z.object({
  reportId: z.string().uuid(),
});

export const reportUpdateStatusRoute = new Elysia().patch(
  '/reports/:reportId/update-status',
  async ({ params, body, status, user }) => {
    const report = await db.query.reports.findFirst({
      where: (report, { eq }) => eq(report.id, params.reportId),
    });

    if (!report) {
      return status(404, { message: 'Report not found' });
    }

    if (report.status === body.status) {
      return status(400, { message: 'Report already has this status' });
    }

    if (report.status === 'resolved') {
      return status(400, {
        message: 'Cannot update status of a resolved report',
      });
    }

    if (report.status === 'rejected') {
      return status(400, {
        message: 'Cannot update status of a rejected report',
      });
    }

    await db
      .update(schema.reports)
      .set({ status: body.status })
      .where(eq(schema.reports.id, params.reportId));

    let action = 'updated_status';

    if (body.status === 'resolved') {
      action = 'marked_resolved';
    } else if (body.status === 'rejected') {
      action = 'marked_rejected';
    }

    await db.insert(schema.reportsTimelines).values({
      reportId: params.reportId,
      action,
      userId: user.id,
      metadata: { newStatus: body.status, previousStatus: report.status },
    });

    return status(204);
  },
  {
    auth: true,
    body: reportUpdateStatusRouteBodySchema,
    params: reportUpdateStatusRouteParamsSchema,
  },
);
