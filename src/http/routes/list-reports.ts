import { db } from '@/database/client';
import { schema } from '@/database/schema';
import Elysia, { status } from 'elysia';
import z from 'zod/v4';

export const listReports = new Elysia().get(
  '/reports',
  async ({ user, query: { search, status } }) => {
    const reports = await db.query.reports.findMany({
      columns: {
        id: true,
        code: true,
        title: true,
        status: true,
        createdAt: true,
      },
      where: (r, { and, ilike, or, eq }) => {
        return and(
          or(
            ilike(r.title, `%${search}%`),
            ilike(r.description, `%${search}%`),
            ilike(r.code, `%${search}%`),
          ),
          status ? eq(r.status, status) : undefined,
          user.role === 'user' ? eq(r.assignedToId, user.id) : undefined,
        );
      },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    console.log({ user });

    return { reports };
  },
  {
    auth: true,
    query: z.object({
      search: z.string().optional().default(''),
      status: z.string().optional(),
    }),
    detail: {
      tags: ['reports'],
      description: 'List all reports',
    },
  },
);
