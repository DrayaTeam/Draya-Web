# 📝 Notes for Backend Developers (Draya API)

This document tracks backend API improvements, missing DTO fields, or behavioral discrepancies identified during frontend integration.

---

## 📌 Note 1: Student Profile Update DTO — Missing Parent Guardian Fields (PUT /api/v1/students/profile)

### 🔍 Issue Description

- In **Student Registration** (POST /api/v1/auth/register/student), RegisterStudentRequest accepts all three parent guardian properties:
  - parentGuardianName (string)
  - parentGuardianPhone (string)
  - parentGuardianEmail (string)
- However, in **Student Profile Update** (PUT /api/v1/students/profile), UpdateStudentProfileRequest currently only accepts:
  - ullName (string)
  - parentGuardianEmail (string)
  - dateOfBirth (date-time)
  - ❌ parentGuardianName and parentGuardianPhone are **missing** from UpdateStudentProfileRequest.

### 💡 Recommendation for Backend Team

Add parentGuardianName and parentGuardianPhone as nullable optional string fields to UpdateStudentProfileRequest DTO and update the student profile command handler so students can update their guardian’s name and WhatsApp contact number from their account settings.

`csharp
public class UpdateStudentProfileRequest
{
    public string? FullName { get; set; }
    public string? ParentGuardianEmail { get; set; }
    public string? ParentGuardianName { get; set; }
    public string? ParentGuardianPhone { get; set; }
    public DateTime? DateOfBirth { get; set; }
}
`

---

## 📌 Note 2: Re-enrollment After Student Removal (POST /api/v1/classrooms/enroll & POST /api/v1/classrooms/{id}/checkout)

### 🔍 Issue Description

- When a student is removed/unenrolled from a classroom, attempting to re-enroll with a new center code or initiate a new checkout session returns 404 Not Found or a zero price error.
- **Original Feedback:** لو ال student اتشال من ال classroom هينفع يرجع تاني ولا لا بكود جديد فا بلاقي سعر الاشتراك بسفر و بيكون notfound مش بقدر تروح لبوابة الدفع

### 💡 Recommendation for Backend Team

- In the enrollment and checkout handlers, handle the state where an enrollment record exists with status Unenrolled or Revoked by allowing re-activation with a valid new enrollmentCode or creating a fresh Paymob checkout order.

---

## 📌 Note 3: Teacher Name & Picture in Classroom Endpoints (GET /api/v1/teachers & GET /api/v1/classrooms)

### 🔍 Issue Description

- In some responses of GET /classrooms and GET /teachers, the eacherName property returns the subject name instead of the teacher's actual ullName, and pictureUrl is occasionally mismatched or empty.

### 💡 Recommendation for Backend Team

- Ensure SQL joins/projections consistently map Teacher.FullName and Teacher.ProfilePictureUrl to eacherName and eacherAvatarUrl / pictureUrl.

---

## 📌 Note 4: Student Progress Percentage & Materials Count on Classrooms (GET /api/v1/classrooms)

### 🔍 Issue Description

- Student classroom cards require displaying the student's individual progress percentage (e.g. 75%) and the total number of materials/lessons published in that classroom.

### 💡 Recommendation for Backend Team

- Include studentProgress (integer 0-100 or float) and materialsCount / lessonsCount in the ClassroomSummaryDto returned by GET /api/v1/classrooms and GET /api/v1/classrooms/{id} when accessed with a Student JWT.

---

## 📌 Note 5: Support Image Attachment in Reply Update Endpoint (PUT /api/v1/questions/{questionId}/replies/{replyId})

### 🔍 Issue Description

- While creating a question or reply supports photo attachments via multipart endpoints (/questions/with-photo, /replies/with-photo), updating a reply only accepts raw JSON text without an image URL / attachment option.

### 💡 Recommendation for Backend Team

- Update UpdateReplyRequest or provide a multipart endpoint to allow updating/removing the attached image URL on existing discussion replies.

---

## 📌 Note 6: Password Reset Email Delivery for Supervisors & Admins (POST /api/v1/auth/password-reset/request)

### 🔍 Issue Description

- Password reset emails need to be verified and dispatched properly for all platform roles, specifically Supervisor and Admin accounts, ensuring the generated token and reset link point correctly to the frontend reset screen.

### 💡 Recommendation for Backend Team

- Verify SMTP/SendGrid delivery for Admin and Supervisor user accounts when POST /api/v1/auth/password-reset/request is invoked with an administrator email address.

---

