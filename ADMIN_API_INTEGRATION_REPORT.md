# Admin Dashboard & Financial Module – API Integration Report

**Date:** August 17, 2026  
**Document Purpose:** Frontend-to-Backend integration reference, endpoint audit, and specification bridge for upcoming backend tasks.  
**Frontend Stack:** Angular 20 (Standalone + Signals), PrimeNG v20, Tailwind v4.  
**Branch:** `feature/admin-module`  

---

## 1. Executive Summary

The Admin Module shell, UI components, layout, and 8 operational pages (Dashboard, Withdrawals, Adjustments, Classroom Types, Grade Levels, Supervisors, Settings, and Profile) have been built and styled according to the **Academic Precision** design specification.

- **Live Endpoints Integrated:** 11 endpoints (Financial Overview, Withdrawals Workflow, Manual Adjustments, Platform Financial Settings, Classroom Types CRUD, Grade Levels CRUD, and Auth/Profile).
- **Fallback Policy:** **Zero artificial fallbacks.** If the database has 0 items, the UI displays genuine empty states. If an API call fails, actual error messages from the backend payload are surfaced via `ToastService`.
- **Pending Backend Endpoints:** 4 key areas (Admin Profile/Security, Supervisor Invitation & Onboarding Workflow, Supervisor Status Management, and Teacher Search/Autocomplete).

---

## 2. Integrated & Live API Endpoints

The frontend services are fully wired to the following live endpoints:

### 2.1 Financial & Wallet Operations (`AdminFinancialService`)

| Endpoint | Method | Status | Frontend Consumer | Payload / Parameters | Expected Response |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `/api/v1/admin/financial/overview` | `GET` | **Live** | Dashboard (`/admin/dashboard`) | None | `FinancialOverviewDto` (see DTO definitions) |
| `/api/v1/admin/financial/withdrawals` | `GET` | **Live** | Withdrawals (`/admin/withdrawals`) | Query: `statusFilter`, `pageNumber`, `pageSize` | `PaginatedResponse<WithdrawalDto>` |
| `/api/v1/admin/financial/withdrawals/{id}/approve` | `POST` | **Live** | Withdrawals (`/admin/withdrawals`) | Path: `id` (Guid) | `200 OK` / `204 NoContent` |
| `/api/v1/admin/financial/withdrawals/{id}/reject` | `POST` | **Live** | Withdrawals (`/admin/withdrawals`) | Path: `id`, Body: `{ rejectionReason: string }` | `200 OK` / `204 NoContent` |
| `/api/v1/admin/financial/withdrawals/{id}/mark-paid` | `POST` | **Live** | Withdrawals (`/admin/withdrawals`) | Path: `id`, Body: `{ adminNote?: string }` | `200 OK` / `204 NoContent` |
| `/api/v1/admin/financial/adjustments` | `POST` | **Live** | Adjustments (`/admin/adjustments`) | Body: `AdjustmentRequest` | `200 OK` / `204 NoContent` |
| `/api/v1/admin/financial/settings` | `GET` | **Live** | Settings (`/admin/settings`) | None | `PlatformSettingsDto` |
| `/api/v1/admin/financial/settings` | `PUT` | **Live** | Settings (`/admin/settings`) | Body: `PlatformSettingsDto` | `PlatformSettingsDto` or `200 OK` |

### 2.2 Academic Configuration Endpoints

| Endpoint | Method | Status | Frontend Consumer | Payload / Parameters |
| :--- | :---: | :---: | :--- | :--- |
| `/api/v1/classroom-types` | `GET` | **Live** | Classroom Types (`/admin/classroom-types`) | None |
| `/api/v1/classroom-types` | `POST` | **Live** | Classroom Types Modal | `{ name: string, description?: string }` |
| `/api/v1/classroom-types/{id}` | `PUT` | **Live** | Classroom Types Modal | `{ name: string, description?: string, isActive: boolean }` |
| `/api/v1/classroom-types/{id}` | `DELETE` | **Live** | Classroom Types Table | Path: `id` (Guid) |
| `/api/v1/grade-levels` | `GET` | **Live** | Grade Levels (`/admin/grade-levels`) | None |
| `/api/v1/grade-levels` | `POST` | **Live** | Grade Levels Modal | `{ name: string, description?: string, sortOrder: number }` |
| `/api/v1/grade-levels/{id}` | `PUT` | **Live** | Grade Levels Modal | `{ name: string, description?: string, sortOrder: number, isActive: boolean }` |
| `/api/v1/grade-levels/{id}` | `DELETE` | **Live** | Grade Levels Table | Path: `id` (Guid) |

