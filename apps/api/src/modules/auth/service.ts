import crypto from 'node:crypto';
import { getEnv } from '../../config/index.js';
import { UnauthorizedError } from '../../common/errors.js';

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export function validateTelegramInitData(initData: string) {
    const env = getEnv();
    const botToken = env.BOT_TOKEN;

    if (!initData) {
        throw new UnauthorizedError('Missing initData');
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
        throw new UnauthorizedError('Missing hash in initData');
    }

    // Remove hash from the params to calculate the secret
    urlParams.delete('hash');

    // Sort params alphabetically
    const params = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Step 1: Calculate secret key
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    // Step 2: Calculate data check hash
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(params)
        .digest('hex');

    if (calculatedHash !== hash) {
        throw new UnauthorizedError('Invalid initData hash');
    }

    // Step 3: Check data freshness (auth_date)
    const authDate = Number(urlParams.get('auth_date'));
    const now = Math.floor(Date.now() / 1000);
    const EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

    if (now - authDate > EXPIRY_SECONDS) {
        throw new UnauthorizedError('initData has expired');
    }

    // Step 4: Extract user data
    const userJson = urlParams.get('user');
    if (!userJson) {
        throw new UnauthorizedError('Missing user data in initData');
    }

    try {
        const user = JSON.parse(userJson) as TelegramUser;
        return user;
    } catch {
        throw new UnauthorizedError('Invalid user JSON in initData');
    }
}
