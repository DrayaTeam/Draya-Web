# دليل التحقق واختبار شاشات الطالب — درايَة

هذا المستند يوثق الترتيب الدقيق لمنهجية التطبيق والتحقق من الجودة (Standard Quality Verification Workflow) التي تم تنفيذها لبناء واجهات الطالب وفقاً لتصميمات Figma، بالإضافة إلى رابط الاستضافة على Vercel.

---

## 🌐 رابط الاستضافة الحية على Vercel (Production Live Deployment)

- 🔗 **رابط الإنتاج المباشر:** [https://draya-lms.vercel.app](https://draya-lms.vercel.app)
- 📊 **رابط لوحة الفحص (Inspect):** [https://vercel.com/mahmoud1-2mostafas-projects/draya-lms](https://vercel.com/mahmoud1-2mostafas-projects/draya-lms)

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
6. **الرفع والدمج في Git والنشر على Vercel:**
   ```bash
   git add .
   git commit -m "feat(student): implement full student portal screens suite"
   git push origin feature/student
   git checkout develop && git merge feature/student && git push origin develop
   npx vercel --prod --yes
   ```
   - **النتيجة:** ✅ `Deployed to production: https://draya-web-pink.vercel.app`

---

## 🔍 دليل الاختبار اليدوي للمستخدم (Manual Testing Checklist)

### 1. شاشة "أداء الامتحان النشط" (`/student/exams/take`):
افتح الرابط [https://draya-web-pink.vercel.app/student/exams/take](https://draya-web-pink.vercel.app/student/exams/take):
- [ ] **البار العلوي للاختبار:** عنوان الامتحان والعداد التنازلي المتبقي.
- [ ] **بطاقة السؤال النشط:** خيارات الإجابة التفاعلية (MCQ)، زر `تعليم السؤال` للمراجعة، وأزرار التنقل.
- [ ] **خريطة الأسئلة:** أزرار الأرقام (1, 2, 3...) والتأثيرات البصرية.
- [ ] **كارت المراقبة الأمنية:** كارت أمني يحذر من مغادرة التبويب.

---

### 2. شاشة "نتيجة الامتحان والتحليل بالـ AI" (`/student/exams/exam-1/result`):
افتح الرابط [https://draya-web-pink.vercel.app/student/exams/exam-1/result](https://draya-web-pink.vercel.app/student/exams/exam-1/result):
- [ ] **بطاقة النتيجة التقديرية:** النسبة التقديرية الكبيرة وشارة التقدير.
- [ ] **بطاقة تحليل الذكاء الاصطناعي:** مهارات التباديل والتوافيق ودقة الحل ورابط المحاضرة التأسيسية.
- [ ] **مراجعة الأسئلة والإجابات التفصيلية:** كروت مراجعة الأسئلة الصحيحة والخاطئة.

---

### 3. شاشة "المكتبة الرقمية" (`/student/library`):
افتح الرابط [https://draya-web-pink.vercel.app/student/library](https://draya-web-pink.vercel.app/student/library):
- [ ] مراجعة البحث التفاعلي وتصفية الكتب وجميع كروت الكتب الـ 4.
