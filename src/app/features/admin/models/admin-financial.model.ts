import { WalletBalanceType, WithdrawalStatus, PayoutAccountType } from './admin-enums';

export interface FinancialOverviewDto {
  totalClassroomRevenue: number;
  totalCommissionCollected: number;
  totalTopUps: number;
  totalAIExamCharges: number;
  totalTeacherEarnedBalance: number;
  totalTeacherPurchasedBalance: number;
  totalOutstandingEarnedBalance: number;
}

export interface PayoutAccountDto {
  id: string;
  accountType: PayoutAccountType;
  accountName: string;
  accountIdentifier: string;
  isDefault: boolean;
}

export interface WithdrawalDto {
  id: string;
  teacherName: string;
  teacherEmail: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: string | Date;
  payoutAccount?: PayoutAccountDto;
  rejectionReason?: string;
  adminNote?: string;
}

export interface PlatformSettingsDto {
  aiExamPrice: number;
  freeMonthlyAIExamQuota: number;
  platformCommissionPercent: number;
}

export interface AdjustmentRequest {
  teacherId: string;
  amount: number;
  balanceType: WalletBalanceType;
  reason: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface TeacherSearchResultDto {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  earnedBalance?: number;
  purchasedBalance?: number;
  phone?: string;
}

export interface UpdateAdminProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface AdjustmentAuditItemDto {
  transactionId: string;
  teacherId: string;
  teacherName?: string;
  amount: number;
  balanceType: WalletBalanceType | string;
  description: string;
  createdAt: string | Date;
}
