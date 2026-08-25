# 📌 سجل متابعة تكامل الـ APIs والـ Mock Fallbacks في مشروع درايَة (Draya Web)

> **الغرض:** هذا الملف مرجع دائم وشامل لتتبع حالة كل شاشة في التطبيق، وما هو موصول بالـ Real API، وما يعمل بـ Fallback ذكي، وما يحتاج إلى Endpoints جديدة من فريق الـ Backend.

---

## 🟢 1. شاشات وميزات موصولة 100% بالـ Real API

| الميزة / الصفحة                                       | الـ Endpoint في الـ Backend                                                                                                                                            | الحالة                             | ملاحظات                                                                                                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **تسجيل الدخول**                                      | `POST /api/v1/auth/login`                                                                                                                                              | ✅ شغال                            | استخراج JWT وتخزين الـ tokens                                                                                                                        |
| **تسجيل حساب طالب**                                   | `POST /api/v1/auth/register/student`                                                                                                                                   | ✅ شغال                            | إنشاء حساب طالب جديد (تصحيح: المسار slash وليس hyphen)                                                                                               |
| **تسجيل حساب معلم**                                   | `POST /api/v1/auth/register/teacher`                                                                                                                                   | ✅ شغال                            | تسجيل معلم جديد مع التخصص (تصحيح: المسار slash وليس hyphen)                                                                                          |
| **جلب بيانات المستخدم الحالي**                        | `GET /api/v1/auth/me`                                                                                                                                                  | ✅ شغال                            | يُستخدم في الهيدر والبروفايل                                                                                                                         |
| **تحديث الملف الشخصي للطالب**                         | `PUT /api/v1/students/profile`                                                                                                                                         | ✅ شغال                            | يحدث (`fullName`, `parentGuardianEmail`, `dateOfBirth`)                                                                                              |
| **دفع واشتراك الباقات عبر Paymob**                    | `POST /api/v1/classrooms/{id}/checkout`                                                                                                                                | ✅ شغال                            | يُرجع `checkoutUrl` ويُحول مباشرة لبوابة Paymob                                                                                                      |
| **تفعيل الباقة بكود السنتر**                          | `POST /api/v1/classrooms/enroll`                                                                                                                                       | ✅ شغال                            | يستقبل `{ enrollmentCode }` لتفعيل الكلاس                                                                                                            |
| **قناة الأسئلة والنقاش (Q&A Channel)**                | `GET/POST /api/v1/classrooms/{id}/questions`<br>`GET/POST /api/v1/classrooms/{id}/questions/{id}/replies`<br>`POST/DELETE /api/v1/classrooms/{id}/questions/{id}/vote` | ✅ شغال بالكامل + SignalR Live Hub | شاشة متكاملة مع الـ REST APIs و SignalR Hub على `/hubs/qa` لتلقي الأسئلة والردود والتصويتات الحية                                                    |
| **قائمة امتحانات الطالب (`/student/exams`)**          | `GET /api/v1/students/exams`                                                                                                                                           | ✅ شغال                            | يُرجع `attempts[]` لكل امتحان؛ الحالة (`available`/`scheduled`/`in-progress`/`pending-grading`/`completed`/`expired`) تُشتق من `attemptStatus` أولاً |
| **محرك أداء الامتحان (`/student/exams/:id/take`)**    | `POST /api/v1/attempts/start`<br>`POST /api/v1/attempts/{attemptId}/submit`<br>`POST /api/v1/attempts/{attemptId}/grade`<br>`GET /api/v1/attempts/jobs/{jobId}`        | ✅ شغال                            | لا يوجد أي تصحيح أو محاكاة على المتصفح — كل الدرجات تأتي من الـ backend فقط                                                                          |
| **تقرير تحليل النتيجة (`/student/exams/:id/result`)** | `GET /api/v1/attempts/{attemptId}/results`<br>`GET /api/v1/exams/{examId}/student-view`                                                                                | ✅ شغال                            | لا يعتمد على أي مفتاح إجابة يُرسَل للطالب مسبقاً                                                                                                     |

---

## 🟡 2. شاشات موصولة بالـ Real API + Fallback ذكي (عند فراغ قاعدة البيانات)

