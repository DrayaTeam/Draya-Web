# Student Academic Reports & Weakness Tracking

## 1. Feature Overview

Shows a student their academic performance analytics (KPIs, trend chart, subject breakdown, skill radar) alongside stateful weakness tracking: which topics they're currently weak in (with live proficiency), which they've mastered, and AI-generated interactive review/practice for each. Backed by the backend's new stateful `StudentWeakness` model — proficiency and Active/Resolved status persist and update across attempts and teacher overrides, rather than being recomputed as a snapshot each time.

- **Target Route(s):** `/student/reports`
- **User Roles:** Student

---

## 2. Component Architecture

- **Components:**
  - `StudentReportsComponent`: Page container — KPIs, trend/radar charts, subject scores, active + resolved weakness lists, and the AI interactive-review modal.
  - `ReportKpiCardComponent`: KPI stat tile.
  - `ReportWeaknessTopicComponent`: Active-weakness row with a "start review" CTA.
  - `ResolvedWeaknessItemComponent`: Mastered-topic row showing the improvement delta (new in this feature).

- **State Management:**
  - `StudentReportsService`: Analytics/performance-report signals (`summary`, `subjectScores`, `skillRadarPoints`, `trendPoints`) plus the AI-review and practice-exam-generation calls.
  - `StudentWeaknessService`: Dedicated signal store for `activeWeaknesses` / `resolvedWeaknesses` — the authoritative source for the weakness section, replacing the old approach of scraping `weakTopics[]` out of the analytics/performance-report response.

---

## 3. Backend API Contracts & DTOs

- `GET /api/v1/students/{studentId}/analytics`, `GET /api/v1/students/{studentId}/performance-reports/latest` — KPIs, subject proficiencies, trend points. **No longer** the source for the weakness list.
- `GET /api/v1/Weaknesses/active`, `GET /api/v1/Weaknesses/resolved` — stateful weakness tracking (`WeaknessDto` in `core/models/student-weakness.model.ts`). **Untyped in swagger** — modeled tolerantly, every field optional except `topicName`/`proficiencyPercent`. `delta`/`previousProficiencyPercent` on resolved items are rendered when present but not required.
- `GET /api/v1/students/{studentId}/weak-topics/{topicName}/revision` — AI explanation for a weak topic. The backend caches this and invalidates it when the topic's score changes (new exam or teacher override) — the client adds **no cache of its own** on top, and does **not** fabricate a fallback on error (a fake "successful" response would mask real failures).
- `POST /api/v1/students/{studentId}/weak-topics/{topicName}/practice-exam` — generates a tailored practice exam, returns `202 Accepted` with an undocumented body (see `BACKEND_ISSUES_REPORT.md`). If a `generationId`/`id` is present, tracked precisely via `GET /api/v1/exams/generations/{generationId}` (same endpoint the teacher module uses) plus the SignalR exam-generation hub; falls back to fuzzy title-matching against `/students/exams` only when no id is returned.

---

## 4. Error Handling & Fallback Strategy

- Weakness lists show an empty state on error rather than fabricated content — no `|| 40` magic-number defaults, no synthesized topics.
- `monthlyGrowthPercent` is computed from the last two `trendPoints` entries (a real delta), not hardcoded.
- `studentId` is always resolved from the authenticated user's JWT claim; there is no `'me'` string fallback — if the user isn't resolvable, the action is blocked with an error toast instead of firing a request that can't succeed.

---

## 5. Testing Matrix

- **Unit Tests:** `student-weakness.service.spec.ts` (normalization, error → empty list, not fabricated content), `student-reports.service.spec.ts` (analytics/report merge, revision no-fallback-on-error, generation-status polling), `resolved-weakness-item.component.spec.ts`, `student-reports.component.spec.ts`.
- **Playwright E2E:** weakness progression (Active → Resolved transition, improvement delta rendering), AI review modal open/retry, practice-exam generation flow.
