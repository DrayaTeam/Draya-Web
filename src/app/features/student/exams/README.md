# Student Live Exam Attempt Engine & Results Diagnostics

## 1. Feature Overview
The Live Exam Attempt Engine provides students with an interactive, real-time testing experience with anti-cheating security safeguards, live countdown timer synchronization with server expiration timestamps, question flagging, and detailed AI-powered diagnostics for exam performance.

- **Target Route(s):**
  - /student/exams/:id/take — Interactive Exam Taking View
  - /student/exams/:id/result — Grading Breakdown & Diagnostic Report
- **User Roles:** Student

---

## 2. Component Architecture
- **Components:**
  - StudentActiveExamComponent: Master exam container managing timer, fullscreen security guards, and submit confirmation.
  - ExamQuestionCardComponent: Presentational component rendering question text, multiple-choice options, and navigation buttons.
  - ExamQuestionMapComponent: Sidebar grid displaying indexed question pills colored by status (Active, Answered, Flagged, Unvisited).
  - ExamSecurityWarningComponent: Security modal displayed upon tab switching or cheating violations.
  - StudentExamResultComponent: Exam result report with score percentage, pass/fail status, and weakness breakdown.
  - ExamResultCardComponent: Visual score circle and summary metrics.
  - ExamQuestionReviewCardComponent: Accordion review of student answers vs correct answers with explanations.

- **State Management:**
  - StudentExamTakingService: Central Angular Signals store managing questions, currentQuestionIndex, 	imeRemainingSeconds, isSubmitted, and currentAttemptId.

---

## 3. Backend API Contracts & DTOs
- POST /api/v1/attempts/start: Starts or resumes an active exam attempt session.
  - Request: StartAttemptRequestDto { examId: string }
  - Response: StartAttemptResponseDto { attemptId, examTitle, durationMinutes, startedAt, expiresAt, questions }
- POST /api/v1/attempts/{attemptId}/submit: Submits final answers for grading.
  - Request: SubmitAttemptRequestDto { answers: AnswerSubmissionDto[], idempotencyKey?: string }
- GET /api/v1/attempts/{attemptId}/results: Retrieves grading report and diagnostic metrics.
- GET /api/v1/students/exams/{id}: Fallback endpoint for offline/demo exam data.

---

## 4. Testing Matrix
- **Unit & Integration Tests:**
  - student-exam-taking.service.spec.ts (State mutations, question navigation, option selection, HTTP mocking).
  - student-active-exam.component.spec.ts (Component initialization, timer, and DOM mapping).
  - student-exam-result.component.spec.ts (Result calculation and review rendering).
- **Playwright E2E Tests:**
  - e2e/student-exam-flow.spec.ts (Full browser user journey: option selection -> next -> submit -> results report).
