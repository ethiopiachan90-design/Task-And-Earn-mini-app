import { nanoid } from 'nanoid';
import { getPrisma } from '../../db/prisma.js';
import type { TelegramUser } from '../auth/service.js';
import type { UserRole } from '@task-and-earn/shared';
import { getEnv } from '../../config/env.js';

export class UserService {
    static async findOrCreateUser(telegramUser: TelegramUser, referrerCode?: string) {
        const prisma = getPrisma();
        const telegramId = BigInt(telegramUser.id);
        const env = getEnv();

        // Try to find existing user
        let user = await prisma.user.findUnique({
            where: { telegramId },
            include: { wallet: true },
        });

        if (user) {
            return user;
        }

        // Determine role
        const isAdmin = env.adminTelegramIds.includes(telegramId);
        const role: UserRole = isAdmin ? 'admin' : 'worker';

        // Create new user with wallet and referral logic in a transaction
        return await prisma.$transaction(async (tx) => {
            // 1. Create User
            const newUser = await tx.user.create({
                data: {
                    telegramId,
                    telegramUsername: telegramUser.username,
                    displayName: telegramUser.first_name,
                    role,
                    referralCode: nanoid(10), // 10 chars for referral code
                },
            });

            // 2. Create Wallet
            await tx.wallet.create({
                data: {
                    userId: newUser.id,
                    balance: 0,
                },
            });

            // 3. Handle Referral if provided
            if (referrerCode) {
                const referrer = await tx.user.findUnique({
                    where: { referralCode: referrerCode },
                });

                // Prevent self-referral and ensure referrer exists
                if (referrer && referrer.id !== newUser.id) {
                    await tx.user.update({
                        where: { id: newUser.id },
                        data: { referredBy: referrer.id },
                    });

                    await tx.referral.create({
                        data: {
                            referrerId: referrer.id,
                            referredId: newUser.id,
                            status: 'pending',
                        },
                    });
                }
            }

            return await tx.user.findUnique({
                where: { id: newUser.id },
                include: { wallet: true },
            });
        });
    }

    static async getById(userId: string) {
        const prisma = getPrisma();
        return prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });
    }
}
