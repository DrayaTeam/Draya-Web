# 📌 سجل متابعة تكامل الـ APIs والـ Mock Fallbacks في مشروع درايَة (Draya Web)

> **الغرض:** هذا الملف مرجع دائم وشامل لتتبع حالة كل شاشة في التطبيق، وما هو موصول بالـ Real API، وما يعمل بـ Fallback ذكي، وما يحتاج إلى Endpoints جديدة من فريق الـ Backend.

---

## 🟢 1. شاشات وميزات موصولة 100% بالـ Real API

| الميزة / الصفحة | الـ Endpoint في الـ Backend | الحالة | ملاحظات |
|---|---|---|---|
| **تسجيل الدخول** | `POST /api/v1/auth/login` | ✅ شغال | استخراج JWT وتخزين الـ tokens |
| **تسجيل حساب طالب** | `POST /api/v1/auth/register-student` | ✅ شغال | إنشاء حساب طالب جديد |
| **تسجيل حساب معلم** | `POST /api/v1/auth/register-teacher` | ✅ شغال | تسجيل معلم جديد مع التخصص |
| **جلب بيانات المستخدم الحالي** | `GET /api/v1/auth/me` | ✅ شغال | يُستخدم في الهيدر والبروفايل |
| **تحديث الملف الشخصي للطالب** | `PUT /api/v1/students/profile` | ✅ شغال | يحدث (`fullName`, `parentGuardianEmail`, `dateOfBirth`) |
| **دفع واشتراك الباقات عبر Paymob** | `POST /api/v1/classrooms/{id}/checkout` | ✅ شغال | يُرجع `checkoutUrl` ويُحول مباشرة لبوابة Paymob |
| **تفعيل الباقة بكود السنتر** | `POST /api/v1/classrooms/enroll` | ✅ شغال | يستقبل `{ enrollmentCode }` لتفعيل الكلاس |
| **قناة الأسئلة والنقاش (Q&A Channel)** | `GET/POST /api/v1/classrooms/{id}/questions`<br>`GET/POST /api/v1/classrooms/{id}/questions/{id}/replies`<br>`POST/DELETE /api/v1/classrooms/{id}/questions/{id}/vote` | ✅ شغال بالكامل + SignalR Live Hub | شاشة متكاملة مع الـ REST APIs و SignalR Hub على `/hubs/qa` لتلقي الأسئلة والردود والتصويتات الحية |

---

## 🟡 2. شاشات موصولة بالـ Real API + Fallback ذكي (عند فراغ قاعدة البيانات)

| الصفحة / الميزة | الـ Endpoint الأساسي | سلوك الـ Fallback الذكي |
|---|---|---|
| **دليل المعلمين (`/student/teachers`)** | `GET /api/v1/teachers` | إذا كان السيرفر لا يحتوي على معلمين، يعرض معلمين متميزين في (الرياضيات، الفيزياء، الكيمياء، الأحياء). |
| **بروفايل المعلم وباقاته (`/student/teachers/:id`)** | `GET /api/v1/teachers/{id}`<br>`GET /api/v1/teachers/{id}/classrooms` | إذا لم ينشئ المعلم باقات في الـ DB، يتم توليد باقات خاصة بمادته وتخصصه تلقائياً. |
| **تفاصيل الباقة والمحتوى (`/student/packages/:id`)** | `GET /api/v1/classrooms/{id}`<br>`GET /api/v1/classrooms/{id}/materials` | إذا كان الكلاس بدون محاضرات، يولد فهرس فصول ومحاضرات ومذكرات توضيحية. |
| **باقاتي المسجل بها (`/student/courses`)** | `GET /api/v1/classrooms` | إذا كان الطالب جديداً ولم يشترك في أي باقة بعد، يعرض كارت تجريبي للباقة مع نسبة التقدم. |
| **لوحة تحكم الطالب (`/student/dashboard`)** | `GET /api/v1/dashboard/student` | السيرفر الحي يُرجع `404` (الـ Endpoint لم ينشر بعد في Swagger)، لذلك يعمل بـ Fallback منظم بدون أي أحداث أخطاء حمراء. |

---

## 🔴 3. ميزات Hardcoded / Simulated (تحتاج إنشاء Endpoints في الـ Backend)

> ⚠️ **تنبيه:** بمجرد أن يضيف فريق الـ Backend هذه الـ Endpoints في Swagger، سيتم استبدال الـ Mock بها فوراً:

### 1. الامتحانات والاختبارات التفاعلية:
* **قائمة امتحانات الطالب (`/student/exams`):**
  - **الحالة الحالية:** قائمة تجريبية في `StudentExamsService`.
  - **المطلوب من الـ Backend:** `GET /api/v1/students/exams` أو `GET /api/v1/exams/my-assigned-exams`.
* **محرك أداء الامتحان (`/student/exams/:id/take`):**
  - **الحالة الحالية:** محرك تفاعلي كامل بالمتصفح (Timer + Anti-cheating Tab Switcher + Dynamic Grading).
  - **المطلوب من الـ Backend:**
    - `POST /api/v1/exams/{id}/attempts/start` (لبدء محاولة حقيقية وتوليد `attemptId`).
    - `POST /api/v1/attempts/{attemptId}/answers` (للحفظ التلقائي لكل إجابة).
    - `POST /api/v1/attempts/{attemptId}/submit` (لتسليم المحاولة وحفظ الدرجة في الـ DB).
* **تقرير تحليل النتيجة بالذكاء الاصطناعي (`/student/exams/:id/result`):**
  - **الحالة الحالية:** تقرير يحلل إجابات الطالب الحقيقية ويستخرج نقاط القوة والضعف محلياً.
  - **المطلوب من الـ Backend:** `GET /api/v1/attempts/{attemptId}/results`.

### 2. سجل الدرجات والتقارير الأكاديمية (`/student/reports`):
* **الحالة الحالية:** رسوم بيانية ومؤشرات أداء في `StudentReportsService`.
* **المطلوب من الـ Backend:** `GET /api/v1/students/reports/summary` (المتوسط، منحنى التطور، خريطة المهارات).

### 3. المكتبة الرقمية وعارض المذكرات (`/student/library`):
* **الحالة الحالية:** عارض PDF ومذكرات في `StudentLibraryService`.
* **المطلوب من الـ Backend:** `GET /api/v1/students/library` أو `GET /api/v1/materials?type=book`.

### 4. حساب الطالب والأمان:
* **تغيير كلمة المرور من داخل البروفايل:**
  - **المطلوب من الـ Backend:** `POST /api/v1/auth/change-password` (يقبل `currentPassword` و `newPassword`).
* **رفع الصورة الشخصية للطالب:**
  - **المطلوب من الـ Backend:** `POST /api/v1/students/avatar` (يقبل ملف صورة `multipart/form-data`).
