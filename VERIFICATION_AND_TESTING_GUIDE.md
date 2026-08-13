# دليل التحقق وااختبار شاشات الطالب — درايَة

هذا المستند يوثق الترتيب الدقيق لمنهجية التطبيق والتحقق من الجودة (Standard Quality Verification Workflow) التي تم تنفيذها لبناء واجهات الطالب وفقاً لتصميمات Figma.

---

## 📋 الترتيب المتبع في التطبيق (Implementation & Verification Order)

1. **التحليل وتصميم الهيكلية (Component & Signals Architecture):**
   - إنشاء الموديلات `student-dashboard.model.ts`, `student-courses.model.ts`, `student-exam.model.ts`.
   - إنشاء الخدمات والـ State Management باستخدام Angular Signals (`StudentDashboardService`, `StudentCoursesService`, `StudentExamsService`).
2. **تقسيم الواجهات إلى مكونات صغيرة جداً (Modular Sub-components):**
   - **لوحة التحكم (`/student/dashboard`):** `CourseProgressCardComponent`, `UpcomingExamCardComponent`, `WeaknessTopicCardComponent`.
   - **باقاتي الدراسية (`/student/courses`):** `SubscribedPackageCardComponent`.
   - **الامتحانات والواجبات (`/student/exams`):** `ExamCardComponent`.
3. **فحص التنسيق والـ Linting:**
   ```bash
   npm run lint
   ```
   - **النتيجة:** ✅ `All files pass linting.` (0 أخطاء).
4. **تشغيل اختبارات الوحدة الشاملة (Karma Unit Tests):**
   ```bash
   npx ng test --watch=false
   ```
   - **النتيجة:** ✅ `TOTAL: 81 SUCCESS` (نجاح جميع الاختبارات الـ 81 بالكامل).
5. **البناء الإنتاجي (Production Build):**
   ```bash
   npx ng build
   ```
   - **النتيجة:** ✅ `Application bundle generation complete.` (تم البناء بنجاح وبدون أي أخطاء).

---

## 🔍 دليل الاختبار اليدوي للمستخدم (Manual Testing Checklist)

### 1. شاشة "الامتحانات والواجبات المجدولة" (`/student/exams`):
افتح المتصفح على الرابط [http://localhost:4200/student/exams](http://localhost:4200/student/exams):
- [ ] **الشارة العلوية والعنوان:** شارة `مركز التقويم والاختبارات التفاعلية` باللون الفيروزي وعنوان `الامتحانات والواجبات المجدولة`.
- [ ] **فلاتر التصفية (Filter Pills):** تجربة الفلترة حسب (الكل، متاح للحل الآن، مجدول لاحقاً، مكتمل وحاصل على درجة).
- [ ] **بطاقة امتحان متاح للحل (الجبر والتباديل والتوافيق):**
  - [ ] شارة `الرياضيات` وشارة `متاح للحل الآن 🔥` الصفراء والـ Tint السائل في الزاوية العلوية (`#0EA5E9`).
  - [ ] مدة الامتحان `45 دقيقة` وحالة `جاهز للبدء`.
  - [ ] زر `بدء الامتحان الآن ▶` الداكن الخضر وتفعيل إشعار Toast عند الضغط عليه.
- [ ] **بطاقة امتحان مجدول لاحقاً (قوانين نيوتن والكهربية):**
  - [ ] شارة `الفيزياء` وشارة `مجدول لاحقاً` والـ Tint البنفسجي الزاوي (`#8B5CF6`).
  - [ ] موعد الامتحان `الخميس القادم 11:00 ص` ومدة `60 دقيقة`.
  - [ ] زر `غير متاح بعد` مضلل/معطل ومغلق التفاعل.
- [ ] **بطاقة امتحان مكتمل وحاصل على درجة (الفصل الدراسي الأول التراكمي):**
  - [ ] شارة `الرياضيات` وشارة `مكتمل وحاصل على درجة` الخضراء والـ Tint الأخضر الزاوي (`#10B981`).
  - [ ] عرض الدرجة الحاصل عليها `الدرجة: 85%` ومدة `90 دقيقة`.
  - [ ] زر `عرض تحليل النتيجة والتصحيح ↗` وتفعيل إشعار الـ Toast.

---

### 2. شاشة "باقاتي الدراسية" (`/student/courses`):
افتح المتصفح على الرابط [http://localhost:4200/student/courses](http://localhost:4200/student/courses):
- [ ] مراجعة بطاقة **باقة الجبر وحساب المثلثات** وبطاقة **باقة الكيمياء العضوية المتقدمة**.

---

### 3. شاشة "لوحة تحكم الطالب" (`/student/dashboard`):
افتح الرابط [http://localhost:4200/student/dashboard](http://localhost:4200/student/dashboard):
- [ ] مراجعة بطاقة الترحيب، Streak، أداء المواد، والدروس اليومية.

---

### 4. شاشة "تصفح المعلمين" (`/student/teachers`):
افتح الرابط [http://localhost:4200/student/teachers](http://localhost:4200/student/teachers):
- [ ] مراجعة فلاتر المعلمين والمواد ومجالات التخصص.
