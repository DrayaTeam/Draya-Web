# 👤 Student Profile, Security & Parent Integration (eat/student-profile-security)

## 📌 Overview
The **Student Profile Management & Security** suite provides complete account customization, cloud avatar image uploads via Cloudinary, secure password rotation, and unified parent/guardian contact synchronization (parentGuardianName, parentGuardianPhone, parentGuardianEmail).

---

## 🔌 API Integration & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/auth/me | Fetch authenticated student profile, academic grade, avatar, and parent info |
| PUT | /api/v1/students/profile | Update student profile metadata, date of birth, and parent guardian details |
| POST | /api/v1/students/profile/picture | Upload profile avatar to cloud storage (FormData) |
| POST | /api/v1/auth/change-password | Rotate account password with validation and authorization verification |
| POST | /api/v1/auth/register/student | Register student account with parent guardian name, phone, and email |

---

## 🏗️ Architecture & Component Hierarchy

`
src/app/features/student/profile/
├── student-profile.component.ts      # Standalone controller managing tab state, avatar uploads, password
├── student-profile.component.html    # RTL Arabic responsive template with 3 distinct setting tabs
├── student-profile.component.scss    # Custom styling, dark mode accents & responsive grid
├── student-profile.component.spec.ts # Component unit tests
└── README.md                         # This feature documentation
`

### Key Form & Tab Structure:
1. **البيانات الشخصية (Personal Info):** Name, Email, Phone, Grade level, and Date of Birth.
2. **ولي الأمر (Parent / Guardian Info):** Parent full name (parentGuardianName), WhatsApp phone (parentGuardianPhone), and Parent Email (parentGuardianEmail).
3. **الأمان وكلمة المرور (Security & Password):** Current password, new password, confirm password, and interactive rule tags indicator.

---

## 🎨 UI/UX Features
- **Avatar Uploader:** Circular avatar widget with instant image preview and upload spinner.
- **Tabbed Settings Layout:** Seamless pill-based tabs dividing personal, parental, and security concerns.
- **Live Password Complexity Tracker:** Instant feedback pills for Minimum length (8+ chars), Uppercase letter (A-Z), and Number (0-9).
- **Parent Guardian Contact Synchronization:** Ensures parent contact info is collected during registration and editable from profile.

---

## 🧪 Verification Matrix
- [x] **Step A (ESLint):** 
px ng lint (0 errors, 0 warnings).
- [x] **Step B (Prettier):** 100% formatted.
- [x] **Step C (Console Audit):** 0 unhandled console errors, 0 runtime exceptions.
- [x] **Step D (Unit Testing):** 212/212 Karma specs passed (100%).
- [x] **Step E (Integration Testing):** student-profile.service.spec.ts HTTP mock passed.
- [x] **Step F (Playwright E2E):** e2e/student-profile.spec.ts (3/3 passed).
- [x] **Step G (Production Build):** 
px ng build --configuration=production (Exit code 0).
