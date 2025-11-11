import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq } from 'drizzle-orm';
import Elysia from 'elysia';
import z from 'zod';

const assignedReportToUserRouteBodySchema = z.object({
  userId: z.uuid(),
});

const assignedReportToUserRouteParamsSchema = z.object({
  reportId: z.uuid(),
});

export const assignedReportToUserRoute = new Elysia().patch(
  '/reports/:reportId/assign',
  async ({ params, body, status, user }) => {
    const report = await db.query.reports.findFirst({
      where: (report, { eq }) => eq(report.id, params.reportId),
    });

    const userToAssign = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, body.userId),
    });

    if (!userToAssign) {
      return status(404, { message: 'User to assign not found' });
    }

    if (!report) {
      return status(404, { message: 'Report not found' });
    }

    if (report.status === 'resolved') {
      return status(400, {
        message: 'Cannot assign user to a resolved report',
      });
    }

    if (report.status === 'rejected') {
      return status(400, {
        message: 'Cannot assign user to a rejected report',
      });
    }

    await db
      .update(schema.reports)
      .set({ assignedToId: body.userId })
      .where(eq(schema.reports.id, params.reportId));

    await db.insert(schema.reportsTimelines).values({
      reportId: params.reportId,
      action: 'assigned_to_user',
      userId: user.id,
      metadata: {
        assignedToUser: {
          id: userToAssign.id,
          name: userToAssign.name,
          organization: userToAssign.organization,
        },
      },
    });

    return status(204);
  },
  {
    auth: true,
    admin: true,
    body: assignedReportToUserRouteBodySchema,
    params: assignedReportToUserRouteParamsSchema,
    tags: ['reports'],
  },
);
