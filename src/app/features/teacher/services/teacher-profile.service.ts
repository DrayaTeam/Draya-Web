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
        console.log('[DEBUG] GET /teachers/{id} returned:', profile);
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
          // DEFENSIVE: backend uses inconsistent field names for the profile picture URL.
          // Check all known variants before falling through to undefined.
          pictureUrl:
            (
              profile as TeacherProfile & {
                profilePictureUrl?: string;
                pictureUrl?: string;
                profilePicture?: string;
                avatarUrl?: string;
                avatar?: string;
                imageUrl?: string;
              }
            ).profilePictureUrl ||
            (profile as TeacherProfile & { pictureUrl?: string }).pictureUrl ||
            (profile as TeacherProfile & { profilePicture?: string }).profilePicture ||
            (profile as TeacherProfile & { avatarUrl?: string }).avatarUrl ||
            (profile as TeacherProfile & { avatar?: string }).avatar ||
            (profile as TeacherProfile & { imageUrl?: string }).imageUrl ||
            undefined,
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
   * Uploads a new profile picture for the teacher.
   * `POST /api/v1/teachers/profile/picture`
   */
  uploadProfilePicture(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ profilePictureUrl: string }>(`${this.baseUrl}/profile/picture`, formData)
      .pipe(
        map((res) => {
          console.log('[DEBUG] POST /profile/picture returned:', res);
          return res.profilePictureUrl;
        }),
      );
  }
}
