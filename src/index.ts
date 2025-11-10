import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';

import { env } from '@/env';
import { betterAuthPlugin, OpenAPI } from './http/plugins/better-auth';

import { createReportRoute } from './http/routes/create-report';
import z from 'zod';
import { listReports } from './http/routes/list-reports';
import { getReportByCode } from './http/routes/get-report-by-code';
import { createUserRoute } from './http/routes/create-user';
import { listUsersRoute } from './http/routes/list-users';
import { metricsRoute } from './http/routes/metrics';

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
    }),
  )
  .use(staticPlugin({ prefix: 'static' }))
  .use(betterAuthPlugin)
  .use(createReportRoute)
  .use(getReportByCode)
  .use(createUserRoute)
  .use(listUsersRoute)
  .use(listReports)
  .use(metricsRoute)
  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
