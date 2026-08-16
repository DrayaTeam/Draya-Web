export enum WalletBalanceType {
  Earned = 'Earned',
  Purchased = 'Purchased',
}

export enum WithdrawalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
}

export enum WalletTransactionType {
  ClassroomEarning = 'ClassroomEarning',
  TeacherTopUp = 'TeacherTopUp',
  AIExamCharge = 'AIExamCharge',
  Withdrawal = 'Withdrawal',
  Refund = 'Refund',
  Adjustment = 'Adjustment',
}

export enum PayoutAccountType {
  BankAccount = 'BankAccount',
  MobileWallet = 'MobileWallet',
}
