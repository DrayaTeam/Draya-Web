import { Injectable, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import { AdminSupervisorDto, InviteSupervisorRequest } from '../models/admin-supervisor.model';

@Injectable({ providedIn: 'root' })
export class AdminSupervisorService extends ApiBaseService {
  private readonly basePath = '/admin/supervisors';

  readonly supervisorsList = signal<AdminSupervisorDto[]>([]);

  /** GET /api/v1/admin/supervisors */
  getSupervisors(): Observable<AdminSupervisorDto[]> {
    return this.get<AdminSupervisorDto[]>(this.basePath).pipe(
      tap((list) => {
        const items = Array.isArray(list) ? list : [];
        this.supervisorsList.set(items);
      }),
      catchError(() => {
        this.supervisorsList.set([]);
        return of([]);
      }),
    );
  }

  /** POST /api/v1/admin/supervisors/invite */
  inviteSupervisor(request: InviteSupervisorRequest): Observable<AdminSupervisorDto> {
    return this.post<AdminSupervisorDto, InviteSupervisorRequest>(
      `${this.basePath}/invite`,
      request,
    ).pipe(
      tap((newSup) => {
        if (newSup) {
          this.supervisorsList.update((list) => [newSup, ...list]);
        }
      }),
    );
  }

  /** POST /api/v1/admin/supervisors/{id}/resend-invite */
  resendInvite(id: string): Observable<void> {
    return this.post<void, undefined>(`${this.basePath}/${id}/resend-invite`, undefined);
  }

  /** PUT /api/v1/admin/supervisors/{id}/status */
  toggleSupervisorStatus(id: string, active: boolean): Observable<void> {
    return this.put<void, { isActive: boolean }>(`${this.basePath}/${id}/status`, {
      isActive: active,
    }).pipe(
      tap(() => {
        this.supervisorsList.update((list) =>
          list.map((s) => (s.id === id ? { ...s, isActive: active } : s)),
        );
      }),
    );
  }

  /** PUT /api/v1/admin/profile */
  updateAdminProfile(data: {
    fullName: string;
    email?: string;
    phoneNumber?: string;
  }): Observable<void> {
    return this.put<void, { fullName: string; email?: string; phoneNumber?: string }>(
      '/admin/profile',
      data,
    );
  }

  /** GET /api/v1/admin/students */
  getStudents(params?: {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
  }): Observable<AdminStudentPagedResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.searchTerm && params.searchTerm.trim()) {
      queryParams['q'] = params.searchTerm.trim();
    }
    if (params?.page) queryParams['page'] = params.page;
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize;
    return this.get<AdminStudentPagedResponse>('/admin/students', queryParams);
  }
}

export interface AdminStudentSearchResultDto {
  userId: string;
  fullName: string;
  email: string;
  parentGuardianEmail?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminStudentPagedResponse {
  items: AdminStudentSearchResultDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
