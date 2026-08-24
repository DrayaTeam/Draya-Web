# Implementation Walkthrough — Overnight A-to-Z Audit (2026-08-24)

Full audit of every endpoint in the live swagger spec (`http://draya-api.runasp.net/swagger/v1/swagger.json`)
against the entire Draya-Web frontend, focused on the exam/AI/grading lifecycle, the reported
intermittent "attempt/start" error, the SignalR/proxy issue, and the previously-reported 11-item
list (especially the still-open "mock notifications" item). This document records what was found,
what was fixed, how each fix was verified, and what's still open.

Companion doc: `backend-report-latest.md` (what's genuinely needed from backend — most of tonight's
findings turned out to be frontend bugs, not backend gaps).

**Pipeline used for every fix below:** `npx ng lint` → `npx prettier --write <files>` → `npx ng test
--watch=false` → `npx ng build --configuration=production` → commit → push → merge into `develop` →
`npx vercel --prod --yes`. Every item below passed the full suite (406/406 by the end) and a clean
production build before merging.

**A note on live/manual verification:** I do not have real user credentials for this environment, and
safely faking a JWT gets auto-logged-out on the first real API call by design (the error interceptor
correctly treats an invalid token as an expired session — this is correct behavior, not something to
work around). Every fix below was verified with targeted unit tests that exercise the exact same
Angular `HttpClient`/RxJS code paths a real browser session would use, which is more precise than
manual clicking for proving a specific field-mapping or race-condition fix. Anything that still needs
a human to click through with a real login is called out explicitly below.

---

## 1. Intermittent "attempt/start" error — root cause found and fixed

**Symptom reported:** `POST /attempts/start` works reliably in Swagger but intermittently fails on
the frontend during exam start, with no clear pattern ("sometimes it works").

**Root cause:** `token.interceptor.ts` attaches whatever access token is currently in memory to every
request, with no coordination between requests. `error.interceptor.ts` calls `auth.refresh()` on any
401. Neither had any deduplication — so when the access token was expired and a page fired several
API calls at once (loading an exam page typically fires 3-4 requests together), **every** 401'd
request independently triggered its own `POST /auth/refresh-token` call, all racing in parallel.

If the backend rotates refresh tokens on use (issues a new one and invalidates the old — standard,
security-recommended practice), only the *first* of those parallel refresh calls succeeds. Every
other one arrives with an already-consumed refresh token, fails, and — critically — the failure
handler calls `logout()`, which **wipes out the fresh tokens the winning call just stored** and
force-ends a session that was actually fine. This exactly matches "works on Swagger" (one request,
no concurrency) vs. "fails intermittently on the frontend, seemingly at random" (only manifests when
several requests race a token refresh at once).

**Fix** (`src/app/features/auth/services/auth.service.ts`):
- `AuthService.refresh()` now shares one in-flight refresh `Observable` (via `shareReplay(1)`) across
  every concurrent caller, instead of firing one HTTP call per 401. All waiting requests get the same
  result once the single underlying call resolves.
- `refreshToken()` now rejects a 200 response missing `accessToken`/`refreshToken` as a failure
  instead of silently writing the string `"undefined"` into `localStorage` — swagger documents
  `POST /auth/refresh-token` as returning no body on success, so a malformed response was previously
  treated as a success.

**Tests added:** a regression test using a `Subject` to prove two concurrent `refresh()` calls result
in exactly one HTTP call, and a test proving a bodyless 200 doesn't corrupt storage.

**Residual risk / what to watch for:** this is the strongest, best-evidenced explanation given the
symptom pattern and the code as written, but I could not visually confirm the exact error text from
the screenshot referenced in the request (no image was actually attached in this session). If the
error recurs after this fix, please capture the exact console error and network tab next time — that
would let us rule this fix in or out definitively rather than inferring from the symptom pattern.

---

## 2. Mock/fabricated notification data — the still-open item from the 11-issue list, fixed

**Symptom:** notifications shown to users included content that was never real — this was flagged as
still-unsolved from the earlier 11-item report.

**Root cause:** `notification-store.service.ts` seeded two hardcoded "welcome" notifications into
every user's store whenever `localStorage` was empty for them. `fetchNotifications()` **merges**
remote data with local data rather than replacing it, so these fabricated notifications never
actually went away — they persisted indefinitely, mixed in with real backend notifications, instead
of being a one-time onboarding message.

