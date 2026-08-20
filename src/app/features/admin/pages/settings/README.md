# ⚙️ Admin Platform Settings (`src/app/features/admin/pages/settings`)

## 📌 Architectural Purpose

Controls platform-wide monetization, pricing, and AI generation parameters, including platform commission percentage (%), AI exam generation price per student, and free monthly quotas.

---

## 🧩 Component Architecture & State Management

- **Component:** `AdminSettingsComponent` (`admin-settings.component.ts`, `.html`, `.scss`)
- **State Signals:**
  - `loading`: State of fetching current settings.
  - `saving`: Saving indicator signal.
  - `settings`: Signal storing `PlatformSettingsDto`.
- **Form:** Reactive form with `platformCommissionPercent`, `aiExamPrice`, `freeMonthlyAIExamQuota`.

---

## 📡 API Endpoints Consumed

- `GET /api/v1/admin/financial/settings` -> Retrieve platform settings.
- `PUT /api/v1/admin/financial/settings` -> Update platform settings.

---

## 🧪 Testing

- **Unit Spec:** `admin-settings.component.spec.ts` (Validates loading settings, form population, and saving updates).
- **Playwright E2E:** `e2e/admin-module.spec.ts` -> `should render platform settings page and inputs`.
