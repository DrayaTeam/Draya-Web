# CONTEXT.md — Draya Web Platform

> **Purpose:** This file is the single source of truth for the Draya Web frontend project. AI agents and team members should read this file instead of the PDFs to understand the project scope, sprints, backlog, and APIs.

---

## 🎯 Project Overview

**Draya (دراية)** is an **Arabic-first, AI-powered EdTech platform** for Egyptian secondary school students, teachers, and parents. It enables teachers to build AI-generated exams from uploaded lesson materials, students to take timed exams with anti-cheating enforcement, and parents to receive automated performance reports.

| Property         | Value                                                                                |
| ---------------- | ------------------------------------------------------------------------------------ |
| **Platform**     | Web (Angular 20)                                                                     |
| **Language**     | Arabic (RTL-first), English secondary                                                |
| **Target Users** | Secondary school teachers, students, parents                                         |
| **Market**       | Egypt (EGP currency, Paymob payments)                                                |
| **AI Features**  | AI Exam Generation from materials (RAG), AI Grading (essay/rubric), Weakness Reports |

---

## 👥 User Roles

| Role           | Route Prefix | Key Capabilities                                                                          |
| -------------- | ------------ | ----------------------------------------------------------------------------------------- |
| **Teacher**    | `/teacher/*` | Create classrooms, upload materials, build/publish exams, view analytics, grade overrides |
| **Student**    | `/student/*` | Join classrooms, take exams, view results & AI reports                                    |
| **Parent**     | `/parent/*`  | View child's performance reports (receives automated email too)                           |
| **SuperAdmin** | `/admin/*`   | Manage teachers, subscription plans, payouts, platform health                             |

---

## 🏗️ Tech Stack

| Layer      | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Framework  | Angular 20 (Standalone, Signals, strict mode)              |
| UI Library | PrimeNG v20 LTS + `tailwindcss-primeui`                    |
| Styling    | Tailwind CSS v4 (RTL-first, no arbitrary values)           |
| i18n       | `@ngx-translate/core` v18 (AR + EN)                        |
| Real-time  | `@microsoft/signalr` (notifications, chat, grading events) |
| Auth       | JWT (access + refresh token), `jwt-decode` lib             |
| Testing    | Jasmine + Karma                                            |
| Payments   | Paymob (redirect flow + webhook)                           |
| Build      | Angular CLI 20, ESLint, Prettier                           |

### Architecture Pattern

```
src/app/
├── core/           # Singleton: AuthService, Guards, Interceptors, Models
├── shared/         # Reusable: components, pipes, directives
├── features/
│   ├── auth/       # Login, Register, Forgot Password
│   ├── teacher/    # Classrooms, Exams, Materials, Analytics
│   ├── student/    # Dashboard, Exam Taking, Results
│   └── parent/     # Child Reports
└── layout/         # Shell components, Navigation
```

---

## 📦 Sprint Plan Summary

### Sprint 1 — Foundation (26 stories)

**Theme:** Auth + Subscriptions + Classrooms + Real-time Infrastructure

| ID     | Story                                    | Priority |
| ------ | ---------------------------------------- | -------- |
| US-001 | Teacher Registration                     | Critical |
| US-002 | Student Registration                     | Critical |
| US-003 | User Login                               | Critical |
| US-004 | Refresh Access Token                     | High     |
| US-005 | Logout                                   | Medium   |
| US-006 | View Own Profile                         | Medium   |
| US-007 | Password Reset                           | High     |
| US-008 | Account Lockout on Repeated Failed Login | Medium   |
| US-009 | Role-Based Ownership Enforcement         | Critical |
| US-010 | View Current Subscription Plan           | Medium   |
| US-011 | View Subscription Usage                  | Medium   |
| US-012 | Enforce Quota Limits on Actions          | High     |
| US-013 | Notify Teacher on Quota Limit Reached    | Medium   |
| US-014 | View Subject List                        | High     |
| US-015 | Teacher Creates New Subject              | Medium   |
| US-016 | Teacher Creates Classroom                | Critical |
| US-017 | Teacher Views Own Classrooms             | High     |
| US-018 | View Classroom Detail                    | High     |
| US-019 | Teacher Updates Classroom                | Medium   |
| US-020 | Teacher Deletes/Deactivates Classroom    | Medium   |
| US-021 | Teacher Regenerates Enrollment Code      | Medium   |
| US-022 | Student Joins Free Classroom via Code    | Critical |
| US-023 | Teacher Views Classroom Roster           | High     |
| US-024 | Teacher Removes Student from Classroom   | Medium   |
| US-115 | SignalR Hub Setup                        | Critical |
| US-116 | System Health Check Endpoint             | Medium   |