**Fix:** the store now starts empty and relies entirely on the real backend
(`GET /api/v1/Notifications`, confirmed now live and typed) plus live SignalR push to populate it.
The existing `@empty` template state in the notification dropdown already renders correctly for a
genuinely empty list, so no UI redesign was needed — just removing the fabrication. Also corrected
all five notification endpoint calls to the confirmed swagger casing (`/Notifications`, capital N —
they were all lowercase).

---

## 3. Weakness tracking: every score was silently rendering 0%

**Root cause:** confirmed via swagger that `WeaknessDto`/`ResolvedWeaknessDto` send
`currentProficiencyPercent`, not `proficiencyPercent`, and the real endpoints are lowercase
`/weaknesses/active` / `/weaknesses/resolved`, not `/Weaknesses/*`. The frontend read a field name
that doesn't exist on the wire, so `Math.round(undefined ?? 0)` silently produced **0% for every
single active and resolved weakness**, regardless of the student's real score.

**Fix:** retyped both DTOs to the confirmed contract; added `WeaknessHistoryDto` and a
`getWeaknessHistory()` service method for the newly-available `GET /weaknesses/{id}/history`
endpoint (this closes a gap from the earlier backend report — progression tracking, e.g. 40%→60%→90%,
now has a real data source, though it isn't wired into any UI yet — see "Not done" below). Also
removed a second, independent magnitude-guessing heuristic in `ResolvedWeaknessItemComponent` that
was layered on top of the already-broken field.

`subjectName` has no backend source at all on either weakness DTO — kept as an explicit "عام"
placeholder rather than silently reading a field that was never sent.

---

## 4. Teacher attempt review: the "needs action" badge never cleared

**Root cause:** confirmed via swagger that `GradingResultDto` nests `isFinalized` and
`reviewedByTeacherId` — the teacher review screen read `answer.isFinalized` at the top level, which
always evaluated to `undefined`. Since `!undefined` is always `true`, an answer's amber "needs
action" badge never cleared, even after the teacher's override was saved and the backend finalized
it.

**Fix:** moved both fields to `AnswerGradingResultDto` in the model and updated every read site
(component logic + 5 template bindings) to `answer.gradingResult?.isFinalized`.

---

## 5. AI exam generation: free quota was never recognized

**Root cause:** confirmed via swagger that `AIExamQuotaDto` sends `remainingFreeQuota`,
`freeExamsUsed`, and `hasSufficientBalanceForPaid`. The frontend model used `remainingFreeExams`,
`freeExamsUsedThisMonth`, and `hasSufficientBalance` — none of which exist on the wire. Every read
evaluated to `undefined`, so **a teacher with real free quota remaining was always treated as having
none** (`undefined > 0` is `false`) and silently routed into the paid-balance check instead. The
free-quota progress bar and counter in the generate-exam UI also literally rendered "متبقي undefined
من 5 محاولات" (remaining `undefined` of 5 attempts).

**Fix:** corrected all three field names in the model, the gating logic, and the template. Added the
first spec file for this component (it had none), scoped to the quota-gating computed signal.

---

## 6. Student dashboard: DTO didn't match the backend at all

**Root cause:** confirmed via swagger that `StudentDashboardDto` shares almost no field names with
what the frontend assumed. `studentName`, `streakDays`, `cumulativeAverage`, `monthlyGrowthPercent`,
`percentileRanking`, `enrolledCourses`, and `weaknessTopics` never existed on the wire (real fields:
`overallAverage`, `currentStreak`, `pointsNeedingFocus`, `upcomingExams`, and there is **no backend
field at all** for monthly growth or percentile ranking). `completedLessonsCount` and
`subscribedPackagesCount` happened to already match by coincidence.

**Fix:**
- Retyped the API response to the confirmed contract, including `pointsNeedingFocus`
  (`topicName`/`proficiencyPercent`) for the weakness widget and the real `upcomingExams` shape
  (`examId`, not `id`).
- **Removed** the "+X% هذا الشهر" growth pill and "أعلى من X% من الطلاب" percentile subtext from the
  dashboard hero card — since there's no backend field for either, these always silently rendered
  "+0%" and "top 0%" for every student. Rather than leave a permanently-wrong claim on screen, the
  honest fix was to remove it; it can come back if/when backend adds a real source for either metric.
- Simplified `enrolledCourses` to always derive from `GET /classrooms` (the only real source — the
  `dash.enrolledCourses` branch never actually ran in production).
- Unified `upcomingExams` mapping to accept either the real `dash.upcomingExams` or the
  `/students/exams` fallback, computing display text client-side either way since neither
  `timeText` nor `isImportant` exist on the wire.

---

## 7. Teacher dashboard & reports: 0–5-scale guessing reintroduced

An audit agent (delegated to sweep every score-rendering spot across both student and teacher pages)
found this same class of bug reappearing in the teacher module, after being fixed elsewhere earlier
in the session:

- `chartMeta` divided `averageScore` by 5 before converting to a percentage — a genuine 84% average
  rendered as ~17%.
- The "needs attention" student list used a `< 2.5` "high risk" threshold on `overallAverage`
  (confirmed 0–100), so almost every at-risk student was misclassified as merely "medium" risk.
- Recent submissions used a `>= 4` "excellent" threshold on `score` (confirmed 0–100), so nearly
  every real submission rendered "excellent" regardless of the actual grade.
- The class-average KPI card silently **lost its `%` suffix** after the first real data load (the
  static default was `"0%"`, but the update wrote a bare number).
- `teacher-reports.component.ts` read `StudentAnalyticsDto.overallAverage`/`.highestScore` raw, while
  the *student's own view* of the identical fields (`student-reports.service.ts`) already runs them
  through the shared `normalizeScoreToPercent()` — meaning a teacher and their student could see two
  different numbers for the same analytics. Now both reuse the same function.

**Fix:** removed the arbitrary `/5` division and the 0–5-scale thresholds; the teacher-reports
component now imports and reuses `normalizeScoreToPercent()` instead of duplicating logic.

Two new regression tests cover: the class-average `%` suffix, and all three threshold/scale fixes
together (chart average, risk level, grade type) from one realistic 0–100 dataset.

---

## Also reconfirmed correct (no change needed)

- `PendingReviewClassroomDto` (teacher pending-reviews widget) — exact match with the confirmed
  `PagedResult<PendingReviewClassroomDto>` wrapper; already fixed and simplified in the previous
  session.
- `AttemptResultsDto.finalScore`/`.maxScore`, `AnswerResultDto.gradingResult.score`/`.maxScore` —
  correctly consumed via the shared `formatExamScoreDisplay()` helper.
- Student exam list, exam-result card, student reports KPIs and skill-radar/trend charts — all
  correctly delegate to the shared percentage helpers; no scale-guessing found.
- `teacher-pending-reviews` widget doesn't render `PendingReviewAttemptDto.score` at all, so no scale
  question arises there.

---

## Flagged but not changed (lower confidence or out of scope tonight)

- `exam-attempts.component.html` renders `attempt.finalScore` from `GET /exams/{examId}/attempts`,
  which genuinely has no response schema in swagger — can't confirm whether it needs the same
  score/maxScore treatment without backend confirming the shape (see `backend-report-latest.md` item
  2). The code already flags this as best-effort.
- `attempt-review.component.html` shows the teacher a raw "score / maxScore" fraction rather than a
  computed percentage, unlike the student-facing result page. This reads as an intentional
  teacher-UX choice (raw points on a grading screen) rather than a bug — left as-is.
- A redundant (but harmless — idempotent) re-clamp of an already-clamped percent in
  `ResolvedWeaknessItemComponent` — no observable effect, not worth the churn of touching it further.
- `teacher-performance-overview.component.ts` has hardcoded default inputs, but the component is not
  referenced anywhere in the app (dead code) — flagged in case it's wired up later without real
  inputs.

## Not done (needs a decision, not just a fix)

- `GET /weaknesses/{id}/history` is now wired up as a service method (`getWeaknessHistory()`) but not
  consumed by any component — there's no progression chart yet. This was a real backend gap noted in
  the original hand-off report; the endpoint now exists, but building the actual UI (a trend view per
  weakness) is a feature-sized addition, not a bug fix, and wasn't started tonight.
- Live, human-driven browser verification of every fix above with a real teacher/student account —
  not possible in this session (see the note at the top). Recommend spot-checking: the teacher exam
  generation quota banner, the student dashboard hero card (growth pill should now be gone), the
  weakness list under Reports (percentages should look real, not all-zero), and the notification bell
  (should start empty for a fresh session, not show two fixed "welcome" items).
