import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminSupervisorDto, InviteSupervisorRequest } from '../models/admin-supervisor.model';

@Injectable({ providedIn: 'root' })
export class AdminSupervisorService {
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

  getSupervisors(): Observable<AdminSupervisorDto[]> {
    return of([...this.mockSupervisors()]).pipe(delay(300));
  }

  inviteSupervisor(request: InviteSupervisorRequest): Observable<AdminSupervisorDto> {
    const newSupervisor: AdminSupervisorDto = {
      id: `sup-${Date.now()}`,
      name: request.name,
      email: request.email,
      role: request.role || 'Admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      isCurrentUser: false,
    };
    this.mockSupervisors.update((list) => [newSupervisor, ...list]);
    return of(newSupervisor).pipe(delay(400));
  }

  toggleSupervisorStatus(id: string, active: boolean): Observable<void> {
    this.mockSupervisors.update((list) =>
      list.map((s) => (s.id === id ? { ...s, isActive: active } : s)),
    );
    return of(undefined).pipe(delay(300));
  }
}
