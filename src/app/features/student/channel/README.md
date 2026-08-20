# 💬 Student Classroom Q&A Forum & Discussions Engine (eat/student-qa-channel)

## 📌 Overview
The **Classroom Q&A Forum** is an interactive discussion space for enrolled students to ask academic questions, attach photos of complex formulas or textbook exercises, upvote peer contributions, and receive certified answers from teachers and assistants.

---

## 🔌 API Integration & Endpoints
Integrated with Swagger endpoints under ClassroomQuestions:

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/classrooms/{classroomId}/questions | Paginated questions feed with sorting and filtering |
| POST | /api/v1/classrooms/{classroomId}/questions | Submit a text-only question |
| POST | /api/v1/classrooms/{classroomId}/questions/with-photo | Submit question with photo attachment (multipart/form-data) |
| GET | /api/v1/classrooms/{classroomId}/questions/{questionId} | Detailed question thread with all chronological replies |
| POST | /api/v1/classrooms/{classroomId}/questions/{questionId}/replies | Add a text reply to a question |
| POST | /api/v1/classrooms/{classroomId}/questions/{questionId}/replies/with-photo | Add a reply with photo/diagram attachment |
| POST | /api/v1/classrooms/{classroomId}/questions/{questionId}/vote | Upvote a question |
| DELETE | /api/v1/classrooms/{classroomId}/questions/{questionId}/vote | Remove upvote |
| PUT | /api/v1/classrooms/{classroomId}/questions/{questionId} | Edit question content (author only) |
| DELETE | /api/v1/classrooms/{classroomId}/questions/{questionId} | Delete question (author only) |
| PUT | /api/v1/classrooms/{classroomId}/questions/{questionId}/replies/{replyId} | Edit reply content (author only) |
| DELETE | /api/v1/classroomId}/questions/{questionId}/replies/{replyId} | Delete reply (author only) |

---

## 🏗️ Architecture & Component Hierarchy

`
src/app/features/student/channel/
├── student-channel.component.ts      # Standalone controller managing signals, modals & real-time sync
├── student-channel.component.html    # Arabic RTL template with animated cards, pills & discussion thread
├── student-channel.component.scss    # Responsive styles with glassmorphism, badges & zoom lightbox
├── student-channel.component.spec.ts # Unit & integration specs (TestBed)
└── README.md                         # This feature documentation
`

### Key Services & State Management:
- **StudentQaChannelService** (src/app/core/services/student-qa-channel.service.ts):
  - Reactive Signals: questions(), ilteredQuestions(), ctiveQuestion(), ctiveReplies(), loading(), sendingQuestion(), sendingReply().
  - SignalR Hub integration (/hubs/qa) with event listeners (QuestionCreated, QuestionReplied, QuestionVoteUpdated).
  - Optimistic UI updates for voting and question editing with rollback safety.

---

## 🎨 UI/UX Features
- **Classroom Selector Bar:** Horizontal pill tabs allowing quick switching between enrolled classrooms.
- **Controls & Search:** Instant search filter across questions + filter chips (All, Answered 🌟, Unanswered, My Questions) + sort options (Recent, Most Voted, Most Discussed, Trending).
- **Photo Attachments:** Supports image attachments with live thumbnail preview and lightbox modal.
- **Role Badges:** Distinguishes between student authors, teaching assistants, and official teacher responses (⭐ إجابة المعلم).

---

## 🧪 Verification Matrix
- [x] **Step A (ESLint):** 
px ng lint (0 errors, 0 warnings).
- [x] **Step B (Prettier):** 100% formatted.
- [x] **Step C (Console Audit):** 0 unhandled console errors, 0 runtime exceptions.
- [x] **Step D (Unit Testing):** 204/204 Karma specs passed (100%).
- [x] **Step E (Integration Testing):** Verified via TestBed & provideHttpClientTesting().
- [x] **Step F (Playwright E2E):** e2e/student-qa-channel.spec.ts (3/3 passed).
- [x] **Step G (Production Build):** 
px ng build --configuration=production (Exit code 0).
