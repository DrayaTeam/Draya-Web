// src/app/core/models/wallet.model.ts

export interface WalletBalance {
  earnedBalance: number;
  purchasedBalance: number;
  availableEarnedBalance: number;
}

export enum TransactionType {
  Earned = 0,
  Purchased = 1,
  Withdrawal = 2,
  TopUp = 3,
  Refund = 4
}

export enum BalanceType {
  Earned = 0,
  Purchased = 1
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceType: BalanceType;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export enum AccountType {
  InstaPay = 0,
  BankAccount = 1,
  MobileWallet = 2
}

export interface PayoutAccount {
  id: string;
  teacherId: string;
  accountType: AccountType;
  accountName: string;
  accountIdentifier: string; // Phone number for Instapay/Wallet, IBAN for Bank
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePayoutAccountRequest {
  accountType: AccountType;
  accountName: string;
  accountIdentifier: string;
  isDefault: boolean;
}

export enum WithdrawalStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Rejected = 3
}

export interface Withdrawal {
  id: string;
  teacherId: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  rejectionReason?: string;
}

export interface TopupResponse {
  transactionId: string;
  checkoutUrl: string;
}


