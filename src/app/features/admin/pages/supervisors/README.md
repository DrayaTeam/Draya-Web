# 👥 Admin Supervisors & Team Access Management (`src/app/features/admin/pages/supervisors`)

## 📌 Architectural Purpose

Enables platform SuperAdmins to manage the administrator directory, invite new platform supervisors via email tokens, resend invitation links, and enable or suspend administrative privileges.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminSupervisorsComponent` (`admin-supervisors.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `supervisors`: Signal storing `AdminSupervisorDto[]`.
  - `searchQuery`: Search filter signal.
  - `isInviteModalOpen`: Signal controlling invite modal.
  - `isStatusConfirmOpen`, `selectedSupervisor`: Account status toggle modal state.
- **Child Components:** `AdminDataTableComponent`, `AdminStatusBadgeComponent`, `AdminConfirmDialogComponent`.

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/supervisors` -> List all platform supervisors.
- `POST /api/v1/admin/supervisors/invite` -> Send invitation email `{ name, email, role }`.
- `POST /api/v1/admin/supervisors/{id}/resend-invite` -> Resend invitation token.
- `PUT /api/v1/admin/supervisors/{id}/status` -> Toggle active/suspended state.

---

## 🧪 Testing

- **Unit Spec:** `admin-supervisors.component.spec.ts` (Validates loading, search filtering, invite modal, resending invites, and toggling active status).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should render supervisors page and open invite modal`.
