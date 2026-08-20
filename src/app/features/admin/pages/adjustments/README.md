# ⚖️ Admin Wallet Balance Adjustments (`src/app/features/admin/pages/adjustments`)

## 📌 Architectural Purpose

Enables platform administrators to apply manual balance credits (+) or debits (-) directly to teacher wallets (distinguishing between `Earned` classroom revenue and `Purchased` credit), with audit notes and confirmation safeguards.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminAdjustmentsComponent` (`admin-adjustments.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `teachers`: Signal storing list of searchable teachers and their live balances.
  - `selectedTeacher`: Computed signal referencing teacher chosen in dropdown.
  - `isConfirmOpen`: Signal controlling `AdminConfirmDialogComponent`.
  - `isSubmitting`: Loading indicator signal.
- **Forms:** Reactive form with `teacherId`, `balanceType`, `amount`, `adjustmentDirection`, `reason`.

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/teachers/search?q={query}` -> Search teachers and fetch current balances.
- `GET /api/v1/teachers` -> Fallback list of teachers.
- `POST /api/v1/admin/financial/adjustments` -> Create adjustment `{ teacherId, amount, balanceType, reason }`.

---

## 🧪 Testing

- **Unit Spec:** `admin-adjustments.component.spec.ts` (Validates teacher loading, form validation, positive credit and negative debit calculations).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should render adjustments page with form and validate inputs`.
