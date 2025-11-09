import { db } from '@/database/client';
import Elysia from 'elysia';
import z from 'zod';

export const listUsersRoute = new Elysia().get(
  '/users',
  async ({ status }) => {
    const users = await db.query.users.findMany();

    return status(200, { users });
  },
  {
    auth: true,
    admin: true,
    body: z.object(),
  },
);
