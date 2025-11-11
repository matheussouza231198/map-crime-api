import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { eq } from 'drizzle-orm';
import Elysia from 'elysia';
import z from 'zod';

const bodyShema = z.object({
  name: z.string().optional(),
  organization: z.string().optional(),
  password: z.string().optional(),
});

const paramsSchema = z.object({
  userId: z.uuid(),
});

export const updateUserRoute = new Elysia().put(
  '/users/:userId',
  async ({ params, body, status, user }) => {
    const { name, organization, password } = body;

    await db
      .update(schema.users)
      .set({
        name,
        organization,
      })
      .where(eq(schema.users.id, params.userId));

    if (password) {
      await db
        .update(schema.accounts)
        .set({
          password: await Bun.password.hash(password),
        })
        .where(eq(schema.accounts.userId, params.userId));
    }

    return status(200, { message: 'User updated successfully' });
  },
  {
    auth: true,
    admin: true,
    body: bodyShema,
    params: paramsSchema,
    tags: ['users'],
  },
);
