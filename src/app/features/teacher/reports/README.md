# Teacher Reports — Live SignalR Notifications

## 1. Feature Overview

`TeacherReportsComponent` (classroom → student → analytics/latest-report view) now reacts live to
the Reports Hub (`/hubs/reports`, Hub D) instead of only loading data on selection. Two events are
consumed:

- **`reportGenerated`** — an AI performance report finished generating. Toasts a success message,
  and if the event is for the student currently open in the right pane, refreshes their
  analytics/report automatically.
- **`studentAtRisk`** — the system detected a student severely falling behind on a topic. Toasts a
  warning naming the topic.

This closes a gap noted separately from the main SignalR hubs integration: the hub connection and
event signals (`SignalRService.reportGenerated()` / `.studentAtRisk()`) were already wired core-side,
but nothing in the teacher module consumed them until now.

---

## 2. Component Architecture

No new components — two `effect()`s added to `TeacherReportsComponent`'s constructor, watching the
existing `SignalRService` readonly signals. State stays local to the component; no new store.

---

## 3. Backend Contract

- SignalR event `ReportGenerated` → `ReportGeneratedEvent { reportId: string; studentId: string }`
- SignalR event `StudentAtRisk` → `StudentAtRiskEvent { studentId: string; topicName: string }`

Both are defined in `core/models/signalr-events.model.ts`; the hub connection itself lives in
`core/signalr/signalr.service.ts` (`startReportsHub()`), gated by `environment.enableReportsHub`.

---

## 4. Testing

- **Unit:** `teacher-reports.component.spec.ts` — `reportGenerated` refreshes only when it matches
  the currently selected student, `studentAtRisk` always toasts with the correct topic name
  interpolated via `TranslateService.instant()`. `SignalRService` is stubbed with plain writable
  signals cast to its readonly shape (no live hub connection needed for the test).
