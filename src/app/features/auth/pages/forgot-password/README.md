# 🔑 Two-Step Forgot Password Recovery (`src/app/features/auth/pages/forgot-password`)

## 📌 Architectural Purpose

Provides a modern two-step account recovery mechanism where users request a 6-digit OTP verification code via email, and then confirm identity by providing the code and setting a new strong password.

---

## 🧩 Component Architecture & State Management

- **Component:** `ForgotPasswordComponent` (`forgot-password.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `currentStep`: Signal switching between `1` (Email Request) and `2` (OTP & New Password).
  - `resendCountdown`: Numeric countdown signal (starts at 60s) controlling resend code throttling.
  - `isSuccess`: Boolean signal indicating successful password reset.
  - `passwordStrength`: Real-time strength calculator.
- **Forms:**
  - Step 1: `emailForm` (`email`).
  - Step 2: `resetForm` (`otpCode`, `newPassword`, `confirmPassword`).

---

## 📡 API Endpoints Consumed

- `POST /api/v1/auth/password-reset/request` -> Body: `{ email }`.
- `POST /api/v1/auth/password-reset/confirm` -> Body: `{ token, newPassword }`.

---

## 🧪 Testing

- **Unit Spec:** `forgot-password.component.spec.ts` (Tests step transition, 60s countdown, code submission, and error handling).
- **Playwright E2E:** `e2e/auth-recovery-and-refunds.spec.ts` -> `Feature O2: should support two-step forgot password recovery workflow`.
