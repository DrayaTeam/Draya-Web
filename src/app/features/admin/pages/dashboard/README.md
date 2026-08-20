# 📊 Admin Dashboard Feature (`src/app/features/admin/pages/dashboard`)

## 📌 Architectural Purpose

Provides platform administrators and SuperAdmins with an executive financial overview, KPI indicators, revenue totals, AI operation costs, teacher balances, and pending withdrawal badges.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminDashboardComponent` (`admin-dashboard.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `loading`: Signal tracking HTTP fetch state.
  - `overview`: Signal storing `FinancialOverviewDto` (revenues, fees, topups, balances).
  - `pendingWithdrawalsCount`: Signal holding count of pending teacher payouts.
- **Child Components:** `AdminStatCardComponent` (with color variants: violet, emerald, blue, amber, teal).

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/financial/overview` -> Returns total classroom revenues, commission fees, topups, AI fees, teacher balances.
- `GET /api/v1/admin/financial/withdrawals?statusFilter=Pending&pageNumber=1&pageSize=1` -> Fetches count of pending payout requests.

---

## 🧪 Testing

- **Unit Spec:** `admin-dashboard.component.spec.ts` (Validates overview loading, pending count, and graceful fallback).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should display dashboard financial overview cards and quick links`.
