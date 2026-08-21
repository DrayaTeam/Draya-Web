import { Injectable, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import { AdminSupervisorDto, InviteSupervisorRequest } from '../models/admin-supervisor.model';

@Injectable({ providedIn: 'root' })
export class AdminSupervisorService extends ApiBaseService {
  private readonly basePath = '/admin/supervisors';

  private readonly mockSupervisors = signal<AdminSupervisorDto[]>([
    {
      id: 'sup-1',
      name: 'أ. عبدالرحمن العنزي',
      email: 'admin@draya.edu.sa',
      role: 'SuperAdmin',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      isCurrentUser: true,
    },
    {
      id: 'sup-2',
      name: 'د. سارة المنصور',
      email: 'sara.mansour@draya.edu.sa',
      role: 'Admin',
      isActive: true,
      createdAt: '2024-02-01T12:30:00Z',
      isCurrentUser: false,
    },
    {
      id: 'sup-3',
      name: 'م. خالد الدوسري',
      email: 'khalid.d@draya.edu.sa',
      role: 'Admin',
      isActive: false,
      createdAt: '2024-03-10T09:15:00Z',
      isCurrentUser: false,
    },
    {
      id: 'sup-4',
      name: 'أ. نورة القحطاني',
      email: 'noura.q@draya.edu.sa',
      role: 'Admin',
      isActive: true,
      createdAt: '2024-04-20T14:45:00Z',
      isCurrentUser: false,
    },
  ]);

  /** GET /api/v1/admin/supervisors */
  getSupervisors(): Observable<AdminSupervisorDto[]> {
    return this.get<AdminSupervisorDto[]>(this.basePath).pipe(
      tap((list) => {
        if (Array.isArray(list) && list.length > 0) {
          this.mockSupervisors.set(list);
        }
      }),
      catchError(() => of([...this.mockSupervisors()])),
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
          this.mockSupervisors.update((list) => [newSup, ...list]);
        }
      }),
      catchError(() => {
        const fallback: AdminSupervisorDto = {
          id: `sup-${Date.now()}`,
          name: request.name,
          email: request.email,
          role: request.role || 'Admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          isCurrentUser: false,
        };
        this.mockSupervisors.update((list) => [fallback, ...list]);
        return of(fallback);
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
        this.mockSupervisors.update((list) =>
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