> **Note:** US-115 (SignalR) is in Sprint 1 because all real-time features in later sprints (US-043, US-049, US-070, US-084) plug into this hub.

---

### Sprint 2 — Payments & Content (19 stories)

**Theme:** Paid classrooms + Paymob + Material upload + Streaming

| ID     | Story                                             | Priority |
| ------ | ------------------------------------------------- | -------- |
| US-025 | Teacher Sets Classroom Pricing                    | Critical |
| US-026 | View Classroom Pricing                            | High     |
| US-027 | Student Initiates Paid Classroom Checkout         | Critical |
| US-028 | Student Polls Payment/Enrollment Status           | Critical |
| US-029 | System Processes Paymob Webhook                   | Critical |
| US-030 | Teacher Views Payout Statements                   | Medium   |
| US-031 | Teacher Views Payout Statement Detail             | Medium   |
| US-032 | SuperAdmin Views All Payout Statements            | Medium   |
| US-033 | SuperAdmin Marks Payout as Paid                   | Medium   |
| US-034 | SuperAdmin Marks Transaction as Refunded          | Medium   |
| US-035 | Teacher Uploads Lesson Material                   | Critical |
| US-036 | View Materials List                               | Medium   |
| US-037 | View Material Detail                              | Medium   |
| US-038 | Teacher Uploads New Material Version              | High     |
| US-039 | Teacher Views Material Version History            | Medium   |
| US-040 | Poll Material Parse Status                        | Medium   |
| US-041 | Teacher Soft-Deletes Material                     | Medium   |
| US-042 | Stream Video Material                             | High     |
| US-043 | Real-Time Notification on Material Parse Complete | Low      |

---

### Sprint 3 — RAG & AI Exam Builder (20 stories)

**Theme:** AI exam generation from materials + Exam management + Question bank

| ID     | Story                                          | Priority |
| ------ | ---------------------------------------------- | -------- |
| US-044 | Automatic Content Chunking                     | Critical |
| US-045 | Automatic Embedding Generation                 | Critical |
| US-046 | Metadata Tagging for Retrieval Filtering       | High     |
| US-047 | Semantic Retrieval for Exam Generation         | Critical |
| US-048 | Teacher Requests AI-Generated Exam             | Critical |
| US-049 | Real-Time Push on Exam Generation Completion   | Medium   |
| US-050 | Handle Insufficient Content (DATA_UNAVAILABLE) | Critical |
| US-051 | Teacher Creates Empty/Manual Exam              | Medium   |
| US-052 | View Exam List                                 | Medium   |
| US-053 | View Exam Detail                               | Critical |
| US-054 | Teacher Updates Exam Metadata                  | High     |
| US-055 | Teacher Attaches Question to Exam              | High     |
| US-056 | Teacher Removes Question from Exam             | Medium   |
| US-057 | Teacher Reorders/Repoints Exam Questions       | Medium   |
| US-058 | Teacher Publishes Exam                         | Critical |
| US-059 | View Question Bank                             | Medium   |
| US-060 | Teacher Manually Authors Question              | High     |
| US-061 | AI Generates Rubric for Essay/Short-Answer     | High     |
| US-062 | Teacher Edits Question or Rubric               | Medium   |
| US-063 | Teacher Deactivates Question                   | Medium   |

