import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { createBot } from './index.js';
import { getEnv } from '../config/index.js';

export const botPlugin = fp(async (app: FastifyInstance) => {
    const env = getEnv();
    const bot = createBot();

    // Make bot accessible via app.bot if needed (though usually not necessary for polling)
    app.decorate('bot', bot);

    // In development, we use long polling
    // In production, we'll switch to webhooks (Phase 8)
    if (env.isDev) {
        app.log.info('Starting Telegram Bot in polling mode...');

        // Non-blocking start
        bot.start({
            onStart: (botInfo) => {
                app.log.info({ botInfo }, 'Bot started successfully');
            },
        }).catch((err) => {
            app.log.error(err, 'Failed to start bot polling');
        });

        // Graceful shutdown
        app.addHook('onClose', async () => {
            app.log.info('Stopping Telegram Bot...');
            await bot.stop();
        });
    } else {
        // Webhook implementation will come in Phase 8
        app.log.warn('Telegram Bot webhook mode not implemented yet. Defaulting to polling for now.');
        bot.start().catch((err) => app.log.error(err, 'Failed to start bot polling in production'));
    }
});

// Extend FastifyInstance type
declare module 'fastify' {
    interface FastifyInstance {
        bot: ReturnType<typeof createBot>;
    }
}
