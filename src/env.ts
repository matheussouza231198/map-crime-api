import { z } from 'zod/v4';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.url().startsWith('postgresql://'),
  PORT: z.coerce.number().default(3000),
  BETTER_AUTH_SECRET: z.string(),
});

const _env = envSchema.safeParse(Bun.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.message);
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
