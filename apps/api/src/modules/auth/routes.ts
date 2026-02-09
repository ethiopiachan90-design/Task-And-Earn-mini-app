import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateTelegramInitData } from './service.js';
import { UserService } from '../users/service.js';

const authRequestSchema = z.object({
  initData: z.string(),
  referrerCode: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/telegram — Validate Telegram initData, return JWT
  app.post('/telegram', async (request, reply) => {
    const { initData, referrerCode } = authRequestSchema.parse(request.body);

    const telegramUser = validateTelegramInitData(initData);
    const user = await UserService.findOrCreateUser(telegramUser, referrerCode);

    if (!user) {
      throw new Error('Failed to find or create user');
    }

    const token = app.jwt.sign({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          telegramId: user.telegramId.toString(),
          username: user.telegramUsername,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
          referralCode: user.referralCode,
          wallet: user.wallet,
        }
      }
    };
  });
}