---

### Sprint 4 — Exam Delivery & Grading (12 stories)

**Theme:** Students take exams, AI grades, teacher overrides

| ID     | Story                                              | Priority |
| ------ | -------------------------------------------------- | -------- |
| US-064 | Student Starts Exam Attempt                        | Critical |
| US-065 | Student Autosaves Answer                           | Critical |
| US-066 | Student Submits Exam                               | Critical |
| US-067 | Web Anti-Cheating Detection                        | High     |
| US-068 | Mobile Anti-Cheating Detection                     | High     |
| US-069 | Anti-Cheating Warning & Flag Escalation            | High     |
| US-070 | Real-Time Push on Grading Completion               | High     |
| US-071 | View Graded Attempt Result                         | High     |
| US-072 | Teacher Views All Attempts for an Exam             | High     |
| US-073 | Teacher Views Single Answer Detail & AI Confidence | High     |
| US-074 | Teacher Overrides AI Score                         | Critical |
| US-075 | Teacher Views Score Override History               | Medium   |

---

### Sprint 5 — Reports, Comms, Admin & Hardening (39 stories)

**Theme:** AI reports + Chat + Notifications + Admin panel + Security

| ID     | Story                                         | Priority |
| ------ | --------------------------------------------- | -------- |
| US-076 | Generate Topic-Level Weakness Report          | Critical |
| US-077 | Teacher Views Student Report List             | High     |
| US-078 | View Full Report Detail                       | High     |
| US-079 | Teacher Views Class-Level Weak-Topic Overview | High     |
| US-080 | Automatic Parent/Guardian Email After Exam    | Critical |
| US-081 | Teacher Views Parent Email Audit Log          | Low      |
| US-082 | Send Classroom Chat Message                   | High     |
| US-083 | View Classroom Chat History                   | Medium   |
| US-084 | Real-Time Chat Message Delivery               | Medium   |
| US-085 | View Notification List                        | Medium   |
| US-086 | Mark Notification as Read                     | Medium   |
| US-087 | In-App Notification Triggers                  | High     |
| US-088 | Push Notification Delivery                    | Medium   |
| US-089 | Email Notification Delivery                   | Medium   |
| US-090 | Teacher Dashboard                             | High     |
| US-091 | Student Dashboard                             | Medium   |
| US-092 | SuperAdmin Dashboard                          | Low      |
| US-093 | SuperAdmin Manages Subscription Plan Catalog  | High     |
| US-094 | SuperAdmin Manages Teacher Accounts           | High     |
| US-095 | SuperAdmin Deactivates Teacher Account        | High     |
| US-096 | Enforce HTTPS Across Platform                 | Critical |
| US-097 | PII Anonymization Pipeline for AI Calls       | Critical |
| US-098 | Encrypt Sensitive Data at Rest                | High     |
| US-099 | API Rate Limiting                             | Medium   |
| US-100 | Webhook HMAC Signature Verification           | Critical |
| US-101 | Trace AI Prompt Calls                         | High     |
| US-102 | Monitor Token Usage & Cost                    | Medium   |
| US-103 | Monitor AI Latency                            | Medium   |
| US-104 | Enforce Deterministic Temperature             | High     |
| US-105 | Log Administrative Actions                    | High     |
| US-106 | View Audit Log                                | Medium   |
| US-107 | Application Health Monitoring                 | Medium   |
| US-108 | Error Logging & Alerting                      | Medium   |
| US-109 | Search Materials                              | Low      |
| US-110 | Search Exams                                  | Low      |
| US-111 | Scheduled Payout Statement Generation         | Medium   |
| US-112 | Monthly Usage Counter Reset                   | Medium   |
| US-113 | Retry Failed AI Job Queue                     | Medium   |
| US-114 | Scheduled Cleanup of Incomplete Attempts      | Medium   |

