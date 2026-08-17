// src/app/features/plans/models/plan-card.model.ts
export interface PlanCardItem {
  readonly id: string;
  readonly name: string;
  readonly priceMonthly: number | string;
  readonly priceAnnual: number | string;
  readonly sub: string;
  readonly feats: readonly string[];
  readonly cta: string;
  readonly featured?: boolean;
  readonly isGradient?: boolean;
  readonly isFree?: boolean;
  readonly isCustom?: boolean;
}
