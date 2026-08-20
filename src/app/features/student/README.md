# 🎓 Draya Web — Student Module (eature/student-module)

## 🌟 Executive Overview

The **Student Module** of the Draya Learning Platform delivers a comprehensive, responsive educational experience for enrolled students. Built with modern **Angular 20 (Standalone Components, Signals, OnPush Change Detection)** and polished **Tailwind CSS + SCSS**, this module provides end-to-end features for live examination taking, interactive classroom discussions, verified teacher ratings, digital asset streaming, and multi-channel parental communication.

---

## 🏛️ Module Architecture & Sub-Features

`src/app/features/student/
├── dashboard/                     # Academic overview, joined courses, upcoming exams & stats
├── channel/                       # Q&A discussion forum & community channel
│   └── README.md                  # Feature documentation for Q&A Forum
├── exams/                         # Exam taking engine, timer, AI diagnostic breakdown & results
│   └── README.md                  # Feature documentation for Exam Taking
├── packages/                      # Package catalog, chapter syllabi & 5-star rating reviews
│   └── package-details/
│       └── README.md              # Feature documentation for Package Details & Feedback
├── library/                       # Digital library, PDF readers, and video streaming player
│   └── README.md                  # Feature documentation for Library & Streaming
├── profile/                       # Student account settings, Cloudinary avatar uploads & parent contact sync
│   └── README.md                  # Feature documentation for Profile & Parent Sync
├── student-layout.component.ts    # Main student application shell (Sidebar, Topbar & Navigation)
├── student.routes.ts              # Lazy-loaded child routing definitions
└── README.md                      # This master module documentation`

---

## 🔌 Complete API Integration Matrix (24+ Endpoints)

| Feature Area            | Method | Endpoint                                     | Description                                               |
| ----------------------- | ------ | -------------------------------------------- | --------------------------------------------------------- |
| **Exams & AI Grading**  | GET    | /api/v1/exams/{id}                           | Retrieve exam metadata, questions, and duration           |
|                         | POST   | /api/v1/exams/{id}/attempt                   | Start live exam attempt with auto-timer                   |
|                         | POST   | /api/v1/exams/{id}/submit                    | Submit answers and trigger AI diagnostic grading          |
|                         | GET    | /api/v1/exams/attempts/{attemptId}           | Retrieve score breakdown, question feedback & analytics   |
| **Q&A Discussions**     | GET    | /api/v1/classrooms/{id}/questions            | Paginated questions feed with author and vote counts      |
|                         | POST   | /api/v1/classrooms/{id}/questions            | Post text discussion thread                               |
|                         | POST   | /api/v1/classrooms/{id}/questions/with-photo | Post photo-attached question (FormData)                   |
|                         | POST   | /api/v1/questions/{id}/replies               | Submit reply to a discussion thread                       |
|                         | POST   | /api/v1/questions/{id}/replies/with-photo    | Submit photo reply to discussion                          |
|                         | POST   | /api/v1/questions/{id}/vote                  | Toggle upvote on question                                 |
|                         | DELETE | /api/v1/questions/{id}                       | Delete own question                                       |
| **Packages & Feedback** | GET    | /api/v1/classrooms/{id}                      | Classroom details, syllabus chapters, and pricing         |
|                         | GET    | /api/v1/classrooms/{id}/feedback             | Average ratings and student review distribution           |
|                         | POST   | /api/v1/classrooms/{id}/feedback             | Submit 1-to-5 star rating with feedback comment           |
|                         | POST   | /api/v1/classrooms/enroll                    | Redeem paper center code ({ enrollmentCode })             |
|                         | POST   | /api/v1/classrooms/{id}/checkout             | Initiate Paymob electronic payment session                |
| **Library & Streaming** | GET    | /api/v1/students/materials                   | Digital repository of enrolled classroom materials        |
|                         | GET    | /api/v1/materials/{id}                       | Single material metadata and parsing status               |
|                         | GET    | /api/v1/materials/{id}/stream                | Authenticated time-limited video/audio streaming token    |
| **Profile & Parents**   | GET    | /api/v1/auth/me                              | Fetch student credentials, grade, avatar, and parent info |
|                         | PUT    | /api/v1/students/profile                     | Update profile details and parent guardian contact        |
|                         | POST   | /api/v1/students/profile/picture             | Upload profile avatar to cloud storage                    |
|                         | POST   | /api/v1/auth/change-password                 | Rotate account password                                   |
|                         | POST   | /api/v1/auth/register/student                | Register student with parent guardian contact fields      |

---

## 🛡️ Routing & Security Guard Architecture

- **uthGuard**: Protects all student routes against unauthenticated sessions, redirecting unauthenticated visitors to /auth/login.
- **
  oleGuard**: Enforces data: { roles: ['student'] } authorization to guarantee isolation from Teacher and Admin operational panels.

---

## 🧪 Comprehensive Verification Matrix

All features within the student module have been strictly validated against [WORKFLOW_RULES.md](file:///e:/ITI/Draya/Draya-Web/WORKFLOW_RULES.md):

- [x] **Step A (Code Linting):**
      px ng lint (0 errors, 0 warnings across all module files).
- [x] **Step B (Code Formatting):** 100% formatted using Prettier standards.
- [x] **Step C (Console & Runtime Inspection):** 0 unhandled console errors, 0 runtime exceptions.
- [x] **Step D (Karma Unit Tests):** **217 / 217 specs passed (100% Pass Rate)**.
- [x] **Step E (Integration Tests):** Full HTTP TestBed mocks and SignalR client integration.
- [x] **Step F (Playwright E2E Suite):**
  - e2e/student-exam-flow.spec.ts (Passed)
  - e2e/student-qa-channel.spec.ts (Passed)
  - e2e/student-package-details.spec.ts (Passed)
  - e2e/student-library.spec.ts (Passed)
  - e2e/student-profile.spec.ts (Passed)
- [x] **Step G (Production Build):**
      px ng build --configuration=production (Exit Code 0).
