import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '@task-and-earn/shared';
import { ForbiddenError, UnauthorizedError } from './errors.js';

export async function requireAuth(request: FastifyRequest) {
    try {
        await request.jwtVerify();
    } catch (err) {
        throw new UnauthorizedError('Authentication required');
    }
}

export function requireRole(roles: UserRole | UserRole[]) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return async (request: FastifyRequest) => {
        // Ensure authenticated first
        await requireAuth(request);

        const user = request.user as { role: UserRole } | undefined;

        if (!user || (!allowedRoles.includes(user.role) && user.role !== 'admin')) {
            throw new ForbiddenError('Insufficient permissions');
        }
    };
}

// Extend JWTPayload type
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            sub: string;
            telegramId: string;
            role: UserRole;
        };
        user: {
            sub: string;
            telegramId: string;
            role: UserRole;
        };
    }
}
