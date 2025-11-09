import { db } from '@/database/client';
import { schema } from '@/database/schema';
import Elysia from 'elysia';

export const listReports = new Elysia().get(
  '/reports',
  async ({ user }) => {
    const reports = await db.select().from(schema.reports);

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
