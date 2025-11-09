import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';

import { db } from './database/client';
import { randomUUIDv7 } from 'bun';

export const auth = betterAuth({
  basePath: '/auth',
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    camelCase: false,
  }),
  advanced: {
    database: {
      generateId: () => randomUUIDv7(),
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    password: {
      hash: (password) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        returned: true,
      },
      entity: {
        type: 'string',
        required: false,
        returned: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
});
