# New Backend Notes — 2026-08-24

Four new items found while auditing student/teacher UI fixes today. All four are also filed as
Notes 15–18 in `NOTES_FOR_BACKEND_DEVS.md` (the running log) — this file exists so they can be sent
standalone without the rest of that log's history.

---

## Note 15: 403 Forbidden on `GET /api/v1/exams/generations/{generationId}` for Student Role (blocks practice-exam tracking)

### 🔍 Issue Description

- Same root cause as the existing "Note 11" issue (`ExamsController` restricted to
  `[Authorize(Roles = "Teacher")]`), but flagged separately because it blocks a **student-only
  feature end to end**, not just the exam list.
- When a student requests an AI practice exam for a weak topic
  (`POST /api/v1/students/{studentId}/weak-topics/{topicName}/practice-exam`, `202 Accepted`), the
  frontend tracks generation progress via `GET /api/v1/exams/generations/{generationId}` — the
  exact same endpoint the teacher module polls after `POST /api/v1/exams/generate`.
- Because the whole `ExamsController` (or at least this action) is
  `[Authorize(Roles = "Teacher")]`, a student polling their own practice-exam generation gets
  **403 Forbidden** on every request. There is no student-facing equivalent endpoint.
- Net effect: a student who requests a practice exam currently has no reliable way to know when
  it's ready — the frontend falls back to a fragile heuristic (polling `/students/exams` and
  fuzzy-matching the newly created exam by title) specifically because this endpoint is unusable
  for students.

### 💡 Recommendation for Backend Team

- Either update authorization to:
  ```csharp
  [Authorize(Roles = "Teacher,Student")]
  ```
  on `GET /api/v1/exams/generations/{generationId}`, with a check that the requesting student owns
  the generation job (matches the `studentId` that triggered it) before returning status — a
  student should not be able to poll another student's or a teacher's generation job by guessing
  its id.
- OR provide a dedicated student-scoped endpoint, e.g.
  `GET /api/v1/students/exam-generations/{generationId}`, scoped to the authenticated student's
  own jobs only.
- Please also confirm: does
  `POST /students/{studentId}/weak-topics/{topicName}/practice-exam` return a `generationId` (or
  similarly named field) in its `202` body at all? This is currently unconfirmed and is a
  prerequisite for polling this endpoint regardless of the authorization fix above.

---

## Note 16: `finalScore` Has No Reliable Scale Indicator (drives fragile frontend score-guessing)

### 🔍 Issue Description

- `AttemptResultResponseDto.finalScore` (returned by `GET /api/v1/attempts/{attemptId}/results`) is
  sometimes a raw points value (e.g. `7` out of a 10-point exam) and sometimes appears to already
  be a 0–100 percentage, with no field reliably indicating which. `maxScore` on the same DTO is
  present in some responses and absent/zero in others.
- Per-answer detail (`AnswerGradingResultDto.score` / `.maxScore`) is the one reliable source — the
  frontend correctly derives the percentage from `sum(score)/sum(maxScore)` when that detail is
  present. The ambiguity only shows up in the **fallback** path, when only the aggregate
  `finalScore` is available (e.g. a weak-topic summary in `WeakTopicResult` / `PerformanceReportDto`,
  or `StudentExamSummaryDto.latestScore`) with no per-answer breakdown to compute from.
- To work around this, the frontend previously guessed the scale from the raw number's magnitude
  (`<=5` → assume out of 5, `<=10` → assume out of 10, `>10` → assume already a percentage). This is
  unreliable by construction — a genuine low score like `8%` is indistinguishable from `8/10` — and
  different frontend call sites had drifted to slightly different guessing thresholds, which is
  part of why the same exam could show different percentages on different screens.

### 💡 Recommendation for Backend Team

- Please make one of these true everywhere `finalScore` (or any other bare score field with no
  accompanying max) is returned:
  1. **Always normalize it to a 0–100 percentage** before sending it to the client, regardless of
     the exam's point scale, or
  2. **Always include the corresponding max/total** alongside it (`finalScore` + `maxScore`
     together, never one without the other) so the client can compute
     `finalScore / maxScore * 100` deterministically.
- Whichever is chosen, please apply it consistently across `AttemptResultResponseDto.finalScore`,
  `StudentExamSummaryDto.latestScore`, `WeakTopicResult.proficiencyPercent` /
  `.accuracyPercentage`, and any other "score-shaped" field — right now some of these are
  percentages and some are raw points, with no field-name convention distinguishing them.
