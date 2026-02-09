import { PrismaClient } from '@prisma/client';
import { getEnv } from '../config/index.js';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const env = getEnv();
    prisma = new PrismaClient({
      log: env.isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
  }
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
