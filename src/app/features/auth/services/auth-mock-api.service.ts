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
      expiresIn: payload.rememberMe ? 3600 * 24 * 7 : 3600,
      user: user
    }).pipe(delay(this.delayMs));
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    if (!refreshToken || refreshToken === 'invalid' || refreshToken === 'expired') {
      const error: ApiError = { code: 'UNAUTHORIZED', message: 'الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى' };
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
    // Simulating a successful logout. If a simulated failure was needed,
    // it would throw an ApiError matching the interceptor's expected shape.
    return of(void 0).pipe(delay(this.delayMs));
  }

  getProfile(): Observable<UserProfile> {
    if (this.users.length === 0) {
      const error: ApiError = { code: 'UNAUTHORIZED', message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' };
      return throwError(() => error).pipe(delay(this.delayMs));
    }
    return of(this.users[0]).pipe(delay(this.delayMs));
  }

  // PROVISIONAL: contract not yet confirmed by backend — revisit endpoint shape once delivered
  forgotPassword(email: string): Observable<{ message: string }> {
    // In a real app we'd send an email. For now, just ensure it's provided.
    if (!email) {
      return throwError(() => ({ code: 'BAD_REQUEST', message: 'Email is required' } as ApiError));
    }
    // Always return a generic success response regardless of whether the email exists
    return of({ message: 'If this email exists, a reset link has been sent.' }).pipe(delay(this.delayMs));
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<{ message: string }> {
    if (payload.token !== 'mock-valid-token') {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid or expired token',
        details: [{ field: 'token', message: 'The reset link is invalid or has expired.' }]
      };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    // Defense in depth: validate password strength
    const pwd = payload.newPassword;
    const minLengthValid = pwd.length >= 12;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumeric = /[0-9]/.test(pwd);
    const hasSpecial = /[\W_]/.test(pwd);
    
    if (!(minLengthValid && hasUpperCase && hasLowerCase && hasNumeric && hasSpecial)) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Password does not meet complexity requirements',
        details: [{ field: 'newPassword', message: 'كلمة المرور ضعيفة' }]
      };
      return throwError(() => error).pipe(delay(this.delayMs));
    }

    return of({ message: 'Password has been reset successfully.' }).pipe(delay(this.delayMs));
  }
}
