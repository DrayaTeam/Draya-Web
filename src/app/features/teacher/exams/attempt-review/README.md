# Teacher Attempt Review & Per-Answer Score Override

## 1. Feature Overview

Lets a teacher review a student's graded exam attempt answer-by-answer and override the AI's score on any answer it flagged as uncertain (`needsTeacherReview`). The backend recalculates the attempt's final score, appends weakness history, and invalidates the student's cached AI weakness explanation atomically on every override — this was entirely missing from the teacher module before this feature; `ExamAttemptsComponent` (pre-existing) only showed a read-only score list.

- **Target Route(s):** `/teacher/attempts/:attemptId/review`
- **Entry points:** the "Pending Reviews" dashboard widget, and an "Action Required" badge/button on rows in `/teacher/exams/:id/attempts` (`ExamAttemptsComponent`) where `needsTeacherReview` is true.
- **User Roles:** Teacher

---

## 2. Component Architecture

- **Components:**
  - `AttemptReviewComponent`: page container — loads the attempt's full results, renders one card per answer, and hosts the override input for any answer still needing review.
  - `TeacherPendingReviewsComponent` (`features/teacher/dashboard/components/teacher-pending-reviews/`): dashboard widget listing every pending review across every classroom, grouped by classroom → exam, each row linking here.

- **State Management:** local component signals only (`result`, `draftScores`, `submittingAnswerId`) — no dedicated store, since this is a single-attempt, single-visit flow.

---

## 3. Backend API Contracts & DTOs

- `GET /api/v1/teachers/pending-reviews` → `PendingReviewClassroomDto[]` (typed in swagger — `core/models/teacher-attempt-review.model.ts`).
- `GET /api/v1/attempts/{attemptId}/results` → `AttemptResultResponseDto` — **shared** with the student exam-taking flow (`core/models/student-exam-taking.model.ts`); the teacher view of the same payload carries `questionText`, `questionType`, `rubric`, `isFinalized`, `reviewedByTeacherId` per the backend hand-off doc.
- `PUT /api/v1/attempts/{attemptId}/answers/{answerId}/override` with `{ newScore }` → `204 No Content`. The client never recomputes the attempt total itself — it always refetches `/results` after a successful override so the recalculated score, finalized state, and any resolved weakness are reflected exactly as the backend computed them.

---

## 4. Error Handling & Fallback Strategy

- If `getAttemptResults` fails, a real error state renders (no fabricated content).
- Override scores are clamped client-side to `[0, maxScore]` before submitting, but the backend remains authoritative — a failed override shows an error and leaves the previous state untouched rather than guessing.
- `getPendingReviews` degrades to an empty list on failure rather than throwing, so a transient error on this widget doesn't break the rest of the dashboard.

---

## 5. Testing Matrix

- **Unit Tests:** `teacher-attempt-review.service.spec.ts` (pending-reviews fetch + graceful failure, results fetch, override PUT + failure path), `attempt-review.component.spec.ts` (load, submit-and-refetch, score clamping), `teacher-pending-reviews.component.spec.ts` (load + empty state).
- **Playwright E2E:** pending-review list → open attempt → override a flagged answer → verify recalculated score and "معتمدة" (finalized) badge.
