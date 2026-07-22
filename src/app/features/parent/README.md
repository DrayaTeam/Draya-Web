# features/parent/

Parent role feature area.

## What will eventually live here

- **Reports** (`reports/`) — Child progress overview for parents:
  - Exam history with score trends over time.
  - AI-generated narrative summaries from the **Draya Report Generator agent** — plain-language explanations of the child's strengths and areas for improvement.
  - Class benchmark comparison (anonymized peer data).
  - Exportable PDF reports for school meetings.
  - Push notifications for new exam results (via browser Notifications API or in-app toasts).

## Guards

Routes here require `role: 'parent'` — enforced by `roleGuard`.
