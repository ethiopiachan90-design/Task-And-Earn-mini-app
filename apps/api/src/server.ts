import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { getEnv } from './config/index.js';
import { errorHandler } from './common/index.js';
import { getPrisma } from './db/prisma.js';
import { getRedis } from './db/redis.js';
import { authRoutes } from './modules/auth/routes.js';
import { taskRoutes } from './modules/tasks/routes.js';
import { walletRoutes } from './modules/wallet/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { botPlugin } from './bot/plugin.js';

export async function buildServer() {
  const env = getEnv();
  const botToken = env.BOT_TOKEN;

  const app = Fastify({
    logger: {
      level: env.isDev ? 'debug' : 'info',
      transport: env.isDev
        ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
        : undefined,
    },
  });

  // ─── Plugins ───────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true,
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // ─── Error Handler ─────────────────────────────────────────────────────────
  app.setErrorHandler(errorHandler);

  // ─── Bot Plugin ────────────────────────────────────────────────────────────
  await app.register(botPlugin);

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/api/health', async (request, reply) => {
    const prisma = getPrisma();
    const redis = getRedis();

    let dbOk = false;
    let redisOk = false;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      request.log.error('Database health check failed');
    }

    try {
      const pong = await redis.ping();
      redisOk = pong === 'PONG';
    } catch {
      request.log.error('Redis health check failed');
    }

    const healthy = dbOk && redisOk;

    return reply.status(healthy ? 200 : 503).send({
      success: healthy,
      data: {
        status: healthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
          database: dbOk ? 'connected' : 'disconnected',
          redis: redisOk ? 'connected' : 'disconnected',
        },
      },
    });
  });

  // ─── Routes ────────────────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(taskRoutes, { prefix: '/api/tasks' });
  await app.register(walletRoutes, { prefix: '/api/wallet' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(userRoutes, { prefix: '/api/users' });

  return app;
}