## 📌 Note 7: Global Platform Students Listing Endpoint for Admin (GET /api/v1/admin/students)

### 🔍 Issue Description

- The Admin dashboard requires an endpoint to list and search all enrolled students across all teachers, along with global enrollment counts.

### 💡 Recommendation for Backend Team

- Provide GET /api/v1/admin/students supporting pagination (pageNumber, pageSize), search query (search), and grade level filter (gradeLevelId), returning items with { studentId, fullName, email, phone, parentGuardianPhone, enrolledClassroomsCount, createdAt }.

---

## 📌 Note 8: Admin Profile Information Update (PUT /api/v1/admin/profile or PUT /api/v1/auth/me)

### 🔍 Issue Description

- Platform administrators need to update their display name, phone number, and preferences from the admin settings screen.

### 💡 Recommendation for Backend Team

- Provide PUT /api/v1/admin/profile or extend PUT /api/v1/auth/me to accept { fullName, phoneNumber } for Administrator accounts.

---

## 📌 Note 9: Media Streaming Content Security Headers (GET /api/v1/materials/{id}/stream)

### 🔍 Issue Description

- To prevent unauthorized downloading and piracy of educational materials, streaming endpoints should deliver inline viewing headers.

### 💡 Recommendation for Backend Team

- Return Content-Disposition: inline and X-Frame-Options: SAMEORIGIN on GET /api/v1/materials/{id}/stream responses for protected video and document media.

---

## 📌 Note 10: Real-time Notifications SignalR Hub & History (GET /api/v1/notifications + /hubs/notifications)

### 🔍 Issue Description

- The top navigation bar includes an interactive notification bell to display real-time announcements, exam grade alerts, and new Q&A replies.

### 💡 Recommendation for Backend Team

- Establish a SignalR hub at /hubs/notifications and REST endpoint GET /api/v1/notifications returning { id, title, message, type, read, createdAt } with PUT /api/v1/notifications/{id}/read to mark as seen.

## 📌 Note 11: Fix 403 Forbidden on GET /api/v1/exams for Student Role (or provide GET /api/v1/students/exams)

### 🔍 Issue Description

- Currently, when an enrolled student navigates to `/student/exams`, the frontend calls `GET /api/v1/exams` to retrieve their upcoming, scheduled, and active exams.
- The ASP.NET Core backend rejects the request with **`403 (Forbidden)`** because the `ExamsController` currently enforces `[Authorize(Roles = "Teacher")]` on the entire controller or on `GET /api/v1/exams`.

### 💡 Recommendation for Backend Team

- Either update `GET /api/v1/exams` authorization to:
  ```csharp
  [Authorize(Roles = "Teacher,Student")]
  ```
  and when `User.IsInRole("Student")`, automatically filter exams to only those belonging to the student's enrolled classrooms (`ClassroomEnrollments`).
- OR provide a dedicated student endpoint:
  ```http
  GET /api/v1/students/exams?page=1&pageSize=10
  ```
  returning the list of exams available to the authenticated student.

---

## 📌 Note 12: Inconsistent Route Versioning for Classroom Sections (GET /api/classrooms/{id}/sections)

### 🔍 Issue Description

- Most platform controllers are versioned under `/api/v1/...`, but the `ClassroomSectionsController` is routed under `/api/classrooms/{classroomId}/sections` (missing `/v1`).
- Calling `/api/v1/classrooms/{id}/sections` returns **`404 (Not Found)`**.

### 💡 Recommendation for Backend Team

- Standardize the route by adding `api/v1/classrooms/{classroomId}/sections` (or supporting both `/api/v1/...` and `/api/...` through `[Route("api/v1/classrooms/{classroomId}/sections")]`).

---

## 📌 Note 13: Allow Unenrolled Students & Visitors to View Classroom Feedback (GET /api/v1/classrooms/{id}/feedback)

### 🔍 Issue Description

- When prospective students view package details `/student/packages/{id}` before purchasing to read student reviews and ratings, calling `GET /api/v1/classrooms/{id}/feedback` returns **`403 (Forbidden)`**.
- Prospective students need to see course ratings and reviews to decide whether to purchase the course.

### 💡 Recommendation for Backend Team

- Make `GET /api/v1/classrooms/{classroomId}/feedback` publicly accessible or allow `[AllowAnonymous]` / `[Authorize(Roles = "Student,Teacher,Admin,SuperAdmin")]` without requiring an active classroom enrollment to view public reviews.

---

## 📌 Note 14: Manual Balance Adjustments History / Audit Log for Admin (GET /api/v1/admin/financial/adjustments)

