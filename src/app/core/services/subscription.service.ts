// src/app/core/services/subscription.service.ts
// Purpose: Manages teacher subscription plan data, real-time usage metrics, and quota warning signals.

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, forkJoin, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionPlan, SubscriptionUsage, QuotaItem } from '../models/subscription.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly baseUrl = `${environment.apiBaseUrl}/subscription`;

  // Internal reactive state
  private readonly _plan = signal<SubscriptionPlan | null>(null);
  private readonly _usage = signal<SubscriptionUsage | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly plan = this._plan.asReadonly();
  readonly usage = this._usage.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Derived quota metrics
  readonly classroomsPercent = computed(() => {
    const u = this._usage();
    if (!u || !u.maxClassrooms) return 0;
    return Math.min(100, Math.round((u.usedClassrooms / u.maxClassrooms) * 100));
  });

  readonly studentsPercent = computed(() => {
    const u = this._usage();
    if (!u || !u.maxStudents) return 0;
    return Math.min(100, Math.round((u.usedStudents / u.maxStudents) * 100));
  });

  readonly examGenerationsPercent = computed(() => {
    const u = this._usage();
    if (!u || !u.maxExamGenerations) return 0;
    return Math.min(100, Math.round((u.usedExamGenerations / u.maxExamGenerations) * 100));
  });

  readonly storagePercent = computed(() => {
    const u = this._usage();
    if (!u || !u.maxStorageMB) return 0;
    return Math.min(100, Math.round((u.usedStorageMB / u.maxStorageMB) * 100));
  });

  readonly quotas = computed<QuotaItem[]>(() => {
    const u = this._usage();
    if (!u) return [];

    const items: {
      type: 'students' | 'storageMB' | 'examGenerations' | 'classrooms';
      labelKey: string;
      used: number;
      max: number;
      unitKey: string;
    }[] = [
      {
        type: 'students',
        labelKey: 'SUBSCRIPTION.QUOTAS.STUDENTS',
        used: u.usedStudents,
        max: u.maxStudents,
        unitKey: 'SUBSCRIPTION.UNITS.STUDENTS',
      },
      {
        type: 'storageMB',
        labelKey: 'SUBSCRIPTION.QUOTAS.STORAGE',
        used: Math.round((u.usedStorageMB / 1024) * 10) / 10,
        max: Math.round((u.maxStorageMB / 1024) * 10) / 10,
        unitKey: 'SUBSCRIPTION.UNITS.GB',
      },
      {
        type: 'examGenerations',
        labelKey: 'SUBSCRIPTION.QUOTAS.EXAM_GENERATIONS',
        used: u.usedExamGenerations,
        max: u.maxExamGenerations,
        unitKey: 'SUBSCRIPTION.UNITS.EXAMS',
      },
      {
        type: 'classrooms',
        labelKey: 'SUBSCRIPTION.QUOTAS.CLASSROOMS',
        used: u.usedClassrooms,
        max: u.maxClassrooms,
        unitKey: 'SUBSCRIPTION.UNITS.GROUPS',
      },
    ];

    return items.map((item) => {
      const pct = item.max > 0 ? Math.round((item.used / item.max) * 100) : 0;
      return {
        type: item.type,
        labelKey: item.labelKey,
        used: item.used,
        max: item.max,
        unitKey: item.unitKey,
        percentage: Math.min(100, pct),
        isWarning: pct >= 80 && pct < 100,
        isDanger: pct >= 100,
      };
    });
  });

  /** Returns true if any quota is at or above the 80% warning threshold. */
  readonly isNearLimit = computed(() =>
    this.quotas().some((q) => q.percentage >= 80 && q.percentage < 100),
  );

  /** Returns true if any quota has reached 100% capacity. */
  readonly isAtLimit = computed(() => this.quotas().some((q) => q.percentage >= 100));

  /**
   * Fetches the current teacher subscription plan.
   */
  getCurrentPlan(): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.baseUrl}/current`).pipe(
      tap((plan) => this._plan.set(plan)),
      catchError(() => {
        // Provide mock fallback data if backend endpoint is unavailable
        const fallback = this.getMockPlan();
        this._plan.set(fallback);
        return of(fallback);
      }),
    );
  }

  /**
   * Fetches the current teacher quota usage.
   */
  getUsage(): Observable<SubscriptionUsage> {
    return this.http.get<SubscriptionUsage>(`${this.baseUrl}/usage`).pipe(
      tap((usage) => this._usage.set(usage)),
      catchError(() => {
        // Provide mock fallback data if backend endpoint is unavailable
        const fallback = this.getMockUsage();
        this._usage.set(fallback);
        return of(fallback);
      }),
    );
  }

  /**
   * Loads both plan and usage simultaneously in parallel.
   */
  loadSubscriptionData(): Observable<{
    plan: SubscriptionPlan;
    usage: SubscriptionUsage;
  }> {
    this._loading.set(true);
    this._error.set(null);

    return forkJoin({
      plan: this.getCurrentPlan(),
      usage: this.getUsage(),
    }).pipe(
      tap({
        next: ({ plan, usage }) => {
          this._plan.set(plan);
          this._usage.set(usage);
          this._loading.set(false);
        },
        error: (err: HttpErrorResponse | Error) => {
          if (err instanceof HttpErrorResponse && err.status === 422) {
            this.toast.error('تجاوز حد الاستهلاك', 'لقد تجاوزت الحد المسموح به لخطتك');
          }
          this._error.set(err?.message ?? 'SUBSCRIPTION.ERRORS.LOAD_FAILED');
          this._loading.set(false);
        },
      }),
    );
  }

  /**
   * Enforces quota limits (US-012). If requested action exceeds quota or receives 422,
   * shows the required toast error: "لقد تجاوزت الحد المسموح به لخطتك".
   */
  handleQuotaExceeded(): void {
    this.toast.error('تجاوز حد الاستهلاك', 'لقد تجاوزت الحد المسموح به لخطتك');
  }

  /**
   * Checks if action is allowed under current quota. Returns false and triggers toast if exceeded.
   */
  canPerformAction(type: 'examGenerations' | 'storageMB' | 'students' | 'classrooms'): boolean {
    const quota = this.quotas().find((q) => q.type === type);
    if (quota && quota.used >= quota.max) {
      this.handleQuotaExceeded();
      return false;
    }
    return true;
  }

  private getMockPlan(): SubscriptionPlan {
    return {
      id: 'sub_pro_101',
      planName: 'الخطة الاحترافية (Professional)',
      tier: 'pro',
      price: 399,
      billingCycle: 'monthly',
      status: 'active',
      renewDate: '2026-08-20',
      paymentMethod: 'بطاقة ميزة تنتهي بـ 4321',
      limits: {
        maxClassrooms: 15,
        maxStudents: 500,
        maxExamGenerations: 20,
        maxStorageMB: 10240, // 10 GB
      },
    };
  }

  private getMockUsage(): SubscriptionUsage {
    return {
      usedClassrooms: 12,
      maxClassrooms: 15,
      usedStudents: 410,
      maxStudents: 500,
      usedExamGenerations: 17,
      maxExamGenerations: 20,
      usedStorageMB: 8192,
      maxStorageMB: 10240,
    };
  }
}