---

## 3. Required Endpoints & Workflows for Backend Team

The following endpoints and workflows need to be implemented or confirmed on the backend:

### 3.1 Admin Self-Profile & Security Management (`/admin/profile`)

Admins require dedicated endpoints to update their personal identity information and modify their password securely.

#### 1. Update Admin Profile
- **Route:** `PUT /api/v1/auth/profile` (or `PUT /api/v1/admin/profile`)
- **Authorization:** `RequireRole("Admin", "SuperAdmin")`
- **Request Body:**
```json
{
  "fullName": "أ. عبدالرحمن العنزي",
  "email": "admin@draya.com",
  "phoneNumber": "+966501234567"
}
```
- **Response `200 OK`:** Returns updated user object.

#### 2. Change Password
- **Route:** `POST /api/v1/auth/change-password` (or `POST /api/v1/admin/profile/change-password`)
- **Authorization:** `RequireRole("Admin", "SuperAdmin")`
- **Request Body:**
```json
{
  "currentPassword": "Admin@123456",
  "newPassword": "NewAdminPassword@2026",
  "confirmNewPassword": "NewAdminPassword@2026"
}
```
- **Response `200 OK` / `204 NoContent`**

---

### 3.2 Supervisor / Admin Invitation & Onboarding Lifecycle

To enable superadmins to invite new administrators or supervisors who can securely set their credentials via email link:

#### 1. Invite Admin / Supervisor (Dispatches Email)
- **Route:** `POST /api/v1/admin/supervisors/invite`
- **Authorization:** `RequireRole("SuperAdmin")`
- **Request Body:**
```json
{
  "name": "د. سارة المنصور",
  "email": "sara.mansour@draya.edu.sa",
  "role": "Admin"
}
```
- **Backend Flow:**
  1. Creates user with status `PendingActivation` (or `Invited`).
  2. Generates an encrypted invitation/reset token (e.g. valid for 48 hours).
  3. Sends a branded welcome email containing the link:  
     `https://draya.com/auth/accept-invite?token={inviteToken}&email={email}` (or `https://draya.com/auth/reset-password?token={inviteToken}&email={email}`).
- **Response `201 Created` / `200 OK`:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "د. سارة المنصور",
  "email": "sara.mansour@draya.edu.sa",
  "role": "Admin",
  "status": "PendingActivation",
  "invitedAt": "2026-08-17T02:00:00Z"
}
```

#### 2. Accept Invitation / Set Initial Password
- **Route:** `POST /api/v1/auth/accept-invite` (or `POST /api/v1/auth/reset-password`)
- **Authorization:** Anonymous / Public with Token
- **Request Body:**
```json
{
  "email": "sara.mansour@draya.edu.sa",
  "token": "CF91B0E2A18D...",
  "password": "NewSecurePassword@2026",
  "confirmPassword": "NewSecurePassword@2026"
}
```
- **Response `200 OK`:** Activates user, marks email as verified, and returns JWT token or redirects to login.

#### 3. Resend Invitation Email
- **Route:** `POST /api/v1/admin/supervisors/{id}/resend-invite`
- **Authorization:** `RequireRole("SuperAdmin")`
- **Response `200 OK` / `204 NoContent`**

#### 4. List All Supervisors
- **Route:** `GET /api/v1/admin/supervisors`
- **Authorization:** `RequireRole("SuperAdmin", "Admin")`
- **Response `200 OK`:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "أ. عبدالرحمن العنزي",
    "email": "admin@draya.com",
    "role": "SuperAdmin",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### 5. Toggle Supervisor Status (Activate / Deactivate)
- **Route:** `PUT /api/v1/admin/supervisors/{id}/status`
- **Authorization:** `RequireRole("SuperAdmin")`
- **Request Body:**
```json
{
  "isActive": false
}
```
- **Response `200 OK` / `204 NoContent`**

---

### 3.3 Teacher Autocomplete & Balance Lookup (`AdminTeachersController` or `TeachersController`)

In the manual adjustment screen (`/admin/adjustments`), admins need to select a teacher dynamically:

- **Route:** `GET /api/v1/admin/teachers/search?q={query}` (or `GET /api/v1/teachers/dropdown`)
- **Query Parameter:** `q` (string search by name or email, minimum 2 characters).
- **Response `200 OK`:**
```json
[
  {
    "id": "8a32d184-e53b-4781-8178-5db77a760b24",
    "name": "أ. محمد الشناوي",
    "email": "m.shinawy@draya.edu.sa",
    "earnedBalance": 12500.00,
    "purchasedBalance": 3000.00
  }
]
```

---

## 4. Shared Models & Enums Alignment

The frontend TypeScript enums and models match the domain definitions from backend:

### 4.1 Enums Reference (`src/app/features/admin/models/admin-enums.ts`)

```csharp
namespace Draya.Domain.Wallets;

