# Task & Earn Platform — Complete Phase & Feature Breakdown

## Overview
Telegram-based micro task & earn platform. Workers complete tasks and earn crypto/balance. Task givers post tasks and fund them. The platform takes a fee on every transaction.

**Target:** Global from day 1
**MVP Users:** ~500, designed to scale to 50k+
**Revenue Model:** 10% fee on tasks + 3% fee on withdrawals

---

## PHASE 1: FOUNDATION
**Timeline:** Week 1-2
**Status:** COMPLETE

### Features

#### 1.1 Monorepo Setup
- pnpm workspaces managing 4 packages (api, mini-app, admin, shared)
- Turborepo for parallel builds, caching, and task orchestration
- Single `pnpm install` installs all dependencies across all packages
- Shared TypeScript config and build pipeline

#### 1.2 Fastify Backend Server
- Fastify v5 with TypeScript for type-safe API development
- 2-3x faster than Express with built-in schema validation
- Pino logger (structured JSON logs in production, pretty-print in dev)
- CORS configured for Mini App and Admin Dashboard origins
- Graceful shutdown handling (SIGINT/SIGTERM cleanup)
- Modular route architecture with 5 route modules:
  - `/api/auth/*` — Authentication
  - `/api/tasks/*` — Task operations
  - `/api/wallet/*` — Financial operations
  - `/api/admin/*` — Admin operations
  - `/api/users/*` — User profile operations

#### 1.3 PostgreSQL Database + Prisma ORM
- PostgreSQL 16 for ACID-compliant transactions (critical for money operations)
- Prisma ORM for type-safe queries and auto-generated migrations
- 10 database tables:

  **users** — Platform users (workers, task givers, admins)
  - UUID primary key, unique Telegram ID
  - Role (worker/taskgiver/admin), Status (active/frozen/banned)
  - Referral code (unique per user), referred_by link
  - Timestamps for created/updated

  **wallets** — User balance tracking
  - One wallet per user (1:1 relation)
  - balance (available), frozen_balance (held in escrow)
  - total_earned, total_withdrawn (lifetime stats)
  - All amounts stored as Decimal(18,8) for financial precision

  **transactions** — Full audit trail of every balance change
  - Links to wallet, tracks type (deposit, withdrawal, task_reward, escrow_hold, escrow_release, transfer_in, transfer_out, referral_bonus, platform_fee, admin_adjustment)
  - Records balance_before and balance_after for every change
  - Reference to source (task ID, withdrawal ID, transfer ID)
  - Status tracking (pending/completed/failed/reversed)
  - JSONB metadata for flexible extra data

  **tasks** — Task postings by task givers
  - Title, description, instructions
  - Proof type required (text/image/link/screenshot)
  - Reward per user, max completions, current completions
  - Total budget (reward × max_completions + platform_fee)
  - Status lifecycle: pending_approval → active → completed/cancelled/rejected
  - Optional expiry date

  **task_submissions** — Worker proof submissions
  - Links task to worker (UNIQUE constraint prevents double-claiming)
  - Proof data (text, image URL, link)
  - Status (pending/approved/rejected)
  - Reviewer tracking (who reviewed, when, rejection reason)

  **withdrawals** — Withdrawal requests
  - Amount, method (TON/USDT_TRC20/manual), wallet address
  - Status lifecycle: pending → approved → processing → completed/rejected
  - Admin who processed it, admin notes, transaction hash as proof

  **transfers** — User-to-user balance transfers
  - Sender, receiver, amount, optional note
  - Status (completed/reversed)

  **referrals** — Referral tracking
  - Who referred whom, bonus amount, credit status
  - UNIQUE on referred_id (one referrer per user)

  **audit_logs** — Admin action logging
  - Actor, action type, target type/ID
  - JSONB details, IP address
  - Indexed by actor and action for fast lookups

  **platform_settings** — Key-value config store
  - Stores platform_fee_percent, min_withdrawal, min_task_reward, referral_bonus_amount, etc.
  - JSONB values for flexibility

