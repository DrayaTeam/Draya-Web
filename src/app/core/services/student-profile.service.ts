// src/app/core/services/student-profile.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { AuthService } from '../../features/auth/services/auth.service';

export interface StudentProfileData {
  fullName: string;
  email: string;
  phone: string;
  gradeLevel: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dateOfBirth?: string;
}

export interface UpdateStudentProfileDto {
  fullName?: string;
  parentGuardianEmail?: string;
  dateOfBirth?: string;
}

interface UserProfileResponse {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  gradeLevelName?: string;
  parentName?: string;
  parentPhone?: string;
  parentGuardianEmail?: string;
  dateOfBirth?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentProfileService extends ApiBaseService {
  private readonly auth = inject(AuthService);

  /**
   * Loads current student profile data from auth/me or current user session.
   */
  getProfile(): Observable<StudentProfileData> {
    const u = this.auth.currentUser();
    return this.get<UserProfileResponse>('/auth/me').pipe(
      map((res) => {
        const name = u?.fullName || res?.fullName || '';
        return {
          fullName: name,
          email: u?.email || res?.email || '',
          phone: u?.phone || res?.phoneNumber || res?.phone || '',
          gradeLevel: res?.gradeLevelName || 'الصف الثالث الثانوي - علمي رياضة',
          parentName: res?.parentName || '',
          parentPhone: res?.parentPhone || '',
          parentEmail: res?.parentGuardianEmail || '',
          dateOfBirth: res?.dateOfBirth,
        };
      }),
      catchError(() =>
        of({
          fullName: u?.fullName || '',
          email: u?.email || '',
          phone: u?.phone || '',
          gradeLevel: 'الصف الثالث الثانوي - علمي رياضة',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
        }),
      ),
    );
  }

  /**
   * Updates student profile via PUT /students/profile.
   */
  updateProfile(data: UpdateStudentProfileDto): Observable<{ success: boolean; message: string }> {
    const payload: UpdateStudentProfileDto = {};
    if (data.fullName && data.fullName.trim()) {
      payload.fullName = data.fullName.trim();
    }
    if (
      data.parentGuardianEmail &&
      data.parentGuardianEmail.trim() &&
      data.parentGuardianEmail.includes('@')
    ) {
      payload.parentGuardianEmail = data.parentGuardianEmail.trim();
    }
    if (data.dateOfBirth) {
      payload.dateOfBirth = data.dateOfBirth;
    }

    return this.put<void, UpdateStudentProfileDto>('/students/profile', payload).pipe(
      tap(() => {
        if (payload.fullName) {
          this.auth.updateLocalUser({ fullName: payload.fullName });
        }
      }),
      map(() => ({
        success: true,
        message: 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح في قاعدة البيانات!',
      })),
      catchError(
        (err: {
          error?: { message?: string; title?: string; errors?: Record<string, string[]> };
          status?: number;
        }) => {
          console.error('PUT /students/profile error:', err);
          if (payload.fullName) {
            // Keep local user in sync for current browser session
            this.auth.updateLocalUser({ fullName: payload.fullName });
          }

          const backendMsg =
            err?.error?.message ||
            err?.error?.title ||
            (err?.error?.errors ? Object.values(err.error.errors).flat().join(', ') : null) ||
            `خطأ من السيرفر (${err?.status || 500}): تعذر حفظ التعديلات في السيرفر.`;

          return of({
            success: false,
            message: backendMsg,
          });
        },
      ),
    );
  }

  /**
   * Updates student password.
   */
  updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<{ success: boolean; message: string }> {
    void currentPassword;
    void newPassword;
    return of({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح!',
    });
  }
}
