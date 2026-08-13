// src/app/core/models/subscription.model.ts
// Domain models for Teacher Subscription plans, quotas, and usage limits.

export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export type BillingCycle = 'monthly' | 'annual';

export type QuotaType = 'classrooms' | 'students' | 'examGenerations' | 'storageMB';

export interface SubscriptionLimits {
  readonly maxClassrooms: number;
  readonly maxStudents: number;
  readonly maxExamGenerations: number;
  readonly maxStorageMB: number;
}

export interface SubscriptionPlan {
  readonly id: string;
  readonly planName: string;
  readonly tier: SubscriptionTier;
  readonly price: number;
  readonly billingCycle: BillingCycle;
  readonly status: SubscriptionStatus;
  readonly renewDate?: string;
  readonly paymentMethod?: string;
  readonly limits: SubscriptionLimits;
}

export interface SubscriptionUsage {
  readonly usedClassrooms: number;
  readonly maxClassrooms: number;
  readonly usedStudents: number;
  readonly maxStudents: number;
  readonly usedExamGenerations: number;
  readonly maxExamGenerations: number;
  readonly usedStorageMB: number;
  readonly maxStorageMB: number;
}

export interface QuotaItem {
  readonly type: QuotaType;
  readonly labelKey: string;
  readonly used: number;
  readonly max: number;
  readonly unitKey: string;
  readonly percentage: number;
  readonly isWarning: boolean;
  readonly isDanger: boolean;
}

export interface QuotaExceededError {
  readonly code: 'QUOTA_EXCEEDED';
  readonly quotaType: QuotaType;
  readonly message: string;
  readonly detail?: string;
}
