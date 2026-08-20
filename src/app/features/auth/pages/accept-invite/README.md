# ✉️ Supervisor Accept Invitation Feature (`src/app/features/auth/pages/accept-invite`)

## 📌 Architectural Purpose

Provides invited platform supervisors and administrators with a dedicated onboarding and password configuration screen, verifying invitation tokens dispatched via email.

---

## 🧩 Component Architecture & State Management

- **Component:** `AcceptInviteComponent` (`accept-invite.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `loading`: Signal tracking HTTP submission state.
  - `isSuccess`: Boolean signal displaying the success state upon account activation.
  - `isInvalidToken`: Boolean signal indicating a missing or expired invitation token.
  - `passwordStrength`: Signal tracking password complexity (`weak` | `medium` | `strong`).
- **Form:** Reactive form with `fullName`, `phone`, `password`, and `confirmPassword`.

---

## 📡 API Endpoints Consumed

- `POST /api/v1/auth/accept-invite` -> Body: `{ email, token, password, confirmPassword, fullName, phone }`.

---

## 🧪 Testing

- **Unit Spec:** `accept-invite.component.spec.ts` (Tests token extraction, password match validation, successful submission, and error handling).
- **Playwright E2E:** `e2e/auth-recovery-and-refunds.spec.ts` -> `Feature O1: should render accept invitation page and handle token query param`.
