import { z } from 'zod';

// Auth
export const telegramAuthSchema = z.object({
  initData: z.string().min(1),
});

// Task creation
export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  instructions: z.string().min(10).max(5000),
  proofType: z.enum(['text', 'image', 'link', 'screenshot']),
  rewardPerUser: z.number().positive().min(0.02),
  maxCompletions: z.number().int().positive().min(1).max(10000),
  expiresAt: z.string().datetime().optional(),
});

// Task submission
export const submitProofSchema = z.object({
  proofText: z.string().max(5000).optional(),
  proofLink: z.string().url().optional(),
  proofImageUrl: z.string().url().optional(),
});

// Review submission
export const reviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
});

// Withdrawal request
export const withdrawalRequestSchema = z.object({
  amount: z.number().positive().min(1.0),
  method: z.enum(['ton', 'usdt_trc20', 'manual']),
  walletAddress: z.string().min(1).max(200),
});

// Transfer
export const transferSchema = z.object({
  receiverTelegramId: z.number().int().positive(),
  amount: z.number().positive(),
  note: z.string().max(200).optional(),
});

// Deposit (task giver adding funds)
export const depositSchema = z.object({
  amount: z.number().positive(),
});

// Admin balance adjustment
export const balanceAdjustmentSchema = z.object({
  amount: z.number(), // can be negative
  reason: z.string().min(1).max(500),
});

// Admin task review
export const adminTaskReviewSchema = z.object({
  status: z.enum(['active', 'rejected']),
  adminNotes: z.string().max(500).optional(),
});

// Admin withdrawal review
export const adminWithdrawalReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().max(500).optional(),
  transactionHash: z.string().max(200).optional(),
});

// Admin user update
export const adminUserUpdateSchema = z.object({
  status: z.enum(['active', 'frozen', 'banned']).optional(),
  role: z.enum(['worker', 'taskgiver', 'admin']).optional(),
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Export types
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type SubmitProofInput = z.infer<typeof submitProofSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type BalanceAdjustmentInput = z.infer<typeof balanceAdjustmentSchema>;
export type AdminTaskReviewInput = z.infer<typeof adminTaskReviewSchema>;
export type AdminWithdrawalReviewInput = z.infer<typeof adminWithdrawalReviewSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
