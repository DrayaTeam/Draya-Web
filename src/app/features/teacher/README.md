# features/teacher/

Teacher role feature area.

## What will eventually live here

- **Dashboard** (`dashboard/`) — Class-level analytics powered by ng-apexcharts:
  - Exam score distributions, completion rates, student engagement heatmaps.
  - Real-time Q&A activity from the SignalR hub.

- **Exam Builder** (`exam-builder/`) — AI-powered exam creation:
  - **Draya Exam Builder agent**: Generates question banks from learning objectives and curriculum content.
  - **Draya Grader agent**: Provides automated evaluation criteria for open-ended questions.
  - Schema-driven form built with `ngx-formly`.
  - Preview + publish workflow (sends exam schema to `/api/exams` on the ASP.NET Core backend).

## Guards

Routes here require `role: 'teacher'` — enforced by `roleGuard` in `teacher.routes.ts`.
