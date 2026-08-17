// src/app/features/admin/services/admin-financial.service.ts
// Purpose: API client for SuperAdmin financial management endpoints.
// Covers: financial overview, withdrawals CRUD, manual adjustments, and platform settings.

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import {
  FinancialOverviewDto,
  WithdrawalDto,
  PlatformSettingsDto,
  AdjustmentRequest,
  PaginatedResponse,
} from '../models/admin-financial.model';

@Injectable({ providedIn: 'root' })
export class AdminFinancialService extends ApiBaseService {
  private readonly basePath = '/admin/financial';

  /** GET /api/v1/admin/financial/overview */
  getOverview(): Observable<FinancialOverviewDto> {
    return this.get<FinancialOverviewDto>(`${this.basePath}/overview`);
  }

  /** GET /api/v1/admin/financial/withdrawals */
  getWithdrawals(params: {
    statusFilter?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<WithdrawalDto>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.statusFilter) queryParams['statusFilter'] = params.statusFilter;
    if (params.pageNumber) queryParams['pageNumber'] = params.pageNumber;
    if (params.pageSize) queryParams['pageSize'] = params.pageSize;
    return this.get<PaginatedResponse<WithdrawalDto>>(`${this.basePath}/withdrawals`, queryParams);
  }

  /** POST /api/v1/admin/financial/withdrawals/{id}/approve */
  approveWithdrawal(id: string): Observable<void> {
    return this.post<void, undefined>(`${this.basePath}/withdrawals/${id}/approve`, undefined);
  }

  /** POST /api/v1/admin/financial/withdrawals/{id}/reject */
  rejectWithdrawal(id: string, rejectionReason: string): Observable<void> {
    return this.post<void, { rejectionReason: string }>(
      `${this.basePath}/withdrawals/${id}/reject`,
      { rejectionReason },
    );
  }

  /** POST /api/v1/admin/financial/withdrawals/{id}/mark-paid */
  markWithdrawalPaid(id: string, adminNote?: string): Observable<void> {
    return this.post<void, { adminNote?: string }>(`${this.basePath}/withdrawals/${id}/mark-paid`, {
      adminNote,
    });
  }

  /** POST /api/v1/admin/financial/adjustments */
  createAdjustment(request: AdjustmentRequest): Observable<void> {
    return this.post<void, AdjustmentRequest>(`${this.basePath}/adjustments`, request);
  }

  /** GET /api/v1/admin/financial/settings */
  getSettings(): Observable<PlatformSettingsDto> {
    return this.get<PlatformSettingsDto>(`${this.basePath}/settings`);
  }

  /** PUT /api/v1/admin/financial/settings */
  updateSettings(settings: PlatformSettingsDto): Observable<PlatformSettingsDto> {
    return this.put<PlatformSettingsDto, PlatformSettingsDto>(
      `${this.basePath}/settings`,
      settings,
    );
  }

  /** GET /api/v1/teachers - List all active teachers */
  getTeachers(): Observable<
    { userId?: string; id?: string; fullName?: string; name?: string; email?: string }[]
  > {
    return this.get<
      { userId?: string; id?: string; fullName?: string; name?: string; email?: string }[]
    >('/teachers');
  }
}
