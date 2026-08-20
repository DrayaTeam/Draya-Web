# 🛡️ Admin & SuperAdmin Module (`src/app/features/admin`)

## 📌 Architectural Overview

The **Admin & SuperAdmin Module** is the central governance, financial supervision, and educational taxonomy engine of the Draya platform. It provides platform administrators with real-time financial transparency, teacher payout management, balance adjustments, educational taxonomies, and supervisor access controls.

---

## 🏗️ Directory Structure

```
src/app/features/admin/
├── admin-layout.component (.ts, .html, .scss)      <-- RTL Sidebar, Topbar, User Profile Pill
├── admin.routes.ts                                 <-- Lazy child routes with adminGuard
├── README.md                                       <-- Module root documentation
├── guards/
│   ├── admin.guard.ts                              <-- Role-based auth guard ('Admin' | 'SuperAdmin')
│   └── admin.guard.spec.ts                         <-- Guard unit tests
├── models/
│   ├── admin-enums.ts                              <-- WalletBalanceType, WithdrawalStatus, PayoutAccountType
│   ├── admin-financial.model.ts                    <-- FinancialOverviewDto, WithdrawalDto, AdjustmentRequest
│   ├── admin-classroom-type.model.ts               <-- ClassroomTypeDto, Create/Update requests
│   ├── admin-grade-level.model.ts                  <-- GradeLevelDto, Create/Update requests
│   └── admin-supervisor.model.ts                   <-- Supervisor DTOs & invitation payloads
├── services/
│   ├── admin-financial.service.ts                  <-- Overview, Withdrawals, Adjustments, Settings HTTP
│   ├── admin-classroom-type.service.ts             <-- Classroom types CRUD HTTP
│   ├── admin-grade-level.service.ts                <-- Grade levels CRUD HTTP
│   └── admin-supervisor.service.ts                 <-- Supervisors HTTP & Invitation
├── components/
│   ├── admin-data-table/                           <-- Generic sorted & paginated data table
│   ├── admin-stat-card/                            <-- KPI metric cards with colored tints
│   ├── admin-slide-over/                           <-- RTL sliding detail drawer
│   ├── admin-confirm-dialog/                       <-- Danger / neutral confirm modal
│   └── admin-status-badge/                         <-- Colored status pills
└── pages/
    ├── dashboard/                                  <-- Financial KPIs + Quick Actions (README.md)
    ├── withdrawals/                                <-- Payout approvals/rejections/payments (README.md)
    ├── adjustments/                                <-- Manual balance credits/debits (README.md)
    ├── classroom-types/                            <-- Classroom types CRUD (README.md)
    ├── grade-levels/                               <-- Grade levels CRUD (README.md)
    ├── supervisors/                                <-- Admins & Supervisors directory (README.md)
    ├── settings/                                   <-- Platform commission & AI pricing (README.md)
    └── profile/                                    <-- Admin account info & security
```

---

## 📡 Endpoints Consumed (Swagger Integration)

| Feature Area             | HTTP Method              | Path                                                 | Role Required         |
| ------------------------ | ------------------------ | ---------------------------------------------------- | --------------------- |
| **Overview**             | `GET`                    | `/api/v1/admin/financial/overview`                   | `Admin`, `SuperAdmin` |
| **Withdrawals**          | `GET`                    | `/api/v1/admin/financial/withdrawals`                | `Admin`, `SuperAdmin` |
| **Withdrawal Approval**  | `POST`                   | `/api/v1/admin/financial/withdrawals/{id}/approve`   | `Admin`, `SuperAdmin` |
| **Withdrawal Rejection** | `POST`                   | `/api/v1/admin/financial/withdrawals/{id}/reject`    | `Admin`, `SuperAdmin` |
| **Withdrawal Mark Paid** | `POST`                   | `/api/v1/admin/financial/withdrawals/{id}/mark-paid` | `Admin`, `SuperAdmin` |
| **Balance Adjustments**  | `POST`                   | `/api/v1/admin/financial/adjustments`                | `SuperAdmin`          |
| **Teacher Search**       | `GET`                    | `/api/v1/admin/teachers/search?q={query}`            | `Admin`, `SuperAdmin` |
| **Classroom Types**      | `GET, POST, PUT, DELETE` | `/api/v1/admin/classrooms/types/{id}`                | `Admin`, `SuperAdmin` |
| **Grade Levels**         | `GET, POST, PUT, DELETE` | `/api/v1/admin/classrooms/grade-levels/{id}`         | `Admin`, `SuperAdmin` |
| **Supervisors**          | `GET, POST, PUT`         | `/api/v1/admin/supervisors`                          | `SuperAdmin`          |
| **Platform Settings**    | `GET, PUT`               | `/api/v1/admin/financial/settings`                   | `SuperAdmin`          |
| **Admin Profile**        | `PUT`                    | `/api/v1/admin/profile`                              | `Admin`, `SuperAdmin` |

---

## 🧪 Testing & Verification Strategy

- **Unit Testing (Karma/Jasmine):** 100% test coverage across all services, guards, and page components.
- **E2E Testing (Playwright):** Complete end-to-end browser journeys covering sidebar navigation, drawer inspections, confirmation modals, form validation, and settings management in `e2e/admin-module.spec.ts`.
- **Quality Assurance:** Strictly follows the 7-step mandatory sequence outlined in `WORKFLOW_RULES.md`.
