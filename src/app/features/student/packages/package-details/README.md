# ⭐ Classroom Package Details & Feedback / Rating Engine (eat/student-package-details-feedback)

## 📌 Overview
The **Classroom Package Details & Feedback Engine** delivers an end-to-end curriculum viewer and verified student review platform. Enrolled students can preview and stream secured course materials or submit 1-to-5 star ratings with testimonials, while prospective students can activate paper center codes or trigger direct electronic checkout.

---

## 🔌 API Integration & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/classrooms/{classroomId} | Detailed classroom metadata, subject, teacher, and pricing |
| GET | /api/v1/classrooms/{classroomId}/materials | Classroom lectures, PDF handouts, and revision quizzes |
| GET | /api/v1/classrooms/{classroomId}/sections | Curriculum chapter segmentation and module headers |
| GET | /api/v1/classrooms/{classroomId}/feedback | Average rating, total reviews count, and paginated student reviews |
| POST | /api/v1/classrooms/{classroomId}/feedback | Submit student rating (1-5) and written review (SubmitClassroomFeedbackRequest) |
| POST | /api/v1/classrooms/enroll | Redeem paper center code ({ enrollmentCode }) |
| POST | /api/v1/classrooms/{classroomId}/checkout | Initiate Paymob electronic payment session |

---

## 🏗️ Architecture & Component Hierarchy

`
src/app/features/student/packages/package-details/
├── package-details.component.ts      # Standalone controller managing tab state, feedback, and modals
├── package-details.component.html    # RTL Arabic template with tabs, hero pricing, and review cards
├── package-details.component.scss    # Polished responsive styles, star pickers & rating progress bars
├── package-details.component.spec.ts # Unit & integration specs (TestBed)
└── README.md                         # This feature documentation
`

### Key State Signals:
- **ctiveTab**: Toggles between curriculum (syllabus accordion) and eedback (ratings and reviews feed).
- **eedbackSummary**: Stores verageRating (e.g. 4.9), 	otalCount, and breakdown distributions.
- **eedbackItems**: Reactive list of student review items (ClassroomFeedbackItemDto[]).
- **selectedRating & hoverRating**: Star rating picker signals (1 to 5 stars).
- **isEnrolled**: Reactive enrollment status enabling media streaming and unlocking the review submission box.

---

## 🎨 UI/UX Features
- **Hero Card & Pricing:** Displays teacher credentials, classroom pricing, and instant enrollment status.
- **Tab Navigation Bar:** Seamless pill tabs switching between the chapter syllabus and verified reviews.
- **Interactive Star Rating Picker:** Hover-reactive golden stars with live rating status feedback (ممتاز جداً 🌟, جيد جداً 👍).
- **Rating Summary & Progress Distribution:** Overall score badge alongside 5-star, 4-star, and 3-star percentage tracks.
- **Enrolled Protection & Lock Modal:** Modal explaining locked materials for unregistered guests with direct checkout action.

---

## 🧪 Verification Matrix
- [x] **Step A (ESLint):** 
px ng lint (0 errors, 0 warnings).
- [x] **Step B (Prettier):** 100% formatted.
- [x] **Step C (Console Audit):** 0 unhandled console errors, 0 runtime exceptions.
- [x] **Step D (Unit Testing):** 209/209 Karma specs passed (100%).
- [x] **Step E (Integration Testing):** Verified via TestBed & provideHttpClientTesting().
- [x] **Step F (Playwright E2E):** e2e/student-package-details.spec.ts (2/2 passed).
- [x] **Step G (Production Build):** 
px ng build --configuration=production (Exit code 0).
