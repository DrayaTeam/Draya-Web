import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TeacherProfile } from '../../../core/models/teacher.model';
import { AuthService } from '../../auth/services/auth.service';
import { decodeToken } from '../../../core/auth/jwt.util';

@Injectable({ providedIn: 'root' })
export class TeacherProfileService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiBaseUrl}/teachers`;

  /**
   * Fetches the teacher profile by ID.
   *
   * CONFIRMED BACKEND BUG WORKAROUND:
   * `GET /api/v1/teachers/{id}` always returns an empty string for the `email` field.
   * We intercept the response and populate the `email` field using the real email
   * stored in the AuthService state (from the decoded JWT token during login).
   */
  getProfile(userId: string): Observable<TeacherProfile> {
    return this.http.get<TeacherProfile>(`${this.baseUrl}/${userId}`).pipe(
      catchError((err) => {
        // If the teacher profile does not exist yet (404), return a default
        // profile populated with data from the JWT token.
        const errorCode = err?.code || `HTTP_${err?.status}`;
        if (errorCode === 'HTTP_404' || errorCode === 'NOT_FOUND' || err?.status === 404) {
          let email = '';
          let fullName = '';
          const token = this.auth.accessToken();
          if (token) {
            const claims = decodeToken(token);
            if (claims) {
              email = claims.email || '';
              fullName = claims.fullName || '';
            }
          }
          return of({
            userId,
            email,
            fullName,
            phone: '',
            specialization: '',
            description: '',
          } as TeacherProfile);
        }
        return throwError(() => err);
      }),
      map((profile) => {
        let realEmail = profile.email;
        const token = this.auth.accessToken();
        if (token) {
          const claims = decodeToken(token);
          if (claims?.email) {
            realEmail = claims.email;
          }
        }

        return {
          ...profile,
          // Overwrite the empty string with the real email from JWT
          email: realEmail,
        };
      }),
    );
  }

  /**
   * Updates the teacher profile.
   *
   * STRICT REPLACE `PUT` RULE:
   * `PUT /api/v1/teachers/profile` is a strict replacement. Any field omitted will be
   * wiped to `null` server-side. The payload MUST always contain all 4 editable fields
   * (`fullName`, `phone`, `specialization`, `description`).
   */
  updateProfile(payload: {
    fullName: string;
    phone: string;
    specialization: string;
    description: string;
  }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/profile`, payload);
  }

  /**
   * Uploads teacher profile avatar to Cloudinary via POST /api/v1/teachers/profile/picture.
   */
  uploadAvatar(
    file: File,
  ): Observable<{ success: boolean; profilePictureUrl?: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ profilePictureUrl: string }>(`${this.baseUrl}/profile/picture`, formData)
      .pipe(
        map((res) => {
          if (res && res.profilePictureUrl) {
            this.auth.updateLocalUser({ profilePictureUrl: res.profilePictureUrl });
          }
          return {
            success: true,
            profilePictureUrl: res?.profilePictureUrl,
            message: 'تم تحديث الصورة الشخصية للمعلم بنجاح!',
          };
        }),
        catchError((err) => {
          console.error('Teacher avatar upload error:', err);
          return of({
            success: false,
            message: 'تعذر رفع الصورة الشخصية. يرجى التأكد من صيغة الملف (.png, .jpg, .webp).',
          });
        }),
      );
  }

  /**
   * Updates teacher password via POST /api/v1/auth/change-password.
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