public enum WalletBalanceType
{
    Earned,
    Purchased
}

public enum WithdrawalStatus
{
    Pending,
    Approved,
    Rejected,
    Paid,
    Cancelled
}

public enum WalletTransactionType
{
    ClassroomEarning,
    TeacherTopUp,
    AIExamCharge,
    Withdrawal,
    Refund,
    Adjustment
}

public enum PayoutAccountType
{
    BankAccount,
    MobileWallet
}
```

### 4.2 Financial Overview Model (`FinancialOverviewDto`)

```typescript
export interface FinancialOverviewDto {
  totalClassroomRevenues: number;
  totalCommissionFees: number;
  totalTopUps: number;
  totalAiExamFees: number;
  totalEarnedTeacherBalance: number;
  totalPurchasedTeacherBalance: number;
  totalEarnedDue: number;
}
```

### 4.3 Platform Settings Model (`PlatformSettingsDto`)

```typescript
export interface PlatformSettingsDto {
  aiExamPrice: number;
  freeMonthlyAIExamQuota: number;
  platformCommissionPercent: number;
}
```

---

## 5. Frontend Error Handling & Empty States Policy

- **No Deceptive Fallbacks:** The UI does not fall back to fake records or mock numbers if an endpoint fails or returns empty data.
- **Empty States:** When a table has 0 records, a dedicated empty container is rendered:
  - *Withdrawals:* "لا توجد طلبات سحب" (No withdrawal requests).
  - *Classroom Types:* "لا توجد أنواع فصول" (No classroom types configured).
  - *Grade Levels:* "لا توجد مراحل دراسية" (No grade levels configured).
  - *Supervisors:* "لا يوجد مشرفون" (No supervisors found).
- **Backend Error Propagation:** `error.error.message` from ASP.NET Core response is passed directly to `ToastService.error()` for transparent troubleshooting.

---

## 6. Frontend Quality & Pipeline Verification

Before handoff, the entire test and quality pipeline was executed and passed with 0 failures:

| Verification Stage | Command | Result |
| :--- | :--- | :--- |
| **Linting** | `npx ng lint` | **0 errors, 0 warnings** |
| **Code Formatting** | `npx prettier --check` | **All files compliant** |
| **Unit Tests** | `npx ng test --watch=false` | **201 / 201 passed (100%)** |
| **E2E Integration** | `npx playwright test e2e/admin-module.spec.ts` | **9 / 9 passed (100%)** |
| **Production Build** | `npx ng build --configuration=production` | **Success (`exit code 0`)** |

---

## 7. Action Checklist for Backend Team

- [ ] **Admin Profile & Security:**
  - Implement `PUT /api/v1/auth/profile` or `PUT /api/v1/admin/profile` (Update name, email, phone).
  - Implement `POST /api/v1/auth/change-password` (Validate current password and set new password).
- [ ] **Supervisor Invitation Flow:**
  - Implement `POST /api/v1/admin/supervisors/invite` (Create user with `PendingActivation` & send invite email with reset token).
  - Implement `POST /api/v1/auth/accept-invite` or `POST /api/v1/auth/reset-password` for password creation from token.
  - Implement `POST /api/v1/admin/supervisors/{id}/resend-invite`.
  - Implement `GET /api/v1/admin/supervisors` and `PUT /api/v1/admin/supervisors/{id}/status`.
- [ ] **Teacher Lookup:**
  - Provide `GET /api/v1/admin/teachers/search?q={query}` endpoint for the adjustment form autocomplete.
- [ ] **CORS & Auth:**
  - Confirm CORS configuration allows `http://localhost:4200` with standard auth headers (`Authorization: Bearer <token>`).
- [ ] **Swagger Deployment:**
  - Notify frontend team once endpoints are deployed to Swagger (`https://draya-api.runasp.net/swagger/v1/swagger.json`) for final end-to-end switch.
