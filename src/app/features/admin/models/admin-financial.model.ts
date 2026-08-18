import { WalletBalanceType, WithdrawalStatus, PayoutAccountType } from './admin-enums';

export interface FinancialOverviewDto {
  totalClassroomRevenues: number;
  totalCommissionFees: number;
  totalTopUps: number;
  totalAiExamFees: number;
  totalEarnedTeacherBalance: number;
  totalPurchasedTeacherBalance: number;
  totalEarnedDue: number;
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