| الصفحة / الميزة                                      | الـ Endpoint الأساسي                                                     | سلوك الـ Fallback الذكي                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **دليل المعلمين (`/student/teachers`)**              | `GET /api/v1/teachers`                                                   | إذا كان السيرفر لا يحتوي على معلمين، يعرض معلمين متميزين في (الرياضيات، الفيزياء، الكيمياء، الأحياء).                 |
| **بروفايل المعلم وباقاته (`/student/teachers/:id`)** | `GET /api/v1/teachers/{id}`<br>`GET /api/v1/teachers/{id}/classrooms`    | إذا لم ينشئ المعلم باقات في الـ DB، يتم توليد باقات خاصة بمادته وتخصصه تلقائياً.                                      |
| **تفاصيل الباقة والمحتوى (`/student/packages/:id`)** | `GET /api/v1/classrooms/{id}`<br>`GET /api/v1/classrooms/{id}/materials` | إذا كان الكلاس بدون محاضرات، يولد فهرس فصول ومحاضرات ومذكرات توضيحية.                                                 |
| **باقاتي المسجل بها (`/student/courses`)**           | `GET /api/v1/classrooms`                                                 | إذا كان الطالب جديداً ولم يشترك في أي باقة بعد، يعرض كارت تجريبي للباقة مع نسبة التقدم.                               |
| **لوحة تحكم الطالب (`/student/dashboard`)**          | `GET /api/v1/dashboard/student`                                          | السيرفر الحي يُرجع `404` (الـ Endpoint لم ينشر بعد في Swagger)، لذلك يعمل بـ Fallback منظم بدون أي أحداث أخطاء حمراء. |

---

## 🔴 3. ميزات Hardcoded / Simulated (تحتاج إنشاء Endpoints في الـ Backend)

> ⚠️ **تنبيه:** بمجرد أن يضيف فريق الـ Backend هذه الـ Endpoints في Swagger، سيتم استبدال الـ Mock بها فوراً:

### 1. الامتحانات والاختبارات التفاعلية:

> ✅ **تم النقل إلى القسم الأول (🟢) بالكامل** — دورة حياة الامتحان (بدء/استكمال/تسليم/تصحيح/نتيجة/إعادة محاولة) موصولة بالكامل بالـ Real API اعتباراً من فرع `feat/exam-lifecycle`. نقاط الضعف (`weaknessTopics`) في تقرير النتيجة لم تعد تُولَّد محلياً من الإجابات الخاطئة — تنتظر تكامل `GET /Weaknesses/active` (انظر قسم التتبع الديناميكي لنقاط الضعف أدناه).

### 2. سجل الدرجات والتقارير الأكاديمية (`/student/reports`):

> ✅ **تم النقل إلى القسم الأول (🟢) بالكامل** اعتباراً من فرع `feat/student-weakness-reports`. المؤشرات والرسوم البيانية من `GET /students/{id}/analytics` و `GET /students/{id}/performance-reports/latest`. نقاط الضعف (Active/Resolved) موصولة الآن بـ `GET /Weaknesses/active` و `GET /Weaknesses/resolved` عبر `StudentWeaknessService` بدلاً من استخراجها من `weakTopics[]` في الـ analytics. **ملاحظة:** استجابة هاتين النقطتين غير موثقة في Swagger (200 OK بدون schema) — يتم التعامل معها بشكل متسامح، وسجل تطور نقاط الضعف (`StudentWeaknessHistory`) غير متاح عبر أي endpoint حالياً (انظر `BACKEND_ISSUES_REPORT.md`).

### 3. المكتبة الرقمية وعارض المذكرات (`/student/library`):

- **الحالة الحالية:** عارض PDF ومذكرات في `StudentLibraryService`.
- **المطلوب من الـ Backend:** `GET /api/v1/students/library` أو `GET /api/v1/materials?type=book`.

### 4. حساب الطالب والأمان:

- **تغيير كلمة المرور من داخل البروفايل:**
  - **المطلوب من الـ Backend:** `POST /api/v1/auth/change-password` (يقبل `currentPassword` و `newPassword`).
- **رفع الصورة الشخصية للطالب:**
  - **المطلوب من الـ Backend:** `POST /api/v1/students/avatar` (يقبل ملف صورة `multipart/form-data`).