---

## 🔑 Key Domain Models

### Question Types

`MCQ` | `ShortAnswer` | `FillBlank` | `Essay`

### Difficulty Levels

`Easy` | `Medium` | `Hard`

### Question Source

`Manual` | `AIGenerated` | `AIAssistedEdited`

### Exam Status

`Draft` → `Published` → `Archived`

### Attempt Status

`InProgress` | `Submitted` | `Expired`

### Grading Status

`Pending` | `InProgress` | `Completed` | `Failed`

### Material Parse Status

`Pending` | `Parsed` | `Failed`

### Material Types

`PDF` | `Video` | `DOCX` | `PPTX`

### Payout/Payment Status

`Pending` | `Paid` | `Failed` | `Success`

### Anti-Cheating Event Types

`CopyPaste` | `TabSwitch` | `WindowBlur`

### User Roles

`Teacher` | `Student` | `Parent` | `SuperAdmin`

---

## 🌐 API Reference

**Base URL:** `https://api.draya.app/api/v1`  
**Auth Header:** `Authorization: Bearer <accessToken>`  
**Content-Type:** `application/json` (except file uploads: `multipart/form-data`)  
**Postman Collection:** `Draya Platform API.postman_collection.json` (project root)

### Auth & Identity (Module 1)

| Method | Endpoint                 | Auth | Description                                                                             |
| ------ | ------------------------ | ---- | --------------------------------------------------------------------------------------- |
| POST   | `/auth/register/teacher` | ❌   | Teacher self-signup → returns tokens + user                                             |
| POST   | `/auth/register/student` | ❌   | Student self-signup (requires `parentGuardianEmail`, `dateOfBirth`)                     |
| POST   | `/auth/login`            | ❌   | Login (all roles) → `{accessToken, refreshToken, expiresIn, user}`                      |
| POST   | `/auth/refresh-token`    | ❌   | Body: `{refreshToken}` → new token set                                                  |
| POST   | `/auth/logout`           | ✅   | Revokes refresh token → `204`                                                           |
| GET    | `/auth/me`               | ✅   | Own profile: `{userId, email, fullName, role, phone, parentGuardianEmail, dateOfBirth}` |

**Login Response:**

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 9150,
  "user": { "userId": "uuid", "fullName": "string", "role": "Teacher" }
}
```

**Error Format:**

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": [{ "field": "string", "issue": "string" }]
  }
}
```

---

### Subjects (Module 2)

| Method | Endpoint    | Auth     | Description                           |
| ------ | ----------- | -------- | ------------------------------------- |
| GET    | `/subjects` | Optional | `[{subjectId, name}]` — public lookup |

---

### Classrooms (Module 3)

