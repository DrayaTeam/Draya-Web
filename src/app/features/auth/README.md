# 🔐 Authentication & Identity Module (`src/app/features/auth`)

## 📌 Architectural Overview

The **Auth Module** handles user authentication, registration for teachers and students, supervisor invitation acceptance, two-step password recovery, session token management, and JWT claim decoding across the Draya platform.

---

## 🏗️ Structure & Features

```
src/app/features/auth/
├── auth.routes.ts                      <-- Routing definitions with noAuthGuard
├── layout/auth-shell/                  <-- Split-screen branded authentication container
├── services/
│   ├── auth.service.ts                 <-- State signals (currentUser, isAuthenticated, isLoading)
│   ├── auth-api.service.ts             <-- HTTP client for /api/v1/auth/*
│   └── auth-api.token.ts               <-- Injection token for auth interface
├── pages/
│   ├── login/                          <-- Login credentials form
│   ├── register-teacher/               <-- Multi-step teacher registration
│   ├── register-student/               <-- Student registration with guardian fields
│   ├── forgot-password/                <-- Two-step password recovery (OTP + new password)
│   ├── reset-password/                 <-- Password reset confirmation
│   └── accept-invite/                  <-- Supervisor invitation acceptance & password setup
└── validators/                         <-- Egyptian phone, password strength & matching validators
```

---

## 📡 API Endpoints Consumed

| Feature                     | HTTP Method | Path                                  | Payload / Query                                                                                            |
| --------------------------- | ----------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Login**                   | `POST`      | `/api/v1/auth/login`                  | `{ email, password }`                                                                                      |
| **Register Teacher**        | `POST`      | `/api/v1/auth/register/teacher`       | `{ email, password, fullName, phone, specialization, description }`                                        |
| **Register Student**        | `POST`      | `/api/v1/auth/register/student`       | `{ email, password, fullName, parentGuardianEmail, parentGuardianName, parentGuardianPhone, dateOfBirth }` |
| **Refresh Token**           | `POST`      | `/api/v1/auth/refresh-token`          | `{ refreshToken }`                                                                                         |
| **Logout**                  | `POST`      | `/api/v1/auth/logout`                 | `{}`                                                                                                       |
| **Forgot Password Request** | `POST`      | `/api/v1/auth/password-reset/request` | `{ email }`                                                                                                |
| **Password Reset Confirm**  | `POST`      | `/api/v1/auth/password-reset/confirm` | `{ token, newPassword }`                                                                                   |
| **Accept Invitation**       | `POST`      | `/api/v1/auth/accept-invite`          | `{ email, token, password, confirmPassword }`                                                              |
| **Change Password**         | `POST`      | `/api/v1/auth/change-password`        | `{ currentPassword, newPassword, confirmPassword }`                                                        |
| **Get Profile**             | `GET`       | `/api/v1/auth/me`                     | N/A                                                                                                        |

---

## 🧪 Testing & Verification

- **Unit Testing (Karma/Jasmine):** Tests for `AuthService`, `AcceptInviteComponent`, `ForgotPasswordComponent`, `LoginComponent`, and custom validators.
- **E2E Testing (Playwright):** Browser tests in `e2e/auth-and-landing.spec.ts` and `e2e/auth-recovery-and-refunds.spec.ts`.
