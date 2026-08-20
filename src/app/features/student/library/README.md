# 📚 Student Library & Authenticated Media Streaming (eat/student-library-streaming)

## 📌 Overview

The **Student Library & Authenticated Media Streaming** engine provides enrolled students with a unified digital archive of all course resources, lecture videos, revision PDF booklets, presentations, and interactive worksheets across all joined classrooms.

---

## 🔌 API Integration & Endpoints

| Method | Endpoint                                         | Description                                                   |
| ------ | ------------------------------------------------ | ------------------------------------------------------------- |
| GET    | /api/v1/students/materials?page={p}&pageSize={s} | Paginated enrolled materials across all student classrooms    |
| GET    | /api/v1/materials/{materialId}                   | Single material metadata, versions, and parsing status        |
| GET    | /api/v1/materials/{materialId}/stream            | Authenticated, time-limited video/audio streaming token & URL |
| GET    | /api/v1/classrooms/{classroomId}/materials       | Classroom-scoped materials archive                            |

---

## 🏗️ Architecture & Component Structure

`src/app/features/student/library/
├── student-library.component.ts      # Main controller with filtering, search query signals, modals
├── student-library.component.html    # RTL Arabic template with category chips & responsive grid
├── student-library.component.scss    # Custom styling, dark mode accents & clean card transitions
├── student-library.component.spec.ts # Component unit tests
├── components/book-card/             # Reusable card component for books & videos
└── README.md                         # This feature documentation`

### Key State Signals:

- **searchQuery**: Instant client-side search query bound to title and subject name.
- **selectedFilter**: Active category filter ('ALL' | 'Video' | 'PDF' | 'DOCX' | 'PPTX' | 'Image' | 'Document').
- **ooks & ilteredBooks**: Reactive list computed from loaded materials.
- **ctiveVideoBook & ctiveVideoStreamUrl**: Live streaming state for in-browser video player.
- **ctivePreviewBook**: Active PDF/document modal for instant in-browser reading.

---

## 🎨 UI/UX Features

- **Instant Category Filtering:** Tab chips with count badges for quick jumping between videos, PDFs, Word docs, and slides.
- **In-App Media Player:** Custom streaming modal supporting HTML5 video with decode error handling and fallback links.
- **In-App Document Reader:** Safe iframe PDF preview and Google Docs viewer integration for Office formats.
- **Direct Download Manager:** Browser download triggers with toast notifications.

---

## 🧪 Verification Matrix

- [x] **Step A (ESLint):**
      px ng lint (0 errors, 0 warnings).
- [x] **Step B (Prettier):** 100% formatted.
- [x] **Step C (Console Audit):** 0 unhandled console errors, 0 runtime exceptions.
- [x] **Step D (Unit Testing):** 204/204 Karma specs passed (100%).
- [x] **Step E (Integration Testing):** student-library.service.spec.ts HTTP mock passed.
- [x] **Step F (Playwright E2E):** e2e/student-library.spec.ts (3/3 passed).
- [x] **Step G (Production Build):**
      px ng build --configuration=production (Exit code 0).
