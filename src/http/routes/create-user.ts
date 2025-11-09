import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { randomUUIDv7 } from 'bun';
import Elysia from 'elysia';
import { z } from 'zod/v4';

const createUserBodySchema = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  role: z.enum(['admin', 'user']).default('user'),
  entity: z.string().nonempty(),
});

export const createUserRoute = new Elysia().post(
  '/users',
  async ({ status, body }) => {
    const { name, email, role, entity } = body;

    const result = await db
      .insert(schema.users)
      .values({
        name,
        email,
        role,
        entity,
      })
      .returning();

    if (!result.length) {
      return status(500, { message: 'Failed to create user' });
    }

    await db.insert(schema.accounts).values({
      userId: result[0].id,
      password: await Bun.password.hash('Abc123!@#'),
      providerId: 'credential',
      accountId: randomUUIDv7(),
    });

    return status(201);
  },
  {
    auth: true,
    detail: {
      tags: ['users'],
      description: 'Create a new report with the given details',
    },
    body: createUserBodySchema,
  },
);
