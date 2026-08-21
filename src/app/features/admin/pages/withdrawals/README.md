# 💼 Admin Withdrawals & Payouts Workflow (`src/app/features/admin/pages/withdrawals`)

## 📌 Architectural Purpose

Manages teacher balance payout requests, approval workflows, bank/wallet destination account verification, rejection feedback with mandatory reasons, and payment fulfillment auditing.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminWithdrawalsComponent` (`admin-withdrawals.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `activeStatusTab`: Status tab filter (`All`, `Pending`, `Approved`, `Paid`, `Rejected`, `Cancelled`).
  - `withdrawals`: Signal holding `WithdrawalDto[]`.
  - `selectedWithdrawal`: Signal holding active item inspected in slide-over drawer.
  - `isDetailOpen`: Boolean signal controlling `AdminSlideOverComponent`.
  - `confirmApproveOpen`, `confirmRejectOpen`, `confirmPaidOpen`: Modal state signals.
  - `paidAdminNote`: Signal capturing payout reference / receipt info.
- **Child Components:** `AdminDataTableComponent`, `AdminStatusBadgeComponent`, `AdminSlideOverComponent`, `AdminConfirmDialogComponent`.

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/financial/withdrawals?statusFilter={status}&pageNumber={page}&pageSize={size}`
- `POST /api/v1/admin/financial/withdrawals/{id}/approve`
- `POST /api/v1/admin/financial/withdrawals/{id}/reject` (Body: `{ rejectionReason }`)
- `POST /api/v1/admin/financial/withdrawals/{id}/mark-paid` (Body: `{ adminNote }`)

---

## 🧪 Testing

- **Unit Spec:** `admin-withdrawals.component.spec.ts` (Covers table render, status tab filtering, slide-over inspection, approval, rejection, and mark-paid flows).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should navigate to withdrawals and open detail slide-over`.