### 🔍 Issue Description

- Platform administrators can create manual balance adjustments via `POST /api/v1/admin/financial/adjustments`.
- However, there is currently no corresponding `GET /api/v1/admin/financial/adjustments` endpoint to view a paginated audit log of all manual adjustments made by administrators across all teachers.

### 💡 Recommendation for Backend Team

- Provide `GET /api/v1/admin/financial/adjustments` with query parameters `(pageNumber, pageSize, teacherId, balanceType)` returning:
  ```json
  {
    "items": [
      {
        "id": "adj-uuid",
        "teacherId": "teacher-uuid",
        "teacherName": "أ. حسام الدين",
        "amount": 1500,
        "balanceType": "Earned",
        "reason": "مكافأة تميز في إنتاج المحتوى",
        "createdByName": "أ. عبدالرحمن العنزي",
        "createdAt": "2026-08-20T14:30:00Z"
      }
    ],
    "totalCount": 1,
    "pageNumber": 1,
    "pageSize": 10
  }
  ```

---

## 📌 Note 15: 403 Forbidden on GET /api/v1/exams/generations/{generationId} for Student Role (blocks practice-exam tracking)

### 🔍 Issue Description

- This is the same root cause as **Note 11** (`ExamsController` restricted to `[Authorize(Roles = "Teacher")]`), but flagged separately because it blocks a _student_-only feature end to end, not just the exam list.
- When a student requests an AI practice exam for a weak topic (`POST /api/v1/students/{studentId}/weak-topics/{topicName}/practice-exam`, 202 Accepted), the frontend tracks generation progress via `GET /api/v1/exams/generations/{generationId}` — the exact same endpoint the teacher module polls after `POST /api/v1/exams/generate`.
- Because the whole `ExamsController` (or at least this action) is `[Authorize(Roles = "Teacher")]`, a student polling their own practice-exam generation gets **403 Forbidden** on every request. There is no student-facing equivalent endpoint.
- Net effect: a student who requests a practice exam currently has no reliable way to know when it's ready — the frontend falls back to a fragile heuristic (polling `/students/exams` and fuzzy-matching the newly created exam by title) specifically because this endpoint is unusable for students.

### 💡 Recommendation for Backend Team

- Same fix shape as Note 11 — either:
  ```csharp
  [Authorize(Roles = "Teacher,Student")]
  ```
  on `GET /api/v1/exams/generations/{generationId}`, with a check that the requesting student owns the generation job (matches the `studentId` that triggered it) before returning status — a student should not be able to poll another student's or a teacher's generation job by guessing its id.
- OR provide a dedicated student-scoped endpoint, e.g. `GET /api/v1/students/exam-generations/{generationId}`, scoped to the authenticated student's own jobs only.
- Please also confirm: does `POST /students/{studentId}/weak-topics/{topicName}/practice-exam` return a `generationId` (or similarly named field) in its 202 body at all? This is currently unconfirmed — see `BACKEND_ISSUES_REPORT.md` item 4 — and is a prerequisite for polling this endpoint regardless of the authorization fix above.

---

## 📌 Note 16: `finalScore` Has No Reliable Scale Indicator (drives fragile frontend score-guessing)

### ✅ Resolved — 2026-08-24

**Backend response:** `maxScore` is now explicitly supplied alongside `finalScore`/`latestScore` on `GetStudentExams` (both exam-level and per-attempt) and alongside `averageScore` as `averageMaxScore` on `GetLatestPerformanceReport` trend points. `SubjectProficiencies.proficiencyPercent` and `WeakTopics.proficiencyPercent`/`previousProficiencyPercent`/`delta` were confirmed already normalized 0–100 and unchanged.

**Frontend fix:** All magnitude-guessing removed from the confirmed fields. `formatExamScoreDisplay()` prefers a per-attempt `maxScore` over the exam-level one when both are present; `subjectProficiencyPercent()` (new helper in `student-reports.service.ts`) trusts `proficiencyPercent` directly instead of guessing; `monthlyGrowthPercent` now diffs trend points as `averageScore / averageMaxScore` percentages instead of subtracting raw `averageScore` values, which previously swung wildly whenever consecutive months had exams on different point scales.

### 🔍 Original Issue Description

