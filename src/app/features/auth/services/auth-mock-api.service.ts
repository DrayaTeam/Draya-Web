import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { IAuthApi } from './auth-api.token';
import { RegisterTeacherRequest, RegisterStudentRequest, LoginRequest, AuthResponse, UserProfile } from '../../../core/models/auth.model';
import { ApiError } from '../../../core/models/api-error.model';
import { User, UserRole } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthMockApiService implements IAuthApi {
  // In-memory mock database
  private users: User[] = [
    { userId: '1', email: 'teacher@draya.app', fullName: 'أستاذ أحمد', role: 'teacher' as UserRole, phone: '01000000001' },
    { userId: '2', email: 'student@draya.app', fullName: 'طالب محمد', role: 'student' as UserRole, dateOfBirth: '2010-01-01', parentGuardianEmail: 'parent@draya.app' }
  ];

  private readonly delayMs = Math.floor(Math.random() * (1200 - 600 + 1)) + 600;

  private generateMockToken(): string {
    return 'mock-jwt-token-' + Math.random().toString(36).substring(2);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private checkEmailExists(email: string): boolean {
    return this.users.some(u => u.email === email);
  }

  registerTeacher(payload: RegisterTeacherRequest): Observable<AuthResponse> {
    if (this.checkEmailExists(payload.email)) {
      const error: ApiError = { code: 'CONFLICT', message: 'البريد الإلكتروني مستخدم بالفعل' };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    if (!payload.email || !payload.password || !payload.fullName) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid data',
        details: [{ field: 'general', message: 'البيانات غير مكتملة' }]
      };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    const newUser: User = {
      userId: this.generateId(),
      email: payload.email,
      fullName: payload.fullName,
      role: 'teacher' as UserRole,
      phone: payload.phone
    };
    
    this.users.push(newUser);

    return of({
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      user: newUser
    }).pipe(delay(this.delayMs));
  }

  registerStudent(payload: RegisterStudentRequest): Observable<AuthResponse> {
    if (this.checkEmailExists(payload.email)) {
      const error: ApiError = { code: 'CONFLICT', message: 'البريد الإلكتروني مستخدم بالفعل' };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    if (!payload.email || !payload.password || !payload.fullName) {
       const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid data',
        details: [{ field: 'general', message: 'البيانات غير مكتملة' }]
      };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    const newUser: User = {
      userId: this.generateId(),
      email: payload.email,
      fullName: payload.fullName,
      role: 'student' as UserRole,
      dateOfBirth: payload.dateOfBirth,
      parentGuardianEmail: payload.parentGuardianEmail
    };

    this.users.push(newUser);

    return of({
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      user: newUser
    }).pipe(delay(this.delayMs));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    const user = this.users.find(u => u.email === payload.email);
    // Simulation: Any password works except 'wrong' or empty, but email must match.
    if (!user || payload.password === 'wrong' || !payload.password) {
      const error: ApiError = { code: 'UNAUTHORIZED', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    return of({
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      user: user
    }).pipe(delay(this.delayMs));
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    if (!refreshToken) {
      const error: ApiError = { code: 'UNAUTHORIZED', message: 'Invalid refresh token' };
      return throwError(() => error).pipe(delay(this.delayMs));
    }
    
    return of({
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      user: this.users[0]
    }).pipe(delay(this.delayMs));
  }

  logout(): Observable<void> {
    return of(void 0).pipe(delay(this.delayMs));
  }

  getProfile(): Observable<UserProfile> {
    return of(this.users[0]).pipe(delay(this.delayMs));
  }
}
