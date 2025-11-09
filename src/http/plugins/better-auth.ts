/* eslint-disable @typescript-eslint/no-explicit-any */

import Elysia from 'elysia';

import { auth } from '@/auth';

export const betterAuthPlugin = new Elysia({ name: 'better-auth' }).mount(auth.handler).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) {
        return status(401, { message: 'Unauthorized' });
      }

      return session;
    },
  },
  admin: {
    resolve({ user, status }) {
      if (!user) {
        return status(401, { message: 'Unauthorized' });
      }

      if (user.role !== 'admin') {
        return status(403, { message: 'Forbidden' });
      }

      return user;
    },
  },
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = '/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;

        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];

          operation.tags = ['Auth'];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