#### 1.4 Redis Connection
- ioredis client with BullMQ-compatible config
- Used for: session caching, rate limiting, job queues
- Auto-reconnect on connection loss
- Connection health monitoring

#### 1.5 Docker Compose
- PostgreSQL 16 Alpine on port 5432
- Redis 7 Alpine on port 6379
- Persistent volumes for data survival across restarts
- Health checks on both services (pg_isready + redis-cli ping)

#### 1.6 Shared Package
- TypeScript constants/enums shared between frontend and backend
- All status enums: UserRole, UserStatus, TaskStatus, SubmissionStatus, WithdrawalStatus, TransactionType, ProofType, etc.
- Platform defaults: fee percentages, limits, cooldowns
- Zod validation schemas for all API inputs:
  - createTaskSchema, submitProofSchema, reviewSubmissionSchema
  - withdrawalRequestSchema, transferSchema, depositSchema
  - balanceAdjustmentSchema, adminTaskReviewSchema, adminWithdrawalReviewSchema
  - paginationSchema
- TypeScript DTOs for all API responses:
  - UserDTO, WalletDTO, TransactionDTO, TaskDTO, TaskSubmissionDTO
  - WithdrawalDTO, TransferDTO, ReferralDTO, DashboardStatsDTO
  - ApiResponse<T>, PaginatedResponse<T> wrappers

#### 1.7 Environment Config
- Zod-validated environment variables (server crashes on startup if invalid)
- Variables: DATABASE_URL, REDIS_URL, BOT_TOKEN, JWT_SECRET, PORT, HOST, NODE_ENV, CORS_ORIGINS, ADMIN_TELEGRAM_IDS
- Derived helpers: corsOrigins (parsed array), adminTelegramIds (parsed BigInt array), isDev/isProd flags

#### 1.8 Error Handling
- Custom error classes:
  - AppError (base: statusCode + code + message + details)
  - NotFoundError (404)
  - UnauthorizedError (401)
  - ForbiddenError (403)
  - ValidationError (400)
  - ConflictError (409)
  - InsufficientBalanceError (400)
- Global error handler catches:
  - AppError → structured JSON response
  - ZodError → formatted validation errors
  - Fastify validation errors → 400 response
  - Unknown errors → 500 with message hidden in production
- Health check endpoint: GET /api/health
  - Tests database connectivity (SELECT 1)
  - Tests Redis connectivity (PING)
  - Returns service status + uptime + timestamp

#### Files Created
```
package.json                          — Root workspace config
pnpm-workspace.yaml                   — Workspace package list
turbo.json                            — Turborepo task config
.npmrc                                — pnpm settings
.gitignore                            — Git ignore rules
.env.example                          — Environment variable template
docker-compose.yml                    — PostgreSQL + Redis containers
apps/api/package.json                 — API dependencies
apps/api/tsconfig.json                — API TypeScript config
apps/api/prisma/schema.prisma         — Full database schema
apps/api/src/index.ts                 — Entry point (startup + shutdown)
apps/api/src/server.ts                — Fastify server builder
apps/api/src/config/env.ts            — Env validation
apps/api/src/config/index.ts          — Config barrel export
apps/api/src/db/prisma.ts             — Prisma client singleton
apps/api/src/db/redis.ts              — Redis client singleton
apps/api/src/db/index.ts              — DB barrel export
apps/api/src/common/errors.ts         — Custom error classes
apps/api/src/common/error-handler.ts  — Global error handler
apps/api/src/common/index.ts          — Common barrel export
apps/api/src/modules/auth/routes.ts   — Auth route placeholder
apps/api/src/modules/tasks/routes.ts  — Task route placeholder
apps/api/src/modules/wallet/routes.ts — Wallet route placeholder
apps/api/src/modules/admin/routes.ts  — Admin route placeholder
apps/api/src/modules/users/routes.ts  — User route placeholder
apps/mini-app/package.json            — Mini App dependencies
apps/admin/package.json               — Admin dependencies
packages/shared/package.json          — Shared package config
packages/shared/tsconfig.json         — Shared TypeScript config
packages/shared/src/constants.ts      — Enums and defaults
packages/shared/src/types.ts          — TypeScript DTOs
packages/shared/src/validation.ts     — Zod schemas
packages/shared/src/index.ts          — Barrel export
```

