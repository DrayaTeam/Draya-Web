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
- `POST /api/v1/auth/password-reset/confirm` -> Body: `{ token, newPassword }` — `token` is the 6-digit OTP the user typed, not a URL token.

---

## 🔒 Validation

`otpCode` is locked to `Validators.pattern(/^\d{6}$/)` — exactly 6 digits, matching the code the backend actually emails. `onOtpInput()` strips any non-digit character and caps the field at 6 characters as the user types, so a pasted value can't slip past the pattern check silently.

## 🗑️ Superseded flow

The old query-param `/auth/reset-password?token=...` page assumed a URL-based reset token and has been removed — the backend no longer emails one. The route now redirects to `forgot-password` in case a stale bookmark or pre-redesign email link still points at it. A separate dead, unrouted stub at `features/auth/forgot-password/` (note: no `pages/` segment) that predated this component and collided on the same class name has also been deleted.

---

## 🧪 Testing

- **Unit Spec:** `forgot-password.component.spec.ts` (Tests step transition, 60s countdown, code submission, and error handling).
- **Playwright E2E:** `e2e/auth-recovery-and-refunds.spec.ts` -> `Feature O2: should support two-step forgot password recovery workflow`.
