# 🏫 Admin Classroom Types Management (`src/app/features/admin/pages/classroom-types`)

## 📌 Architectural Purpose

Manages the taxonomy of classroom delivery formats across the platform (e.g., Center in-person, Live interactive online, Recorded self-paced, 1-on-1 Private tutoring) with full CRUD and active state toggling.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminClassroomTypesComponent` (`admin-classroom-types.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `classroomTypes`: Signal storing `ClassroomTypeDto[]`.
  - `searchQuery`: Search filter signal.
  - `isModalOpen`, `isEditMode`, `selectedItem`: Modal state signals.
  - `isDeleteConfirmOpen`, `itemToDelete`: Deletion state signals.
- **Child Components:** `AdminDataTableComponent`, `AdminStatusBadgeComponent`, `AdminConfirmDialogComponent`.

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/classrooms/types` -> List all classroom types.
- `POST /api/v1/admin/classrooms/types` -> Create classroom type `{ name, description }`.
- `PUT /api/v1/admin/classrooms/types/{id}` -> Update classroom type `{ name, description, isActive }`.
- `DELETE /api/v1/admin/classrooms/types/{id}` -> Deactivate classroom type.

---

## 🧪 Testing

- **Unit Spec:** `admin-classroom-types.component.spec.ts` (Tests search filtering, modal open/close, create, update, and delete actions).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should render classroom types page and allow open modal`.
