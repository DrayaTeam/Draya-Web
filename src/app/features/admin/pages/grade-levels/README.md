# 🎓 Admin Grade Levels Management (`src/app/features/admin/pages/grade-levels`)

## 📌 Architectural Purpose

Administers the educational academic stages and grade levels (e.g., الصف الأول الثانوي, الثاني الثانوي, الثالث الثانوي) across the entire platform, complete with custom sort order sequencing and status toggles.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminGradeLevelsComponent` (`admin-grade-levels.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `gradeLevels`: Signal storing `GradeLevelDto[]`.
  - `searchQuery`: Search string signal.
  - `isModalOpen`, `isEditMode`, `selectedItem`: Modal state signals.
  - `isDeleteConfirmOpen`, `itemToDelete`: Deactivation state signals.
- **Child Components:** `AdminDataTableComponent`, `AdminStatusBadgeComponent`, `AdminConfirmDialogComponent`.

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/classrooms/grade-levels` -> List all grade levels ordered by `sortOrder`.
- `POST /api/v1/admin/classrooms/grade-levels` -> Create grade level `{ name, description, sortOrder }`.
- `PUT /api/v1/admin/classrooms/grade-levels/{id}` -> Update grade level `{ name, description, sortOrder, isActive }`.
- `DELETE /api/v1/admin/classrooms/grade-levels/{id}` -> Deactivate grade level.

---

## 🧪 Testing

- **Unit Spec:** `admin-grade-levels.component.spec.ts` (Tests sortOrder defaulting, search filtering, modal open/close, create, update, and delete actions).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should render grade levels page and allow open modal`.
