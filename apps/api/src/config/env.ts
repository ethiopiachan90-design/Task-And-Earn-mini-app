import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  BOT_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
  ADMIN_TELEGRAM_IDS: z.string().default(''),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  return {
    ...result.data,
    corsOrigins: result.data.CORS_ORIGINS.split(',').map((s) => s.trim()),
    adminTelegramIds: result.data.ADMIN_TELEGRAM_IDS
      ? result.data.ADMIN_TELEGRAM_IDS.split(',').map((s) => BigInt(s.trim()))
      : [],
    isDev: result.data.NODE_ENV === 'development',
    isProd: result.data.NODE_ENV === 'production',
  };
}

export type Env = ReturnType<typeof loadEnv>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = loadEnv();
  }
  return _env;
}