---

## PHASE 2: AUTH & USERS
**Timeline:** Week 2-3
**Status:** NOT STARTED

### Features

#### 2.1 Telegram Bot Setup
- grammY framework (TypeScript-native, modern middleware)
- Bot commands:
  - `/start` — Welcome message + Mini App button + referral handling
  - `/help` — Usage instructions
  - `/balance` — Quick balance check
  - `/referral` — Show referral link and stats
- Inline keyboard buttons for navigation
- Polling mode for development, webhook mode for production
- Bot registers with Fastify as a plugin

#### 2.2 Telegram Mini App Authentication
- Validate Telegram `initData` cryptographically using HMAC-SHA256
- Extract user data (telegram_id, username, first_name, language)
- Verify data hasn't been tampered with
- Reject expired initData (timestamp check)
- This is the ONLY way users authenticate — no passwords, no email

#### 2.3 JWT Token System
- Generate JWT on successful Telegram auth
- JWT payload contains: userId, telegramId, role
- Token expiry: 7 days (configurable)
- Fastify JWT plugin for token signing and verification
- Auth middleware that extracts and validates JWT on protected routes
- Attach decoded user to request object for downstream use

#### 2.4 User Registration Flow
- First-time Telegram auth → auto-create user + wallet in a single transaction
- Generate unique 8-character referral code (nanoid)
- If referral code provided in /start deep link:
  - Link new user to referrer (set referred_by)
  - Create referral record (bonus credited later when first task completed)
  - Prevent self-referral (can't use own code)
- Return JWT + user profile on success
- Subsequent logins just return fresh JWT + updated profile

#### 2.5 Role-Based Access Control
- Three roles: worker, taskgiver, admin
- Middleware guards:
  - requireAuth — must be logged in (valid JWT)
  - requireRole('admin') — must be admin
  - requireRole('taskgiver') — must be task giver or admin
  - requireRole('worker') — must be worker (default role)
- Admin Telegram IDs configured in .env → auto-assigned admin role on registration
- Users default to 'worker' role, can be promoted by admin

#### 2.6 Referral System
- Each user gets a unique referral code on registration
- Shareable link format: https://t.me/BotName?start=REF_CODE
- When a referred user completes their first task → referrer gets bonus
- Bonus amount stored in platform_settings (default $0.05)
- Stats endpoint shows: total referrals, pending bonuses, credited bonuses

#### 2.7 API Endpoints
- `POST /api/auth/telegram` — Validate initData, create/find user, return JWT
  - Input: { initData: string }
  - Output: { token: string, user: UserDTO }
- `GET /api/users/me` — Get authenticated user's profile
  - Output: { user: UserDTO, wallet: WalletDTO }
- `GET /api/users/referral-stats` — Get referral statistics
  - Output: { referralCode: string, totalReferred: number, pendingBonuses: number, creditedBonuses: number }

---

## PHASE 3: TASK SYSTEM
**Timeline:** Week 3-4
**Status:** NOT STARTED

### Features

#### 3.1 Task Creation (Task Givers)
- Task giver fills in: title, description, instructions, proof type, reward per user, max completions, optional expiry
- Server calculates total_budget = (reward × max_completions) + platform_fee
- Platform fee = 10% of (reward × max_completions)
- Server verifies task giver has sufficient balance
- On creation:
  - Deduct total_budget from task giver's available balance
  - Move total_budget to task giver's frozen_balance (escrow)
  - Create transaction record for escrow hold
  - Task status = 'pending_approval' (admin must approve before workers see it)

#### 3.2 Task Listing (Workers)
- List all tasks with status = 'active' (paginated)
- Filter by proof type, reward range, available slots
- Sort by newest, highest reward, most slots available
- Exclude tasks the worker already submitted to
- Show remaining slots (max_completions - current_completions)
- Task detail page shows full instructions

#### 3.3 Task Submission (Workers)
- Worker submits proof based on task's proof_type:
  - text: Free-form text proof
  - link: URL to completed work
  - image: Upload image as proof
  - screenshot: Upload screenshot as proof
- One submission per worker per task (enforced by UNIQUE constraint)
- Cannot submit to own tasks
- Cannot submit to full tasks (current_completions >= max_completions)
- Cannot submit to expired tasks

#### 3.4 Image Upload
- Fastify multipart plugin for file uploads
- MVP: Store images locally in uploads/ directory
- Validate: file type (jpg, png, webp), max size (5MB)
- Generate unique filename (UUID + extension)
- Serve uploaded images via static file route
- Phase 2+: Migrate to S3/Cloudflare R2

#### 3.5 Submission Review (Task Givers)
- Task giver sees list of pending submissions for their tasks
- For each submission, task giver can:
  - APPROVE: Worker gets paid, completion count increments
  - REJECT: Worker can see rejection reason, may re-submit (future)
- On APPROVE:
  - Move reward from task giver's frozen_balance to worker's balance
  - Move platform fee portion to platform revenue
  - Increment task's current_completions
  - Create transaction records for both parties
  - If current_completions reaches max_completions → task status = 'completed'
- On REJECT:
  - Record rejection reason
  - Submission status = 'rejected'
  - Worker can see why it was rejected

#### 3.6 Task Completion & Cancellation
- Task auto-completes when current_completions = max_completions
- Task giver can cancel an active task:
  - Remaining frozen_balance (unspent portion) returned to available balance
  - Already-approved submissions are not reversed
  - Task status = 'cancelled'
- Expired tasks: Background job checks for expired tasks and handles them

#### 3.7 API Endpoints
- `GET /api/tasks` — List active tasks (paginated, filterable)
- `GET /api/tasks/:id` — Task detail with instructions
- `POST /api/tasks` — Create a new task (task giver only)
- `POST /api/tasks/:id/submit` — Submit proof (worker only)
- `GET /api/tasks/my-submissions` — Worker's submission history
- `GET /api/tasks/my-tasks` — Task giver's posted tasks
- `GET /api/tasks/:id/submissions` — Submissions for a task (task giver only)
- `PATCH /api/tasks/:id/submissions/:subId` — Approve/reject submission

---

## PHASE 4: WALLET SYSTEM
**Timeline:** Week 4-5
**Status:** NOT STARTED

### Features

#### 4.1 Wallet Management
- Every user has exactly one wallet (created during registration)
- Balance fields:
  - balance: Available funds the user can spend/withdraw
  - frozen_balance: Funds locked in escrow (task budgets awaiting completion)
  - total_earned: Lifetime earnings counter
  - total_withdrawn: Lifetime withdrawal counter
- All balance operations wrapped in PostgreSQL transactions (no partial updates)
- Every balance change creates a transaction record

#### 4.2 Escrow System
- **HOLD:** When task giver creates a task, total_budget moves from balance → frozen_balance
- **RELEASE:** When submission approved, reward moves from task giver's frozen_balance → worker's balance
- **REFUND:** When task cancelled, remaining frozen_balance returns to task giver's balance
- All escrow operations are atomic (single database transaction)
- Balance can never go negative (checked before every operation)

#### 4.3 Deposit Flow
- MVP: Admin manually credits task giver's balance
- Task giver requests deposit via the app
- Admin verifies payment received (crypto/mobile money)
- Admin uses balance adjustment tool to credit the amount
- Transaction record created with type = 'deposit'
- Future: Integrate TON blockchain for automatic deposits

#### 4.4 Reward Distribution
- Triggered when task giver approves a submission
- Atomic operation:
  1. Deduct reward from task giver's frozen_balance
  2. Add reward to worker's balance
  3. Update worker's total_earned
  4. Deduct platform fee from the escrow
  5. Create transaction records for all parties
  6. Check if this was a referred user's first task → credit referral bonus

#### 4.5 Withdrawal System
- Worker requests withdrawal: amount, method (TON/USDT_TRC20/manual), wallet address
- Validations:
  - Minimum withdrawal: $1.00
  - Daily limit: $50.00
  - Account must be 24+ hours old
  - Sufficient available balance
  - No pending withdrawal already in progress
- On request:
  - Deduct amount from worker's balance
  - Move to frozen_balance (held until admin processes)
  - Create transaction record with status = 'pending'
  - Withdrawal record created with status = 'pending'
- Admin processes manually (see Phase 6)
- Withdrawal fee: 3% or min $0.50 (deducted from amount)

#### 4.6 User-to-User Transfers
- Send balance to another user by their Telegram ID
- Validations:
  - Cannot transfer to yourself
  - Minimum amount check
  - Sufficient balance
  - Receiver must exist and be active
- Atomic operation:
  - Deduct from sender's balance
  - Add to receiver's balance
  - Create transaction records for both (transfer_out, transfer_in)
  - Create transfer record

#### 4.7 Transaction History
- Full list of all balance changes for a user
- Filterable by type (deposits, withdrawals, rewards, transfers, etc.)
- Paginated with newest first
- Shows: type, amount, balance before/after, description, timestamp, status

#### 4.8 API Endpoints
- `GET /api/wallet` — My balance info (balance, frozen, earned, withdrawn)
- `GET /api/wallet/transactions` — Transaction history (paginated, filterable)
- `POST /api/wallet/withdraw` — Request withdrawal
- `POST /api/wallet/transfer` — Transfer to another user
- `POST /api/wallet/deposit` — Request deposit (creates pending record for admin)

---

## PHASE 5: MINI APP UI
**Timeline:** Week 5-7
**Status:** NOT STARTED

### Features

#### 5.1 App Setup
- React 19 + Vite 6 + TypeScript
- Telegram WebApp SDK integration (@twa-dev/sdk)
- Theme sync with Telegram (dark/light mode auto-detection)
- Back button handling, haptic feedback, main button integration
- React Router for page navigation
- API client with automatic JWT attachment
- Error boundary for graceful crash handling

#### 5.2 Task Browsing Page
- Card-based list of active tasks
- Each card shows: title, reward, slots remaining, proof type icon
- Pull-to-refresh for new tasks
- Infinite scroll pagination
- Filter bar: proof type, reward range
- Sort: newest, highest reward, most available

#### 5.3 Task Detail + Submission Page
- Full task info: title, description, instructions, reward, slots
- Proof submission form based on proof_type:
  - Text: textarea input
  - Link: URL input with validation
  - Image/Screenshot: Camera/gallery picker + upload
- Submit button with confirmation
- Show existing submission status if already submitted

#### 5.4 Wallet Page
- Balance card showing available balance, frozen balance
- Lifetime stats: total earned, total withdrawn
- Recent transactions list (last 10)
- Quick action buttons: Withdraw, Transfer, View All Transactions

#### 5.5 Withdrawal Page
- Amount input with max button
- Method selector: TON, USDT (TRC20), Manual
- Wallet address input
- Fee calculation display (3% or min $0.50)
- You will receive: amount - fee
- Validation messages (min amount, daily limit, cooldown)
- Submit + confirmation flow

#### 5.6 Transfer Page
- Recipient: Telegram username or ID
- Amount input with max button
- Optional note
- Review screen before confirming
- Success/failure feedback

#### 5.7 My Submissions Page
- List of all submissions by the worker
- Status badges: pending (yellow), approved (green), rejected (red)
- Tap to see task details and proof submitted
- Filter by status

#### 5.8 Task Giver: Create Task Page
- Form: title, description, instructions, proof type selector
- Reward per user input
- Max completions input
- Budget calculator: reward × completions + 10% fee = total cost
- Balance check (show error if insufficient)
- Optional expiry date picker
- Preview before publishing

#### 5.9 Task Giver: Review Submissions Page
- List of tasks with pending submission count badges
- Tap task → see all submissions
- Each submission shows: worker info, proof content, timestamp
- Approve/Reject buttons with confirmation
- Rejection reason input (required on reject)

#### 5.10 Referral Page
- Unique referral link (tap to copy)
- Share button (Telegram share dialog)
- Stats: people referred, bonuses earned, pending bonuses
- List of referred users (name + join date)

---

## PHASE 6: ADMIN DASHBOARD
**Timeline:** Week 7-8
**Status:** NOT STARTED

### Features

#### 6.1 Admin App Setup
- React 19 + Vite 6 + Tailwind CSS + shadcn/ui components
- Separate from Telegram (web-based admin panel)
- Admin login via username/password or Telegram OAuth
- Protected routes (admin role required)
- Responsive layout (sidebar navigation)

#### 6.2 Dashboard Page
- Key metrics cards:
  - Total users, new users today/week
  - Active tasks, completed tasks
  - Pending withdrawals (count + total amount)
  - Pending task approvals
  - Total platform revenue
  - Total payouts
- Quick action buttons: Review Withdrawals, Review Tasks
- Charts: user growth, task volume, revenue over time (future)

#### 6.3 User Management
- Searchable, sortable table of all users
- Columns: Telegram ID, username, display name, role, status, balance, join date
- Actions per user:
  - View full profile + wallet + transaction history
  - Change role (worker/taskgiver/admin)
  - Change status (active/frozen/banned)
  - Manual balance adjustment (credit/debit with required reason)
- Filters: by role, status, join date range
- Export to CSV (future)

#### 6.4 Task Approval Queue
- Table of tasks with status = 'pending_approval'
- Shows: title, creator, reward, budget, completions, created date
- Click to view full task details + creator profile
- Actions:
  - Approve → task becomes 'active', visible to workers
  - Reject → task becomes 'rejected', frozen funds returned to creator
  - Add admin notes (visible internally)
- Filters: date range, creator

#### 6.5 Withdrawal Approval Queue
- Table of withdrawals with status = 'pending'
- Shows: user, amount, method, wallet address, requested date
- Click to view user profile + balance + recent activity
- Actions:
  - Approve → status changes to 'approved', admin processes manually
  - Mark as completed → enter transaction hash/proof, funds released
  - Reject → funds returned to user's available balance
  - Add admin notes
- Filters: method, date range, amount range

#### 6.6 Balance Adjustment Tool
- Select user by Telegram ID or search
- Enter amount (positive to credit, negative to debit)
- Required reason field
- Confirmation dialog showing before/after balance
- Creates admin_adjustment transaction + audit log entry

#### 6.7 Audit Log Viewer
- Chronological list of all admin actions
- Shows: admin who acted, action type, target, timestamp, details
- Filterable by: admin, action type, date range, target
- Non-deletable, append-only (integrity guarantee)

#### 6.8 API Endpoints Consumed
- `GET /api/admin/dashboard` — Stats overview
- `GET /api/admin/users` — User list (paginated, filterable)
- `PATCH /api/admin/users/:id` — Update user status/role
- `POST /api/admin/users/:id/adjust-balance` — Balance adjustment
- `GET /api/admin/tasks/pending` — Pending task approvals
- `PATCH /api/admin/tasks/:id` — Approve/reject task
- `GET /api/admin/withdrawals` — Pending withdrawals
- `PATCH /api/admin/withdrawals/:id` — Process withdrawal
- `GET /api/admin/audit-logs` — Audit trail

---

## PHASE 7: SECURITY & POLISH
**Timeline:** Week 8-9
**Status:** NOT STARTED

### Features

#### 7.1 Rate Limiting
- Redis-based rate limiter (sliding window algorithm)
- Per-user limits:
  - Auth: 10 requests/minute
  - Task submission: 20/hour
  - Withdrawal: 3/day
  - Transfer: 10/hour
  - General API: 100 requests/minute
- Returns 429 Too Many Requests with retry-after header
- Admin endpoints have higher limits

#### 7.2 Input Validation
- Zod schemas on every API endpoint (already defined in shared package)
- Request body, query params, and URL params all validated
- Descriptive error messages returned to client
- Strip unknown fields (prevent mass assignment)
- Sanitize text inputs (trim whitespace, limit length)

#### 7.3 Security Headers
- Helmet plugin for Fastify:
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security
  - X-XSS-Protection
- CORS restricted to known origins only
- No sensitive data in error responses (production mode)

#### 7.4 Anti-Spam Protections
- Submission cooldown: Min 30 seconds between submissions per user
- New account restrictions: 24-hour wait before first withdrawal
- Duplicate submission detection: Same proof text/link reused across tasks
- Account status checks on every request (frozen/banned users blocked)

#### 7.5 Withdrawal Safeguards
- Daily withdrawal limit: $50/user (configurable)
- Weekly withdrawal limit: $200/user (configurable)
- Minimum withdrawal amount: $1.00
- Account age requirement: 24 hours minimum
- Only one pending withdrawal at a time
- Admin approval required for all withdrawals

#### 7.6 Fraud Flag System
- Automated flags triggered by:
  - Unusually high submission rate
  - Multiple rejections in a row
  - Large withdrawal shortly after deposit
  - Suspicious referral patterns (many referrals, no activity)
- Flags visible to admins in user profile
- Flagged users can be frozen pending review
- Audit log captures all flag triggers

#### 7.7 UI Polish
- Error boundaries in React apps (graceful crash recovery)
- Loading skeletons for data-fetching states
- Toast notifications for actions (success/error feedback)
- Empty states for lists (no tasks, no submissions, etc.)
- Offline detection and retry mechanisms
- Form validation with real-time feedback

---

## PHASE 8: DEPLOYMENT & LAUNCH
**Timeline:** Week 9-10
**Status:** NOT STARTED

### Features

#### 8.1 Frontend Deployment (Vercel)
- Mini App deployed to Vercel (free tier)
  - Auto-deploys on git push to main
  - Global CDN for fast loading worldwide
  - Free SSL certificate
  - Environment variables configured in Vercel dashboard
- Admin Dashboard deployed to Vercel (separate project)
  - Same benefits as Mini App
  - Can be on custom domain (admin.taskandlearn.com)

#### 8.2 Backend Deployment (Railway or VPS)
- Fastify API + Telegram Bot deployed as persistent process
- Options:
  - Railway free tier (easiest, managed)
  - Small VPS like Hetzner/DigitalOcean ($5-10/month)
  - Docker container for consistent environments
- Process manager (PM2) for crash recovery on VPS
- Environment variables stored securely

#### 8.3 Production Database
- PostgreSQL managed instance:
  - Railway (included in free tier, small storage)
  - Supabase free tier (500MB, good for MVP)
  - Neon free tier (alternative)
- Connection pooling enabled
- Automated daily backups
- Run Prisma migrations on deploy

#### 8.4 Production Redis
- Redis managed instance:
  - Railway (included)
  - Upstash free tier (10k commands/day)
  - Redis Cloud free tier (30MB)
- Persistence enabled (RDB snapshots)
- Connection string stored in env vars

#### 8.5 Domain & SSL
- Custom domain for API (api.taskandlearn.com)
- SSL handled by hosting provider (Railway auto-SSL, or Let's Encrypt on VPS)
- Mini App URL: app.taskandlearn.com
- Admin URL: admin.taskandlearn.com

#### 8.6 Telegram Bot Configuration
- Switch from polling to webhook mode for production
- Webhook URL: https://api.taskandlearn.com/bot/webhook
- Register webhook with Telegram BotAPI
- Register Mini App URL with BotFather
- Set bot commands list with BotFather
- Set bot description and about text

#### 8.7 Monitoring & Health Checks
- Health check endpoint already exists (/api/health)
- Uptime monitoring (UptimeRobot free tier)
  - Monitor API health endpoint every 5 minutes
  - Alert on downtime (email/Telegram notification)
- Error tracking (Sentry free tier)
  - Catch unhandled errors in API and frontends
  - Stack traces with source maps
- Structured logging with Pino (queryable in production)

#### 8.8 Beta Launch
- Invite 10-20 test users
- Create test tasks with small rewards
- Verify full flow: register → browse tasks → submit proof → get approved → check balance → withdraw
- Verify admin flow: approve tasks → approve withdrawals → adjust balances
- Monitor logs for errors
- Collect user feedback
- Fix bugs and iterate before public launch

---

## ECONOMY MODEL SUMMARY

| Setting | Default Value | Configurable |
|---------|---------------|--------------|
| Platform fee on tasks | 10% | Yes (platform_settings) |
| Withdrawal fee | 3% or min $0.50 | Yes |
| Minimum task reward | $0.02 | Yes |
| Minimum withdrawal | $1.00 | Yes |
| Daily withdrawal limit | $50.00 | Yes |
| Weekly withdrawal limit | $200.00 | Yes |
| Referral bonus | $0.05 per referred user | Yes |
| New account withdrawal delay | 24 hours | Yes |
| Max submissions per hour | 20 | Yes |

---

## ANTI-FRAUD MEASURES SUMMARY

| Measure | Phase | Description |
|---------|-------|-------------|
| Telegram ID uniqueness | 1 | One account per Telegram user |
| Admin task approval | 3 | All tasks reviewed before going live |
| Admin withdrawal approval | 4 | All withdrawals manually processed |
| Rate limiting | 7 | Submission/withdrawal/API rate caps |
| Account age restriction | 7 | 24h wait before first withdrawal |
| Withdrawal limits | 7 | Daily $50, weekly $200 caps |
| Self-referral prevention | 2 | Cannot use own referral code |
| IP logging | 1 | All admin actions logged with IP |
| Fraud flags | 7 | Automated suspicious activity detection |
| Duplicate proof detection | Future | Image hash comparison |

---

## TECH STACK SUMMARY

| Component | Technology | Why |
|-----------|-----------|-----|
| Backend runtime | Node.js | Best Telegram bot ecosystem, async I/O |
| Backend framework | Fastify | 2-3x faster than Express, built-in validation |
| Language | TypeScript | Type safety for financial logic |
| Database | PostgreSQL | ACID transactions for money operations |
| ORM | Prisma | Type-safe queries, auto migrations |
| Cache/Queue | Redis + BullMQ | Rate limiting, sessions, background jobs |
| Telegram Bot | grammY | TypeScript-native, modern middleware |
| Mini App | React + Vite | Lightweight SPA, fast builds |
| Admin Dashboard | React + Tailwind + shadcn/ui | Production-quality components |
| Monorepo | pnpm + Turborepo | Shared types, single install, parallel builds |
| Frontend hosting | Vercel | Free, global CDN, auto-deploy |
| Backend hosting | Railway / VPS | Persistent process for bot + API |
