// src/app/features/plans/models/plan-detail.model.ts
export interface PlanQuote {
  readonly text: string;
  readonly author: string;
  readonly role: string;
}

export interface PlanFaq {
  readonly q: string;
  readonly a: string;
}

export interface PlanDetailData {
  readonly id: string;
  readonly name: string;
  readonly badge: string;
  readonly tagline: string;
  readonly price: string;
  readonly period: string;
  readonly color: string;
  readonly gradient: string;
  readonly target: string;
  readonly heroImg: string;
  readonly features: readonly string[];
  readonly unavailable: readonly string[];
  readonly quote: PlanQuote;
  readonly faqs: readonly PlanFaq[];
}
