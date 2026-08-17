// src/app/features/plans/data/plans-comparison.data.ts
import { PlanCardItem } from '../models/plan-card.model';

export const PLANS_COMPARISON_DATA: readonly PlanCardItem[] = [
  {
    id: 'basic',
    name: 'أساسي',
    priceMonthly: 'مجاني',
    priceAnnual: 'مجاني',
    sub: 'للأكاديميات الناشئة',
    feats: ['حتى 50 طالب', 'مجموعتان كحد أقصى', 'باقتا دراسة', 'تقارير أداء مبسطة'],
    cta: 'ابدأ مجاناً',
    featured: false,
    isFree: true,
  },
  {
    id: 'pro',
    name: 'محترف',
    priceMonthly: 499,
    priceAnnual: 399,
    sub: 'للأكاديميات والسناتر المتكاملة',
    feats: [
      'طلاب غير محدودين',
      'مجموعات غير محدودة',
      'باقات غير محدودة',
      'AI Exam Builder',
      'تحليلات وتقارير AI للأولياء',
      'دعم فني أولوية',
    ],
    cta: 'ابدأ الآن',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'مؤسسات',
    priceMonthly: 'مخصَّص',
    priceAnnual: 'مخصَّص',
    sub: 'للمراكز التعليمية وسلاسل الأكاديميات',
    feats: [
      'كل مميزات محترف',
      'تخصيص الهوية (White-label)',
      'ربط API مخصص',
      'مدير حساب خاص وسرعة أداء مضاعفة',
    ],
    cta: 'تواصل معنا',
    isGradient: true,
    isCustom: true,
  },
];