- `AttemptResultResponseDto.finalScore` (returned by `GET /api/v1/attempts/{attemptId}/results`) is sometimes a raw points value (e.g. `7` out of a 10-point exam) and sometimes appears to already be a 0–100 percentage, with no field reliably indicating which. `maxScore` on the same DTO is present in some responses and absent/zero in others.
- Per-answer detail (`AnswerGradingResultDto.score`/`.maxScore`) is the one reliable source — the frontend correctly derives the percentage from `sum(score)/sum(maxScore)` when that detail is present. The ambiguity only shows up in the **fallback** path, when only the aggregate `finalScore` is available (e.g. a weak-topic summary in `WeakTopicResult`/`PerformanceReportDto`, or a `StudentExamSummaryDto.latestScore`) with no per-answer breakdown to compute from.
- To work around this, the frontend previously guessed the scale from the raw number's magnitude (`<=5` → assume out of 5, `<=10` → assume out of 10, `>10` → assume already a percentage). This is unreliable by construction — a genuine low score like `8%` is indistinguishable from `8/10` — and different frontend call sites had drifted to slightly different guessing thresholds, which is part of why the same exam could show different percentages on different screens.

### 💡 Recommendation for Backend Team

- Please make one of these true everywhere `finalScore` (or any other bare score field with no accompanying max) is returned:
  1. **Always normalize it to a 0–100 percentage** before sending it to the client, regardless of the exam's point scale, or
  2. **Always include the corresponding max/total** alongside it (e.g. `finalScore` + `maxScore` together, never one without the other) so the client can compute `finalScore / maxScore * 100` deterministically.
- Whichever is chosen, please apply it consistently across `AttemptResultResponseDto.finalScore`, `StudentExamSummaryDto.latestScore`, `WeakTopicResult.proficiencyPercent`/`accuracyPercentage`, and any other "score-shaped" field — right now some of these are percentages and some are raw points, with no field name convention distinguishing them.
- Frontend fix in progress on our side: centralizing all percentage formatting through one shared function and removing the magnitude-based guessing, falling back to "treat as already a percentage, clamp to 0–100" when no max is available — but this is strictly worse than getting a real scale indicator from the API, since a genuinely low percentage and a low raw score both look identical without one.

---

## 📌 Note 17: SignalR Hubs Fail on Production (WebSocket + ServerSentEvents Both Rejected) — Infra, Not Purely Backend Code

### 🔍 Issue Description

- On the deployed production site, every SignalR hub connection (`/hubs/notifications`, `/hubs/reports`, `/hubs/materials`, `/hubs/qa`, `/hubs/exam-generation`, `/hubs/exam-grading`) fails both the WebSocket and ServerSentEvents transports before falling back to LongPolling:
  - `WebSocket connection to 'wss://draya-lms.vercel.app/hubs/notifications?...' failed`
  - `Failed to start the transport 'ServerSentEvents': ... the connection could not be found on the server, either the connection ID is not present on the server, or a proxy is refusing/buffering the connection. If you have multiple servers check that sticky sessions are enabled.`
  - A `401` is also seen on the hub negotiate request itself in some sessions.
- Root cause on our side: `vercel.json` proxies `/hubs/:path*` (and `/api/:path*`) to `http://draya-api.runasp.net/hubs/:path*` via a Vercel **rewrite**. Vercel's rewrite/edge layer works for plain request/response HTTP calls, but it does **not** tunnel WebSocket upgrades, and it does not guarantee the same serverless/edge instance handles every poll of a single long-polling or SSE "connection" — which is exactly what the SignalR client's own error text is describing (no sticky sessions across the proxy).
- The backend is also only reachable over plain `http://` (`draya-api.runasp.net`), not `https://`. Since the frontend is served over `https://draya-lms.vercel.app`, a direct `wss://`/`https://` connection straight to the backend would additionally be blocked by the browser as mixed content — the Vercel rewrite is currently the only reason the REST calls work at all.
- Net effect: every real-time feature (live notifications, exam-generation/grading progress push, reports-ready push, QA hub) currently degrades to whatever polling fallback the frontend has for it, or silently does nothing if no fallback exists. This is **not** the same bug as the "t.reduce is not a function" crash reported alongside it — the SignalR failures are caught and logged as warnings, not thrown, so they don't crash the page — but they mean real-time features are effectively non-functional in production right now.

### 💡 Recommendation for Backend Team

