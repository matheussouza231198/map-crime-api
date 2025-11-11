import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import z from 'zod';

const bodySchema = z.object({
  note: z.string().min(1).max(500),
});
const paramsSchema = z.object({
  reportId: z.uuidv7(),
});

export const reportUpdateNoteRoute = new Elysia().put(
  '/reports/:reportId/note',
  async ({ params, body, status, user }) => {
    const { reportId } = paramsSchema.parse(params);
    const { note } = bodySchema.parse(body);

    const report = await db.query.reports.findFirst({
      where: eq(schema.reports.id, reportId),
    });

    if (!report) {
      return status(404, { message: 'Report not found' });
    }

    if (user.role === 'user' && report.assignedToId !== user.id) {
      return status(403, { message: 'You are not assigned to this report' });
    }

    await db.update(schema.reports).set({ note }).where(eq(schema.reports.id, reportId));

    await db.insert(schema.reportsTimelines).values({
      reportId,
      action: 'note_updated',
      userId: user.id,
      metadata: { note },
    });

    return status(204);
  },
  {
    auth: true,
    body: bodySchema,
    paframs: paramsSchema,
    tags: ['reports'],
  },
);
