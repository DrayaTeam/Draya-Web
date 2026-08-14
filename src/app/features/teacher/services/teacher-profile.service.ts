import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
      map(profile => {
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
          email: realEmail
        };
      })
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
  updateProfile(payload: { fullName: string; phone: string; specialization: string; description: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/profile`, payload);
  }
}
