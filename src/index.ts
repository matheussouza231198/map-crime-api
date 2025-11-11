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
import { updateUserRoute } from './http/routes/update-user';
import { getReportById } from './http/routes/ger-report-by-id';
import { assignedReportToUserRoute } from './http/routes/assigned-report-to-user';
import { reportUpdateStatusRoute } from './http/routes/report-update-status';
import { reportsTimelineStatsRoute } from './http/routes/reports-timeline-stats';
import { heatmapRoute } from './http/routes/heatmap';

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
  .use(updateUserRoute)
  .use(listUsersRoute)
  .use(listReports)
  .use(getReportById)
  .use(metricsRoute)
  .use(reportsTimelineStatsRoute)
  .use(assignedReportToUserRoute)
  .use(reportUpdateStatusRoute)
  .use(heatmapRoute)
  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
