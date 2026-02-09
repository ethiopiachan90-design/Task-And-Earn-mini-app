import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../common/auth-middleware.js';
import { UserService } from './service.js';
import { NotFoundError } from '../../common/errors.js';
import { getPrisma } from '../../db/prisma.js';

export async function userRoutes(app: FastifyInstance) {
  // GET /api/users/me — Get authenticated user's profile
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user.sub;
    const user = await UserService.getById(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      success: true,
      data: {
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

  // GET /api/users/referral-stats — Get referral statistics
  app.get('/referral-stats', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user.sub;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
    });

    const stats = {
      referralCode: user.referralCode,
      totalReferred: referrals.length,
      pendingBonuses: referrals.filter(r => r.status === 'pending').length,
      creditedBonuses: referrals.filter(r => r.status === 'credited').length,
    };

    return {
      success: true,
      data: stats
    };
  });
}
