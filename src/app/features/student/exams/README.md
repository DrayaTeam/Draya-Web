# Student Live Exam Attempt Engine & Results Diagnostics

## 1. Feature Overview

The Live Exam Attempt Engine provides students with an interactive, real-time testing experience with anti-cheating security safeguards, live countdown timer synchronization with server expiration timestamps, question flagging, and detailed AI-powered diagnostics for exam performance. It covers the full lifecycle: browse → start/resume → answer (MCQ + essay) → submit → AI grading → results → retake or revisit a past attempt.

- **Target Route(s):**
  - /student/exams — Exam list (all six lifecycle statuses)
  - /student/exams/:id/take — Interactive Exam Taking View
  - /student/exams/:id/result — Grading Breakdown & Diagnostic Report
- **User Roles:** Student

---

## 2. Component Architecture

- **Components:**
  - StudentExamsComponent + ExamCardComponent: List view with status-driven actions (Start / Resume / View / Retake), an "Attempt N of M" indicator, and a "needs teacher review" badge.
  - StudentActiveExamComponent: Master exam container managing timer, fullscreen security guards, and submit confirmation.
  - ExamQuestionCardComponent: Presentational component rendering question text, multiple-choice options, and navigation buttons. Essay vs MCQ is decided purely from `question.type` / options length — never from an answer key.
  - ExamQuestionMapComponent: Sidebar grid displaying indexed question pills colored by status (Active, Answered, Flagged, Unvisited).
  - ExamSecurityWarningComponent: Security modal displayed upon tab switching or cheating violations. On the 3rd violation, the exam is now **submitted** (not zero-scored client-side) so the server grades whatever was answered.
  - StudentExamResultComponent: Exam result report with score percentage, pass/fail status, and weakness breakdown. Falls back to `GET /exams/{id}/student-view` to resolve the latest attempt when no `attemptId` is present in the URL (cold deep link).
  - ExamResultCardComponent: Visual score circle and summary metrics.
  - ExamQuestionReviewCardComponent: Accordion review of student answers vs correct answers with explanations.

- **State Management:**
  - StudentExamsService: Signal store for the exam list; `deriveExamStatus()` maps a `StudentExamSummaryDto` to one of six `ExamStatusType` values (`available`, `scheduled`, `in-progress`, `pending-grading`, `completed`, `expired`), preferring the server's `attemptStatus` over date/attempt-count inference.
  - StudentExamTakingService: Central Angular Signals store managing questions, `currentQuestionIndex`, `remainingSeconds`, `isSubmitted`, `currentAttemptId`, and `startAttemptFailureReason`.

---

## 3. Backend API Contracts & DTOs

- `GET /api/v1/students/exams`: List with embedded `attempts[]` history (`StudentExamSummaryDto` / `StudentExamAttemptSummaryDto` in `core/models/student-exam.model.ts`).
- `POST /api/v1/attempts/start`: Starts or resumes an active exam attempt session.
  - Request: `StartAttemptRequestDto { examId }`
  - Response: `StartAttemptResponseDto { attemptId, ... }`
  - Failure is reported via HTTP status + free-text message, not a stable code — `interpretStartAttemptError()` best-effort classifies it into `'exam-expired' | 'no-attempts-remaining' | 'attempt-in-progress' | 'unknown'`.
- `GET /api/v1/students/exams/{id}`: Fetches exam + questions. **Never returns an answer key** — `StudentExamQuestionOptionDto` is `{ id, text }` only. Do not add client-side MCQ correctness logic against this endpoint.
- `POST /api/v1/attempts/{attemptId}/submit`: Submits final answers for grading.
  - Request: `SubmitAttemptRequestDto { answers: AnswerSubmissionDto[], idempotencyKey }`
- `POST /api/v1/attempts/{attemptId}/grade`: Triggers AI grading; `GET /api/v1/attempts/jobs/{jobId}` polls the job.
- `GET /api/v1/attempts/{attemptId}/results`: The **only** source of truth for correctness, scores, and per-answer AI rationale (`AttemptResultResponseDto`). No client-side scoring happens anywhere in this feature.
- `GET /api/v1/exams/{examId}/student-view`: Exam + attempt history in one call; used to resolve "which attempt" when revisiting without an explicit `attemptId`.

---

## 4. Error Handling & Fallback Strategy

- No sentinel IDs (`'exam-1'`, `'att_...'`) remain — every attempt id comes from the server. If `POST /attempts/start` fails, the reason is surfaced via `startAttemptFailureReason` and shown to the student instead of silently starting a fake local session.
- `submitExam()` refuses to call the backend (and shows an error toast) when no attempt id is known, rather than simulating a result locally.
- Weaknesses are **not** fabricated from wrong answers here anymore — `weaknessTopics` on the result report is left empty pending the real `GET /Weaknesses/active` integration (see `student-weakness.service.ts`, added in the weakness-tracking branch).

---

## 5. Testing Matrix

- **Unit & Integration Tests:**
  - `student-exam-taking.service.spec.ts` — state mutations, question navigation, option selection, submit guard rails, `interpretStartAttemptError` classification, answer-key leak regression test.
  - `student-exams.service.spec.ts` — `deriveExamStatus()` coverage for all six statuses, `attempts[]` → `latestAttemptId`/`needsTeacherReview` mapping.
  - `exam-card.component.spec.ts` — per-status button behavior (start/resume/view/disabled), retake visibility.
  - `student-active-exam.component.spec.ts` / `student-exam-result.component.spec.ts` — component initialization, timer, and DOM mapping.
- **Playwright E2E Tests:**
  - `e2e/student-exam-flow.spec.ts` — full browser user journey: option selection → next → submit → results report (desktop 1440x900/1920x1080, mobile 390x844/375x667).
