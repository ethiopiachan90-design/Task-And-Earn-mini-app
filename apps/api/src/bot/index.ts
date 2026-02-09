import { Bot } from 'grammy';
import { getEnv } from '../config/index.js';

export function createBot() {
    const env = getEnv();
    const bot = new Bot(env.BOT_TOKEN);

    // ─── Middleware ────────────────────────────────────────────────────────────

    // Basic logging middleware
    bot.use(async (ctx, next) => {
        console.log(`[Bot] Update from ${ctx.from?.username || ctx.from?.id}: ${ctx.message?.text || 'non-text message'}`);
        await next();
    });

    // ─── Commands ──────────────────────────────────────────────────────────────

    bot.command('start', async (ctx) => {
        const referralCode = ctx.match;
        const firstName = ctx.from?.first_name || 'there';

        let message = `Hey ${firstName}! 👋 Welcome to Task & Earn!\n\n`;
        message += `Start completing simple tasks and earn rewards. 💰\n\n`;

        if (referralCode) {
            message += `Looks like you were referred! We'll track that for you. 😉\n\n`;
        }

        message += `Tap the button below to open the app and get started!`;

        await ctx.reply(message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Open Task & Earn',
                            web_app: { url: 'https://subpharyngeal-scrutinizingly-dierdre.ngrok-free.dev' },
                        },
                    ],
                ],
            },
        });
    });

    bot.command('help', async (ctx) => {
        let message = `How can I help you? 🧐\n\n`;
        message += `🚀 /start - Open the app and start earning\n`;
        message += `❓ /help - Show this help message\n\n`;
        message += `If you have any issues, please contact our support.`;

        await ctx.reply(message);
    });

    // Handle generic messages
    bot.on('message', async (ctx) => {
        await ctx.reply(`I'm primarily a portal to the Task & Earn Mini App. Tap /start to open it!`);
    });

    bot.catch((err) => {
        console.error(`[Bot Error]`, err);
    });

    return bot;
}