- Frontend fix already applied on our side: percentage formatting is now centralized through one
  shared function, with the magnitude-based guessing removed — the fallback is "treat as already a
  percentage, clamp to 0–100" when no max is available. This is strictly worse than a real scale
  indicator from the API, since a genuinely low percentage and a low raw score look identical
  without one.

---

## Note 17: SignalR Hubs Fail on Production (WebSocket + ServerSentEvents Both Rejected) — Infra, Not Purely Backend Code

### 🔍 Issue Description

- On the deployed production site, every SignalR hub connection (`/hubs/notifications`,
  `/hubs/reports`, `/hubs/materials`, `/hubs/qa`, `/hubs/exam-generation`, `/hubs/exam-grading`)
  fails both the WebSocket and ServerSentEvents transports before falling back to LongPolling:
  - `WebSocket connection to 'wss://draya-lms.vercel.app/hubs/notifications?...' failed`
  - `Failed to start the transport 'ServerSentEvents': ... the connection could not be found on
the server, either the connection ID is not present on the server, or a proxy is
refusing/buffering the connection. If you have multiple servers check that sticky sessions
are enabled.`
  - A `401` is also seen on the hub negotiate request itself in some sessions.
- Root cause on our side: `vercel.json` proxies `/hubs/:path*` (and `/api/:path*`) to
  `http://draya-api.runasp.net/hubs/:path*` via a Vercel **rewrite**. Vercel's rewrite/edge layer
  works for plain request/response HTTP calls, but it does **not** tunnel WebSocket upgrades, and
  it does not guarantee the same serverless/edge instance handles every poll of a single
  long-polling or SSE "connection" — which is exactly what the SignalR client's own error text is
  describing (no sticky sessions across the proxy).
- The backend is also only reachable over plain `http://` (`draya-api.runasp.net`), not `https://`.
  Since the frontend is served over `https://draya-lms.vercel.app`, a direct `wss://`/`https://`
  connection straight to the backend would additionally be blocked by the browser as mixed content
  — the Vercel rewrite is currently the only reason the REST calls work at all.
- Net effect: every real-time feature (live notifications, exam-generation/grading progress push,
  reports-ready push, QA hub) currently degrades to whatever polling fallback the frontend has for
  it, or silently does nothing if no fallback exists. This is **not** the same bug as the
  "t.reduce is not a function" teacher-dashboard crash reported alongside it — the SignalR failures
  are caught and logged as warnings, not thrown, so they don't crash the page — but they mean
  real-time features are effectively non-functional in production right now.

### 💡 Recommendation for Backend Team

- Serve the API over **HTTPS** with a real TLS certificate (a bare HTTP-only backend behind a
  proxy is the blocker for connecting directly, and is also a security gap on its own for anything
  carrying auth tokens).
- Once HTTPS is available, we can point `signalrHubUrl`/`reportsHubUrl`/etc. at the backend's own
  absolute origin (`wss://draya-api.<domain>/hubs/...`) instead of routing hub traffic through the
  Vercel rewrite, which resolves the transport/sticky-session problem entirely (REST calls can
  stay proxied through `/api/*` since those are stateless single request/response).
- Alternatively, if the backend must stay behind the Vercel proxy for hubs too, confirm whether the
  hosting supports WebSocket passthrough and sticky sessions end-to-end — but going direct to an
  HTTPS backend origin is the more reliable fix.

---

## Note 18: `GET /teachers/pending-reviews` — Confirm Response Is a Bare Array

### 🔍 Issue Description

- Swagger types this endpoint as returning `PendingReviewClassroomDto[]` directly, and that's what
  the frontend originally assumed and called `.reduce()` on immediately.
- We can't yet confirm from a live response whether every environment actually returns a bare
  array — several other endpoints in this API that are typed as one shape in swagger have been
  observed wrapping the payload in an `{ items: [...] }` or `{ data: [...] }` envelope instead. If
  `/teachers/pending-reviews` ever does the same, calling `.reduce()` directly on the response
  throws `TypeError: t.reduce is not a function` and crashes the whole teacher dashboard (this
  reproduced for us and is fixed on our side by normalizing the response defensively).
- This note is precautionary, not a confirmed live bug — but given the pattern elsewhere in this
  API, please confirm the exact shape returned in production so we can drop the defensive
  normalization once it's verified unnecessary.

### 💡 Recommendation for Backend Team

- Confirm `GET /api/v1/teachers/pending-reviews` always returns a bare
  `PendingReviewClassroomDto[]` with no wrapping envelope, in every environment
  (dev/staging/prod), and keep it that way — this endpoint feeds a dashboard widget that iterates
  the response immediately on load.
