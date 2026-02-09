import type {
  UserRole,
  UserStatus,
  TransactionType,
  TransactionStatus,
  TaskStatus,
  ProofType,
  SubmissionStatus,
  WithdrawalStatus,
  WithdrawalMethod,
  TransferStatus,
  ReferralStatus,
} from './constants.js';

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User
export interface UserDTO {
  id: string;
  telegramId: number;
  telegramUsername: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  createdAt: string;
}

// Wallet
export interface WalletDTO {
  id: string;
  userId: string;
  balance: string; // decimal as string for precision
  frozenBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
}

// Transaction
export interface TransactionDTO {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string | null;
  referenceType: string | null;
  description: string | null;
  status: TransactionStatus;
  createdAt: string;
}

// Task
export interface TaskDTO {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  instructions: string;
  proofType: ProofType;
  rewardPerUser: string;
  maxCompletions: number;
  currentCompletions: number;
  totalBudget: string;
  status: TaskStatus;
  expiresAt: string | null;
  createdAt: string;
}

// Task Submission
export interface TaskSubmissionDTO {
  id: string;
  taskId: string;
  workerId: string;
  proofText: string | null;
  proofImageUrl: string | null;
  proofLink: string | null;
  status: SubmissionStatus;
  reviewerId: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

// Withdrawal
export interface WithdrawalDTO {
  id: string;
  userId: string;
  amount: string;
  method: WithdrawalMethod;
  walletAddress: string;
  status: WithdrawalStatus;
  adminId: string | null;
  adminNotes: string | null;
  processedAt: string | null;
  transactionHash: string | null;
  createdAt: string;
}

// Transfer
export interface TransferDTO {
  id: string;
  senderId: string;
  receiverId: string;
  amount: string;
  note: string | null;
  status: TransferStatus;
  createdAt: string;
}

// Referral
export interface ReferralDTO {
  id: string;
  referrerId: string;
  referredId: string;
  bonusAmount: string | null;
  status: ReferralStatus;
  createdAt: string;
}

// Admin dashboard stats
export interface DashboardStatsDTO {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  activeTasks: number;
  pendingWithdrawals: number;
  pendingTasks: number;
  totalPlatformRevenue: string;
  totalPayouts: string;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  telegramId: number;
  role: UserRole;
}
