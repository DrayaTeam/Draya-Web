# دليل التحقق وااختبار شاشات الطالب — درايَة

هذا المستند يوثق الترتيب الدقيق لمنهجية التطبيق والتحقق من الجودة (Standard Quality Verification Workflow) التي تم تنفيذها لبناء واجهات الطالب وفقاً لتصميمات Figma.

---

## 📋 الترتيب المتبع في التطبيق (Implementation & Verification Order)

1. **التحليل وتصميم الهيكلية (Component & Signals Architecture):**
   - إنشاء الموديلات `student-dashboard.model.ts`, `student-courses.model.ts`, `student-exam.model.ts`, `student-reports.model.ts`, `student-library.model.ts`, `student-exam-taking.model.ts`.
   - إنشاء الخدمات والـ State Management باستخدام Angular Signals (`StudentDashboardService`, `StudentCoursesService`, `StudentExamsService`, `StudentReportsService`, `StudentLibraryService`, `StudentExamTakingService`).
2. **تقسيم الواجهات إلى مكونات صغيرة جداً (Modular Sub-components):**
   - **لوحة التحكم (`/student/dashboard`):** `CourseProgressCardComponent`, `UpcomingExamCardComponent`, `WeaknessTopicCardComponent`.
   - **باقاتي الدراسية (`/student/courses`):** `SubscribedPackageCardComponent`.
   - **الامتحانات والواجبات (`/student/exams`):** `ExamCardComponent`.
   - **أداء الامتحان النشط (`/student/exams/take`):** `ExamQuestionCardComponent`, `ExamQuestionMapComponent`, `ExamSecurityWarningComponent`.
   - **نتيجة الامتحان والتحليل (`/student/exams/:id/result`):** `ExamResultCardComponent`, `ExamQuestionReviewCardComponent`.
   - **تقاريري ودرجاتي (`/student/reports`):** `ReportKpiCardComponent`, `ReportWeaknessTopicComponent`.
   - **المكتبة الرقمية (`/student/library`):** `BookCardComponent`.
3. **فحص التنسيق والـ Linting:**
   ```bash
   npm run lint
   ```
   - **النتيجة:** ✅ `All files pass linting.` (0 أخطاء).
4. **تشغيل اختبارات الوحدة الشاملة (Karma Unit Tests):**
   ```bash
   npx ng test --watch=false
   ```
   - **النتيجة:** ✅ `TOTAL: 130 SUCCESS` (نجاح جميع الاختبارات الـ 130 بالكامل).
5. **البناء الإنتاجي (Production Build):**
   ```bash
   npx ng build
   ```
   - **النتيجة:** ✅ `Application bundle generation complete.` (تم البناء بنجاح وبدون أي أخطاء).

---

## 🔍 دليل الاختبار اليدوي للمستخدم (Manual Testing Checklist)

### 1. شاشة "أداء الامتحان النشط" (`/student/exams/take`):
افتح الرابط [http://localhost:4200/student/exams/take](http://localhost:4200/student/exams/take) أو اضغط على **"بدء الامتحان"** من قائمة الامتحانات:
- [ ] **البار العلوي للاختبار:**
  - [ ] عنوان الامتحان `امتحان الجبر والتباديل والتوافيق — 2026` والمستوى.
  - [ ] العداد التنازلي المتبقي (`الوقت المتبقي: 44:59`).
- [ ] **بطاقة السؤال النشط (يمين Screen):**
  - [ ] عنوان السؤال وشارة المادة `الجبر`.
  - [ ] خيارات الإجابة التفاعلية (MCQ) مع تحديد الخيار المحدد.
  - [ ] زر `تعليم السؤال` للمراجعة وتغير لونه إلى الأصفر.
  - [ ] الأزرار السفلية: `السؤال السابق` و `السؤال التالي` أو `إنهاء وتسليم الامتحان`.
- [ ] **خريطة الأسئلة (يسار Screen):**
  - [ ] أزرار الأرقام (1, 2, 3...) مع التأثيرات البصرية للـ Current (داكن + هالة)، Answered (أخضر)، Flagged (أصفر).
  - [ ] شريط التوضيح (Legend) في الأسفل.
- [ ] **كارت المراقبة الأمنية:**
  - [ ] كارت أمني أحمر يحذر من مغادرة التبويب.

---

### 2. شاشة "نتيجة الامتحان والتحليل بالـ AI" (`/student/exams/exam-1/result`):
افتح الرابط [http://localhost:4200/student/exams/exam-1/result](http://localhost:4200/student/exams/exam-1/result) أو اضغط **"إنهاء وتسليم الامتحان"**:
- [ ] **بطاقة النتيجة التقديرية:** النسبة التقديرية الكبيرة وشارة التقدير وتاريخ التسليم.
- [ ] **بطاقة تحليل الذكاء الاصطناعي:** مهارات التباديل والتوافيق مع دقة الحل ورابط المحاضرة التأسيسية.
- [ ] **مراجعة الأسئلة والإجابات التفصيلية:**
  - [ ] السؤال 1: الإجابة الخاطئة، مربع إجابتك باللون الأحمر، ومربع الإجابة الصحيحة باللون الأخضر.
  - [ ] السؤال 2 و 3: الإجابات الصحيحة باللون الأخضر.

---

### 3. شاشة "المكتبة الرقمية" (`/student/library`):
افتح الرابط [http://localhost:4200/student/library](http://localhost:4200/student/library):
- [ ] مراجعة البحث التفاعلي وتصفية الكتب وجميع كروت الكتب الـ 4.
