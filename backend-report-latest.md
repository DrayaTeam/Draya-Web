# Backend Report — Latest (2026-08-24, overnight audit)

This is a standalone snapshot of what's genuinely needed from the backend team, produced from a
full audit of every endpoint in `http://draya-api.runasp.net/swagger/v1/swagger.json` against the
Draya-Web frontend. It intentionally does **not** repeat items that were confirmed to be frontend
bugs and already fixed on our side tonight — see `IMPLEMENTATION_WALKTHROUGH_2026-08-24.md` for
that list. This file is also mirrored as Notes 19–20 in `NOTES_FOR_BACKEND_DEVS.md` (the running
log), plus a status update to the still-open Note 17.

---

## 1. Confirm the scale of six dashboard/analytics score fields (new — Note 19)

Every exam/attempt/weakness score field is now either a paired `score`+`maxScore`, or an explicit
percent field — that's confirmed and the frontend is aligned with it. Six **dashboard/analytics**
fields were not part of that confirmation and have no paired max/total field and no naming
convention indicating scale:

- `TeacherDashboardDto.classAverage`
- `DailySubmissionActivityDto.averageScore`
- `StudentAtRiskDto.overallAverage`
- `RecentSubmissionDto.score`
- `StudentDashboardDto.overallAverage`
- `StudentAnalyticsDto.overallAverage` / `.highestScore`

We found the frontend had **inconsistent, wrong guesses** about these (e.g. one code path divided
`averageScore` by 5 assuming a 0–5 scale, while another treated the identical field as already
0–100) — both have been fixed to consistently assume **already 0–100**, based on the convention
every other confirmed field in this API follows. **Please confirm this is correct** — or, if any of
these six are actually raw points on a different scale, add a paired max/total field the same way
`finalScore`+`maxScore` works, so the client doesn't have to guess.

## 2. Three endpoints still have no response schema in swagger (new — Note 20)

- `GET /api/v1/exams/{examId}/attempts` — the teacher-side per-exam attempt list. We specifically
  can't confirm whether its `finalScore` is paired with a `maxScore` the way every other attempt
  DTO now is.
- `GET /api/v1/exams/{examId}/student-view`
- `GET /api/v1/exams/generations/{generationId}` — also returns an undocumented `206` response
  alongside `200`/`404`. What does `206` mean here (partial/in-progress, or something else)?

## 3. Still open: SignalR hubs fail on production (Note 17, no change since last report)

`wss://draya-lms.vercel.app/hubs/*` fails both the WebSocket and ServerSentEvents transports before
falling back to LongPolling. Root cause: our Vercel rewrite proxies `/hubs/*` to the backend's
plain-`http://` origin, and neither Vercel's rewrite nor (locally) the Angular dev-server proxy can
reliably tunnel a WebSocket upgrade or maintain sticky sessions across a multi-request LongPolling
"connection." This is non-fatal (the client degrades to LongPolling and/or polling fallbacks
already), but it means every real-time feature is currently unreliable in both production and local
dev. **The fix needs to happen on the backend/infra side**: serve the API over HTTPS with a real
certificate so the frontend can connect to the hub origin directly instead of routing hub traffic
through a proxy at all.

## 4. Question, not a bug: possible duplicate notifications

Now that `GET/PUT/DELETE /api/v1/Notifications` are live, confirmed REST endpoints (fixed on our
side tonight — see the walkthrough), is every SignalR push event (`MaterialParsed`,
`ExamGenerationCompleted`, `GradingCompleted`, `ReportGenerated`, `StudentAtRisk`,
`AnswerScoreOverridden`) **also** persisted as a row the client will pick up again via
`GET /Notifications`? If so, a user could see the same real-world event twice — once from the live
push, once from the next notifications-list refresh. We haven't been able to confirm this either way
without live testing; flagging so backend can confirm the intended behavior.

---

_Prepared 2026-08-24 by Frontend Team, from a full swagger audit + codebase review._
