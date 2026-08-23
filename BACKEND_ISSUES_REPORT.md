# Backend Integration Report — Weakness Tracking, Attempt Review & Exam Lifecycle

**From:** Frontend (Draya Web)
**Re:** `latest backend changes.md`, `latest backend changes v2.md`, and the swagger spec at `httpdraya-api.runasp.net/swagger/v1/swagger.json`
**Context:** We re-integrated the web client against the new weakness-tracking, per-answer teacher override, and attempt-history behavior described in the two hand-off docs. Below is everything that blocked or risked that work, ordered by severity.

---

## 1. Blocking / correctness

1. **No endpoint exposes `StudentWeaknessHistory`.** The stated goal is tracking proficiency progression per topic (e.g. 40% → 60% → 90%) across attempts. Neither `GET /api/v1/Weaknesses/active` nor `/Weaknesses/resolved` returns a history array, and there is no `/weaknesses/{id}/history` endpoint. As shipped, the frontend can show the *current* proficiency and Active/Resolved status, but cannot render the progression chart the feature exists for. **Ask:** either a `history[]` embedded in the weakness DTO, or a dedicated history endpoint.

2. **No weakness `id` is exposed anywhere.** `latest backend changes v2.md` §3 describes `POST /weaknesses/{weaknessId}/review`, implying weaknesses have stable ids, but no response (`/Weaknesses/active`, `/Weaknesses/resolved`, `WeakTopicDto`, `WeakTopicResult`) includes one. Everything is currently keyed by `topicName` as a URL path segment (`/students/{studentId}/weak-topics/{topicName}/revision`), which is fragile for Arabic topic names requiring `encodeURIComponent`, and ambiguous if two subjects share a topic name. **Ask:** confirm whether weaknesses have a durable id, and if so expose it.

3. **`/Weaknesses/resolved` response shape is unconfirmed.** `latest backend changes.md` §2.2 promises `Delta` and `PreviousProficiencyPercent` on resolved weaknesses ("Improved by +43%"), but `WeakTopicResult`/`WeakTopicDto` in swagger have neither field, and the endpoint itself returns a bare `200 OK` with no schema. **Ask:** publish the actual response shape, ideally with `delta`/`previousProficiencyPercent` as documented.

4. **`POST /students/{studentId}/weak-topics/{topicName}/practice-exam` returns 202 with an undocumented body.** Is there a `generationId` (or similar) in the response we should track via `GET /exams/generations/{id}` and the exam-generation SignalR hub, the same way teacher-initiated AI exam generation works? Right now the client has to poll `/students/exams` and fuzzy-match the newly created exam by title, which is brittle. **Ask:** confirm the 202 response body.

5. **Endpoints referenced in the hand-off docs don't exist in swagger.** We built against swagger as the source of truth; flagging so the docs get corrected before mobile builds against the wrong paths:

   | Doc says | Swagger reality |
   |---|---|
   | `GET /reports/interactive-review?topicName=` | `GET /students/{studentId}/weak-topics/{topicName}/revision` |
   | `POST /weaknesses/{weaknessId}/review` | Same `.../revision` GET (cache is server-side) |
   | `GET /weaknesses` | Only `/Weaknesses/active` and `/Weaknesses/resolved` |
   | `POST /auth/request-password-reset` / `confirm-password-reset` | `/auth/password-reset/request` / `/confirm` |

---

## 2. Swagger quality — missing response schemas

The following endpoints return a bare `200`/`202`/`204` with **no response schema** in swagger, several of which carry the most important payloads in this release:

- `POST /attempts/start`, `POST /attempts/{id}/submit`, `POST /attempts/{id}/grade`, `GET /attempts/jobs/{jobId}`
- `GET /attempts/{attemptId}/results` — the sole source of truth for grading; we need `examTitle`, `maxScore`, and per-answer `questionText`, `questionType`, `rubric`, `isFinalized`, `reviewedByTeacherId`, `teacherOverrideScore` confirmed as documented in the hand-off doc, since none of it is typed in swagger.
- `GET /exams`, `GET /exams/{examId}/attempts`, `GET /exams/generations/{id}`
- `GET /Weaknesses/active`, `GET /Weaknesses/resolved`

**Ask:** annotate response types for these — we're currently modeling them defensively from the markdown examples with everything optional, which means a silent backend shape change won't be caught by the frontend at compile time.

---

## 3. Naming / casing consistency

- `/api/v1/Weaknesses/*` and `/api/v1/Reports/{reportId}/approve` are capitalized; every other route in the API is lowercase (`/exams`, `/attempts`, `/students`, ...). Not blocking, but worth a pass for consistency, and please don't "fix" it silently — a casing change would break the client without a compile error since URLs are just strings.

---

## 4. Security / data exposure

6. **`StudentExamQuestionDto` (the student-facing exam payload) includes `rubric` and `sourceChunkIds`.** The grading rubric is effectively the answer key for essay questions — showing it to the student before they answer is a spoiler, and `sourceChunkIds` leaks retrieval/RAG internals. **Ask:** confirm these are teacher-only fields that shouldn't appear in `GET /students/exams/{id}` or `GET /exams/{examId}/student-view`, and strip them from the student-facing DTO if they currently leak.

   (For contrast: `StudentExamQuestionOptionDto` correctly omits `isCorrect` — the MCQ answer key is *not* leaked, which is why we removed the client-side logic that used to read it. Good pattern; `rubric`/`sourceChunkIds` should get the same treatment.)

7. **OTP reset has no email binding.** `POST /auth/password-reset/confirm` accepts only `{ token, newPassword }` — no email/username. If the 6-digit code space is global (not scoped per-account), that's a meaningful brute-force and collision surface for a 6-digit code. **Ask:** confirm the token is scoped server-side to the account that requested it, confirm its expiry window, and confirm rate limiting exists on both the request and confirm endpoints.

8. **No endpoint accepts anti-cheat telemetry.** The exam-taking client detects tab-switching/copy-paste violations, but nothing is ever sent to the server — a student can trivially bypass proctoring by disabling JS or using dev tools. If server-side enforcement is intended, we'd need an endpoint to report violations against an attempt.

---

## 5. Operational

9. **SignalR event names are unconfirmed.** The client defensively subscribes to four aliases for grading completion (`GradingCompleted`, `GradingJobCompleted`, `AttemptGraded`, `ExamGraded`) and four for exam-generation progress (`GenerationProgressUpdated`, `generationProgressUpdated`, `ReceiveProgress`, `ExamGenerationProgress`) because the canonical name was never confirmed. **Ask:** the single correct event name for each, so we can drop the aliasing.

10. **The exam-generation hub is forced onto `LongPolling`** because WebSocket upgrade returns 401 on `/hubs/exam-generation`. Worth a look — SignalR over WebSockets would reduce latency for both AI exam generation and grading-progress updates.

11. **`GET /teachers/pending-reviews` is unpaginated.** Fine at current scale, but as classrooms grow this response could get large. Consider paging it now rather than as a breaking change later.

12. **Confirm `GenerationStatus` serializes as an integer, not a string.** The client currently models it as a numeric enum (`Pending=0, Retrieving=1, ..., Failed=7`) based on observed behavior; please confirm this is stable API contract and not an implementation detail that could change.

---

## 6. What we're building against in the meantime

Per swagger (authoritative), no removals from the previous spec — 34 net-new endpoints, fully additive. We're treating the untyped endpoints listed in §2 as tolerant/optional-everything DTOs client-side so a shape change degrades gracefully instead of crashing, but that's a stopgap — proper response schemas would let us catch drift at build time instead of in production.

Happy to hop on a call to walk through any of the above.
