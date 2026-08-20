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
  profilePictureUrl?: string;
}

export interface UpdateStudentProfileDto {
  fullName?: string;
  parentGuardianEmail?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
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
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  parentGuardianEmail?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
}

interface AvatarUploadResponse {
  profilePictureUrl: string;
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
      tap((res) => {
        if (res?.profilePictureUrl) {
          this.auth.updateLocalUser({ profilePictureUrl: res.profilePictureUrl });
        }
      }),
      map((res) => {
        const name = u?.fullName || res?.fullName || '';
        return {
          fullName: name,
          email: u?.email || res?.email || '',
          phone: u?.phone || res?.phoneNumber || res?.phone || '',
          gradeLevel: res?.gradeLevelName || 'الصف الثالث الثانوي - علمي رياضة',
          parentName: res?.parentGuardianName || res?.parentName || '',
          parentPhone: res?.parentGuardianPhone || res?.parentPhone || '',
          parentEmail: res?.parentGuardianEmail || '',
          dateOfBirth: res?.dateOfBirth,
          profilePictureUrl: u?.profilePictureUrl || res?.profilePictureUrl || '',
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
          profilePictureUrl: u?.profilePictureUrl || '',
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
    if (data.parentGuardianEmail && data.parentGuardianEmail.trim()) {
      payload.parentGuardianEmail = data.parentGuardianEmail.trim();
    }
    if (data.parentGuardianName && data.parentGuardianName.trim()) {
      payload.parentGuardianName = data.parentGuardianName.trim();
    }
    if (data.parentGuardianPhone && data.parentGuardianPhone.trim()) {
      payload.parentGuardianPhone = data.parentGuardianPhone.trim();
    }
    if (data.dateOfBirth) {
      try {
        const d = new Date(data.dateOfBirth);
        payload.dateOfBirth = !isNaN(d.getTime()) ? d.toISOString() : data.dateOfBirth;
      } catch {
        payload.dateOfBirth = data.dateOfBirth;
      }
    }

    return this.put<void, UpdateStudentProfileDto>('/students/profile', payload).pipe(
      tap(() => {
        if (payload.fullName) {
          this.auth.updateLocalUser({
            fullName: payload.fullName,
            ...(payload.parentGuardianEmail
              ? { parentGuardianEmail: payload.parentGuardianEmail }
              : {}),
            ...(payload.dateOfBirth ? { dateOfBirth: payload.dateOfBirth } : {}),
          });
        }
      }),
      map(() => ({
        success: true,
        message: 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح في قاعدة البيانات!',
      })),
      catchError(
        (err: {
          error?: {
            message?: string;
            title?: string;
            details?: unknown;
            errors?: Record<string, string[]>;
          };
          status?: number;
        }) => {
          console.error('PUT /students/profile error:', err);

          let backendMsg = err?.error?.message || err?.error?.title;

          if (err?.error?.details) {
            if (Array.isArray(err.error.details)) {
              const items = err.error.details
                .map((d: unknown) => {
                  if (typeof d === 'string') return d;
                  if (d && typeof d === 'object') {
                    const obj = d as Record<string, unknown>;
                    return (
                      (typeof obj['message'] === 'string' ? obj['message'] : null) ||
                      (typeof obj['errorMessage'] === 'string' ? obj['errorMessage'] : null) ||
                      (typeof obj['description'] === 'string' ? obj['description'] : null) ||
                      (typeof obj['field'] === 'string'
                        ? `${obj['field']}: ${(obj['message'] as string) || 'قيمة غير صالحة'}`
                        : null) ||
                      JSON.stringify(d)
                    );
                  }
                  return String(d);
                })
                .filter(Boolean);

              if (items.length > 0) {
                backendMsg = items.join(' — ');
              }
            } else if (typeof err.error.details === 'object') {
              backendMsg = Object.values(err.error.details as Record<string, unknown>)
                .flat()
                .join(' — ');
            }
          } else if (err?.error?.errors) {
            backendMsg = Object.values(err.error.errors).flat().join(' — ');
          }

          if (!backendMsg) {
            backendMsg = `خطأ من السيرفر (${err?.status || 500}): تعذر حفظ التعديلات في السيرفر.`;
          }

          return of({
            success: false,
            message: backendMsg,
          });
        },
      ),
    );
  }

  /**
   * Uploads student profile avatar to Cloudinary via POST /api/v1/students/profile/picture.
   */
  uploadAvatar(
    file: File,
  ): Observable<{ success: boolean; profilePictureUrl?: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<AvatarUploadResponse>('/students/profile/picture', formData).pipe(
      tap((res) => {
        if (res && res.profilePictureUrl) {
          this.auth.updateLocalUser({ profilePictureUrl: res.profilePictureUrl });
        }
      }),
      map((res) => ({
        success: true,
        profilePictureUrl: res?.profilePictureUrl,
        message: 'تم تحديث الصورة الشخصية بنجاح عبر السحابة!',
      })),
      catchError((err) => {
        console.error('Avatar upload error:', err);
        return of({
          success: false,
          message: 'تعذر رفع الصورة الشخصية. يرجى التأكد من صيغة الملف (.png, .jpg, .webp).',
        });
      }),
    );
  }

  /**
   * Updates student password via POST /api/v1/auth/change-password.
   */
  updatePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword = newPassword,
  ): Observable<{ success: boolean; message: string }> {
    return this.auth.changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }
}
