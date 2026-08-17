# features/student/

Student role feature area.

## What will eventually live here

- **Dashboard** (`dashboard/`) — Student's home view:
  - Upcoming exam list with countdown timers.
  - Recent exam results with score breakdown.
  - AI-generated feedback summary from the **Draya Grader agent**.
  - Real-time Q&A panel connected to SignalR hub during active exam sessions.

- **Exam Taking** (`exam-taking/`) — The core student experience:
  - Timer countdown, question-by-question navigation, answer auto-save.
  - Submission confirmation and result display.
  - Post-submission: **Draya Grader agent** feedback on open-ended answers.
  - In-exam Q&A with the teacher via SignalR.

## Guards

Routes here require `role: 'student'` — enforced by `roleGuard`.