| Method | Endpoint                              | Auth       | Description                                                                                         |
| ------ | ------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| POST   | `/classrooms`                         | ✅ Teacher | Create: `{subjectId, name}` → classroom with `enrollmentCode`                                       |
| GET    | `/classrooms?page=1&pageSize=20`      | ✅         | Teacher: own classrooms; Student: enrolled classrooms                                               |
| GET    | `/classrooms/:id`                     | ✅         | Single classroom detail                                                                             |
| PUT    | `/classrooms/:id`                     | ✅ Teacher | Update: `{name, subjectId, isActive}`                                                               |
| DELETE | `/classrooms/:id`                     | ✅ Teacher | Deactivate → `204`                                                                                  |
| POST   | `/classrooms/:id/regenerate-code`     | ✅ Teacher | New enrollment code                                                                                 |
| POST   | `/classrooms/enroll`                  | ✅ Student | Body: `{enrollmentCode}` → enrolled classroom                                                       |
| GET    | `/classrooms/:id/students?page=1`     | ✅ Teacher | Roster: `[{studentId, fullName, enrolledAt, status}]`                                               |
| DELETE | `/classrooms/:id/students/:studentId` | ✅ Teacher | Remove student → `204`                                                                              |
| PUT    | `/classrooms/:id/pricing`             | ✅ Teacher | Body: `{price, currency}` → pricing object                                                          |
| GET    | `/classrooms/:id/pricing`             | ✅         | Get price: `{classroomId, price, currency, isFree, updatedAt}`                                      |
| POST   | `/classrooms/:id/materials`           | ✅ Teacher | Multipart: `{title, materialType, file}` → `202` + materialId                                       |
| GET    | `/classrooms/:id/materials?page=1`    | ✅         | Paginated materials list                                                                            |
| POST   | `/classrooms/:id/exams/generate`      | ✅ Teacher | Body: `{materialVersionId, difficultyLevel, questionTypes[], questionCount, title}` → `202 + jobId` |
| GET    | `/classrooms/:id/exams`               | ✅         | List all exams for classroom                                                                        |
| GET    | `/classrooms/:id/reports/overview`    | ✅ Teacher | `{studentCount, weakestTopics[{topic, avgProficiency, studentsBelow60Pct}]}`                        |
| POST   | `/classrooms/:id/enrollment-checkout` | ✅ Student | Initiate Paymob payment → `{transactionId, paymentUrl, amount, currency, status}`                   |
| GET    | `/classrooms/:id/messages`            | ✅         | List chat messages                                                                                  |
| POST   | `/classrooms/:id/messages`            | ✅         | Body: `{messageText, isAnnouncement}` → `201`                                                       |

---

### Materials (Module 4)

| Method | Endpoint                              | Auth       | Description                                                                 |
| ------ | ------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| GET    | `/materials/:id`                      | ✅         | Detail with `currentVersion`                                                |
| DELETE | `/materials/:id`                      | ✅ Teacher | Soft delete → `204`                                                         |
| POST   | `/materials/:id/versions`             | ✅ Teacher | Multipart `file` → `202 + {versionId, versionNumber, fileUrl, parseStatus}` |
| GET    | `/materials/:id/versions`             | ✅         | Full version history                                                        |
| GET    | `/materials/:id/versions/:vid/status` | ✅         | `{parseStatus: Pending                                                      | Parsed | Failed}` |
| GET    | `/materials/:id/stream`               | ✅         | `{streamUrl, expiresAt}` — video only                                       |

---

### Exam Generation Jobs (Module 5)

| Method | Endpoint                       | Auth | Description                                                                                 |
| ------ | ------------------------------ | ---- | ------------------------------------------------------------------------------------------- |
| GET    | `/exam-generation-jobs/:jobId` | ✅   | Poll: `{jobId, status, examId, requestedCount, generatedCount, insufficientContentWarning}` |

---

### Exams (Module 6)

| Method | Endpoint                       | Auth       | Description                                                                            |
| ------ | ------------------------------ | ---------- | -------------------------------------------------------------------------------------- |
| POST   | `/exams`                       | ✅ Teacher | Create manual: `{classroomId, title, difficultyLevel, timeLimitMinutes}` → `201` Draft |
| GET    | `/exams/:id`                   | ✅         | Full detail with `questions[]` + status + settings                                     |
| PUT    | `/exams/:id`                   | ✅ Teacher | `{title, timeLimitMinutes, randomizeQuestionOrder, randomizeOptionOrder}`              |
| POST   | `/exams/:id/publish`           | ✅ Teacher | Draft → Published                                                                      |
| POST   | `/exams/:id/questions`         | ✅ Teacher | Attach existing `{questionId}` OR inline new question + `{points, orderIndex}`         |
| DELETE | `/exams/:id/questions/:qid`    | ✅ Teacher | `204`                                                                                  |
| POST   | `/exams/:id/questions/reorder` | ✅ Teacher | Array: `[{questionId, orderIndex, points}]`                                            |
| POST   | `/exams/:id/attempts/start`    | ✅ Student | Start attempt → `{attemptId, startedAt, status, timeLimitMinutes, questions[]}`        |
| GET    | `/exams/:id/attempts`          | ✅ Teacher | All attempts with scores                                                               |

