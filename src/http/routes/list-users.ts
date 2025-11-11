import { db } from '@/database/client';
import Elysia from 'elysia';
import z from 'zod';

export const listUsersRoute = new Elysia().get(
  '/users',
  async ({ status, query, user: loggedUser }) => {
    const users = await db.query.users.findMany({
      where: (user, { eq, ilike, and, not }) => {
        return and(
          eq(user.status, query.status || user.status),
          ilike(user.name, `%${query.search || ''}%`),
          not(eq(user.id, loggedUser.id)),
        );
      },
    });

    return status(200, { users });
  },
  {
    query: z.object({
      search: z.string().optional(),
      status: z.string().optional(),
    }),
    auth: true,
    admin: true,
    tags: ['users'],
  },
);
