// User roles
export const UserRole = {
  WORKER: 'worker',
  TASKGIVER: 'taskgiver',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// User status
export const UserStatus = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  BANNED: 'banned',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Transaction types
export const TransactionType = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TASK_REWARD: 'task_reward',
  TASK_ESCROW_HOLD: 'task_escrow_hold',
  TASK_ESCROW_RELEASE: 'task_escrow_release',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
  REFERRAL_BONUS: 'referral_bonus',
  PLATFORM_FEE: 'platform_fee',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

// Transaction status
export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

// Task status
export const TaskStatus = {
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// Proof types
export const ProofType = {
  TEXT: 'text',
  IMAGE: 'image',
  LINK: 'link',
  SCREENSHOT: 'screenshot',
} as const;
export type ProofType = (typeof ProofType)[keyof typeof ProofType];

// Submission status
export const SubmissionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

// Withdrawal methods
export const WithdrawalMethod = {
  TON: 'ton',
  USDT_TRC20: 'usdt_trc20',
  MANUAL: 'manual',
} as const;
export type WithdrawalMethod = (typeof WithdrawalMethod)[keyof typeof WithdrawalMethod];

// Withdrawal status
export const WithdrawalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;
export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

// Transfer status
export const TransferStatus = {
  COMPLETED: 'completed',
  REVERSED: 'reversed',
} as const;
export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus];

// Referral status
export const ReferralStatus = {
  PENDING: 'pending',
  CREDITED: 'credited',
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

// Platform defaults
export const PLATFORM_DEFAULTS = {
  PLATFORM_FEE_PERCENT: 10,
  WITHDRAWAL_FEE_PERCENT: 3,
  MIN_WITHDRAWAL: 1.0,
  MIN_TASK_REWARD: 0.02,
  REFERRAL_BONUS: 0.05,
  DAILY_WITHDRAWAL_LIMIT: 50.0,
  NEW_ACCOUNT_WITHDRAWAL_DELAY_HOURS: 24,
  MAX_SUBMISSIONS_PER_HOUR: 20,
} as const;