- Serve the API over **HTTPS** with a real TLS certificate (a bare HTTP-only backend behind a proxy is the blocker for connecting directly, and is also a security gap on its own for anything carrying auth tokens).
- Once HTTPS is available, we can point `signalrHubUrl`/`reportsHubUrl`/etc. at the backend's own absolute origin (`wss://draya-api.<domain>/hubs/...`) instead of routing hub traffic through the Vercel rewrite, which resolves the transport/sticky-session problem entirely (REST calls can stay proxied through `/api/*` since those are stateless single request/response).
- Alternatively, if the backend must stay behind the Vercel proxy for hubs too, confirm whether the hosting supports WebSocket passthrough and sticky sessions end-to-end — but going direct to an HTTPS backend origin is the more reliable fix.

---

## 📌 Note 18: `GET /teachers/pending-reviews` — Confirm Response Is a Bare Array

### ✅ Resolved — 2026-08-24

**Backend response:** The endpoint correctly returns `PagedResult<PendingReviewClassroomDto>` with an `items` array — not a bare array. The Swagger annotation is accurate; the crash was the frontend calling `.reduce()` on the root paged-result object instead of `.items`. Backend is adding an explicit `<remarks>` doc comment to the endpoint to prevent future confusion.

**Frontend fix:** `TeacherAttemptReviewService.getPendingReviews()` now types the response as `PaginatedResponse<PendingReviewClassroomDto>` (the same paging envelope used elsewhere in this codebase) and reads `res.items`, instead of the speculative bare-array/`items`/`data` normalization guess from the original fix. Regression tests updated to flush the real `PagedResult` shape.

### 🔍 Original Issue Description

- Swagger types this endpoint as returning `PendingReviewClassroomDto[]` directly, and that's what the frontend originally assumed and called `.reduce()` on immediately.
- Calling `.reduce()` directly on the paged-result root object throws `TypeError: t.reduce is not a function` and crashes the whole teacher dashboard — this reproduced for us and is now fixed by reading `.items`.

---

## 📌 Note 19: Several Dashboard/Analytics Score Fields Have No Confirmed Scale

### 🔍 Issue Description

- A full audit against the live swagger spec (2026-08-24) confirmed that almost every score field on exam/attempt/weakness DTOs is either a paired `score`+`maxScore`, or an explicitly-percent field (`proficiencyPercent`, `currentProficiencyPercent`) — see Note 16's resolution.
- A handful of **dashboard/analytics** fields were not part of that pass and have **no paired max/total field and no naming convention indicating scale**: `TeacherDashboardDto.classAverage`, `DailySubmissionActivityDto.averageScore`, `StudentAtRiskDto.overallAverage`, `RecentSubmissionDto.score`, `StudentDashboardDto.overallAverage`, `StudentAnalyticsDto.overallAverage` / `.highestScore`.
- The frontend previously had **inconsistent, wrong guesses** about these fields' scale in different places (e.g. dividing `averageScore` by 5 in one spot while treating the identical field as already 0-100 elsewhere). We've now standardized all of these to be **treated as already a 0-100 percentage**, based on the strong convention set by every other confirmed field in this API — but this is an inference, not a confirmation, for this specific set of fields.

### 💡 Recommendation for Backend Team

- Please confirm whether `classAverage`, `averageScore` (on `DailySubmissionActivityDto`), `overallAverage` (on `TeacherDashboardDto`'s related DTOs and `StudentAnalyticsDto`), `score` (on `RecentSubmissionDto`), and `StudentDashboardDto.overallAverage` are always 0-100 percentages. If any of them are actually raw points on a different scale, please add a paired max/total field (matching the `finalScore`+`maxScore` pattern) rather than leaving the client to guess.

---

## 📌 Note 20: A Few More Endpoints Still Have No Response Schema in Swagger

### 🔍 Issue Description

Following up on Note 5 (mostly resolved — exam/attempt/weakness/notification DTOs are now typed): three endpoints touched by tonight's audit are still undocumented (`200: (no body)` in swagger), so the client is still parsing them tolerantly/defensively rather than against a real contract:
- `GET /api/v1/exams/{examId}/attempts` (teacher-side attempt list per exam — used by the exam-attempts screen; in particular we cannot confirm whether `finalScore` here is paired with a `maxScore` the way `StudentExamAttemptSummaryDto`/`AttemptResultsDto` are).
- `GET /api/v1/exams/{examId}/student-view`
- `GET /api/v1/exams/generations/{generationId}` (also returns an undocumented `206` alongside `200`/`404` — please clarify what `206` means here, e.g. partial/in-progress vs. a paging convention).

### 💡 Recommendation for Backend Team

- Add response schemas for these three, in particular confirming `GET /exams/{examId}/attempts`'s per-attempt score shape (paired with a max, like every other confirmed attempt DTO).

---

_Last updated: 2026-08-24 by Frontend Team_
