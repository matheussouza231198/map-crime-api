import { db } from '@/database/client';
import { schema } from '@/database/schema';
import Elysia from 'elysia';

export const listReports = new Elysia().get(
  '/reports',
  async ({ user }) => {
    const reports = await db.query.reports.findMany({
      columns: {
        id: true,
        code: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    console.log({ user });

    return { reports };
  },
  {
    auth: true,
    detail: {
      tags: ['reports'],
      description: 'List all reports',
    },
  },
);