---

### Question Bank (Module 7)

| Method | Endpoint                                                   | Auth       | Description                                                                   |
| ------ | ---------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| GET    | `/question-bank?subjectId=&questionType=&difficultyLevel=` | ✅ Teacher | Filter & list                                                                 |
| POST   | `/question-bank`                                           | ✅ Teacher | `{questionType, questionText, difficultyLevel, subjectId, options[], rubric}` |

---

### Questions (Module 8)

| Method | Endpoint         | Auth       | Description          |
| ------ | ---------------- | ---------- | -------------------- |
| PUT    | `/questions/:id` | ✅ Teacher | Edit question/rubric |
| DELETE | `/questions/:id` | ✅ Teacher | Deactivate → `204`   |

---

### Attempts (Module 9)

| Method | Endpoint                             | Auth       | Description                                                       |
| ------ | ------------------------------------ | ---------- | ----------------------------------------------------------------- |
| POST   | `/attempts/:id/answers`              | ✅ Student | Autosave: `{questionId, selectedOptionId?, answerText?}`          |
| POST   | `/attempts/:id/submit`               | ✅ Student | Final submit → `202 {attemptId, status, gradingStatus}`           |
| POST   | `/attempts/:id/anti-cheating-events` | ✅ Student | `{eventType}` → `{sequenceNumber, action}`                        |
| GET    | `/attempts/:id/results`              | ✅         | Full graded result: `{totalScore, maxScore, answers[], gradedAt}` |

---

### Answers (Module 10)

| Method | Endpoint                 | Auth       | Description                                                          |
| ------ | ------------------------ | ---------- | -------------------------------------------------------------------- |
| PUT    | `/answers/:id/override`  | ✅ Teacher | `{newScore, reason}` → `wasOverridden: true`                         |
| GET    | `/answers/:id/overrides` | ✅ Teacher | Override audit history                                               |
| GET    | `/answers/:id`           | ✅         | Full answer: `{aiScore, finalScore, confidenceScore, wasOverridden}` |

---

### Students (Module 11)

| Method | Endpoint                           | Auth       | Description                                                 |
| ------ | ---------------------------------- | ---------- | ----------------------------------------------------------- |
| GET    | `/students/:id/reports?page=1`     | ✅         | `[{reportId, examAttemptId, generatedAt, weakTopicsCount}]` |
| GET    | `/students/:id/parent-report-logs` | ✅ Teacher | `[{logId, recipientEmail, sentAt, status}]`                 |

---

### Reports (Module 12)

| Method | Endpoint       | Auth | Description                                                                         |
| ------ | -------------- | ---- | ----------------------------------------------------------------------------------- |
| GET    | `/reports/:id` | ✅   | `{summaryText, weakTopics[{topic, proficiencyScore, recommendation}], generatedAt}` |

---

### Enrollment Checkout (Module 13)

| Method | Endpoint                           | Auth       | Description       |
| ------ | ---------------------------------- | ---------- | ----------------- |
| GET    | `/enrollment-checkout/:tid/status` | ✅ Student | `{status: Pending | Success | Failed, enrollmentId, classroomId}` |

---

### Notifications (Module 17)

| Method | Endpoint                  | Auth | Description                 |
| ------ | ------------------------- | ---- | --------------------------- |
| GET    | `/notifications`          | ✅   | Caller's notifications list |
| PUT    | `/notifications/:id/read` | ✅   | Mark read → `204`           |

---

### Subscription (Module 18)

| Method | Endpoint                | Auth       | Description          |
| ------ | ----------------------- | ---------- | -------------------- |
| GET    | `/subscription/current` | ✅ Teacher | Current plan         |
| GET    | `/subscription/usage`   | ✅ Teacher | Usage vs plan limits |

---

### Teacher Payouts (Module 15)

| Method | Endpoint                  | Auth       | Description                                                                                |
| ------ | ------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| GET    | `/teacher/payouts?page=1` | ✅ Teacher | `[{payoutId, periodStart, periodEnd, grossAmount, platformFeePercent, netAmount, status}]` |
| GET    | `/teacher/payouts/:id`    | ✅ Teacher | Single payout detail                                                                       |

---

### Admin Payouts (Module 16)

| Method | Endpoint                       | Auth          | Description           |
| ------ | ------------------------------ | ------------- | --------------------- |
| GET    | `/admin/payouts?page=1`        | ✅ SuperAdmin | All teachers' payouts |
| PUT    | `/admin/payouts/:id/mark-paid` | ✅ SuperAdmin | Mark as transferred   |

---

## 🔔 Real-Time Events (SignalR)

| Event                     | Who Receives        | Trigger                             |
| ------------------------- | ------------------- | ----------------------------------- |
| `MaterialParsed`          | Teacher (uploader)  | Material parsing completes or fails |
| `ExamGenerationCompleted` | Teacher (requester) | AI exam generation job done         |
| `GradingCompleted`        | Student             | AI grading of their attempt done    |
| `NewChatMessage`          | Classroom members   | New chat message posted             |

**Hub URL:** `{apiBase}/hubs/notifications`

---

## 📁 Figma Screens Reference

### Auth Screens

- Login page (split-shell layout — see DESIGN.md §6)
- Teacher Registration
- Student Registration
- Forgot Password

### Teacher Screens

- Teacher Dashboard (stats: classrooms, students, exams, revenue)
- My Classrooms list
- Classroom Detail (tabs: Students, Materials, Exams, Chat)
- Create/Edit Classroom modal
- Materials list + upload modal
- Material detail (PDF viewer / video player)
- AI Exam Generation wizard
- Exam Builder (question list, drag-to-reorder, question editor)
- Question Bank
- Publish Exam confirmation
- Exam Attempts table (with scores)
- Answer Detail + AI Confidence + Override modal
- Student Report viewer
- Class-Level Analytics (weak topics chart)
- Payout Statements list
- Subscription Plan & Usage

### Student Screens

- Student Dashboard (upcoming exams, recent results)
- My Classrooms (enrolled list + enroll via code)
- Classroom detail (materials + exams tabs)
- Exam Taking screen (timer, anti-cheat, autosave)
- Exam Result screen (score, AI report, weak topics)
- AI Report detail

### Shared Screens

- Notification dropdown / page
- Classroom Chat
- Profile settings

---

## ⚙️ Environment Setup

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://api.draya.app/api/v1',
  signalRUrl: 'https://api.draya.app/hubs/notifications',
};
```

**Local development:** `npm start` → `http://localhost:4200`

---

## 🗝️ localStorage Keys

| Key                   | Value                        |
| --------------------- | ---------------------------- |
| `draya_access_token`  | JWT access token             |
| `draya_refresh_token` | Refresh token                |
| `draya_user`          | JSON-stringified user object |
| `draya_lang`          | `ar` or `en`                 |

---

## 🔗 Key Files

| File                                         | Purpose                                                |
| -------------------------------------------- | ------------------------------------------------------ |
| `DESIGN.md`                                  | Brand colors, animations, RTL, layout patterns         |
| `RULES.md`                                   | Engineering rules, forbidden patterns                  |
| `AGENTS.md`                                  | AI agent behavior guide                                |
| `CONTEXT.md`                                 | This file — project context                            |
| `src/app/app.routes.ts`                      | All route definitions                                  |
| `src/app/app.config.ts`                      | App providers (HttpClient, Router, Translate, PrimeNG) |
| `src/styles.scss`                            | Global SCSS + Tailwind imports                         |
| `theme.css`                                  | PrimeNG + Draya CSS custom properties                  |
| `Draya Platform API.postman_collection.json` | Full API collection                                    |
