# 📝 Notes for Backend Developers (Draya API)

This document tracks backend API improvements, missing DTO fields, or behavioral discrepancies identified during frontend integration.

---

## 📌 Note 1: Student Profile Update DTO — Missing Parent Guardian Fields (PUT /api/v1/students/profile)

### 🔍 Issue Description
- In **Student Registration** (POST /api/v1/auth/register/student), RegisterStudentRequest accepts all three parent guardian properties:
  - parentGuardianName (string)
  - parentGuardianPhone (string)
  - parentGuardianEmail (string)
- However, in **Student Profile Update** (PUT /api/v1/students/profile), UpdateStudentProfileRequest currently only accepts:
  - ullName (string)
  - parentGuardianEmail (string)
  - dateOfBirth (date-time)
  - ❌ parentGuardianName and parentGuardianPhone are **missing** from UpdateStudentProfileRequest.

### 💡 Recommendation for Backend Team
Add parentGuardianName and parentGuardianPhone as nullable optional string fields to UpdateStudentProfileRequest DTO and update the student profile command handler so students can update their guardian’s name and WhatsApp contact number from their account settings.

`csharp
public class UpdateStudentProfileRequest
{
    public string? FullName { get; set; }
    public string? ParentGuardianEmail { get; set; }
    public string? ParentGuardianName { get; set; }
    public string? ParentGuardianPhone { get; set; }
    public DateTime? DateOfBirth { get; set; }
}
`

---

## 📌 Note 2: Re-enrollment After Student Removal (POST /api/v1/classrooms/enroll & POST /api/v1/classrooms/{id}/checkout)

### 🔍 Issue Description
- When a student is removed/unenrolled from a classroom, attempting to re-enroll with a new center code or initiate a new checkout session returns 404 Not Found or a zero price error.
- **Original Feedback:** لو ال student اتشال من ال classroom هينفع يرجع تاني ولا لا بكود جديد فا بلاقي سعر الاشتراك بسفر و بيكون notfound مش بقدر تروح لبوابة الدفع

### 💡 Recommendation for Backend Team
- In the enrollment and checkout handlers, handle the state where an enrollment record exists with status Unenrolled or Revoked by allowing re-activation with a valid new enrollmentCode or creating a fresh Paymob checkout order.

---

## 📌 Note 3: Teacher Name & Picture in Classroom Endpoints (GET /api/v1/teachers & GET /api/v1/classrooms)

### 🔍 Issue Description
- In some responses of GET /classrooms and GET /teachers, the 	eacherName property returns the subject name instead of the teacher's actual ullName, and pictureUrl is occasionally mismatched or empty.

### 💡 Recommendation for Backend Team
- Ensure SQL joins/projections consistently map Teacher.FullName and Teacher.ProfilePictureUrl to 	eacherName and 	eacherAvatarUrl / pictureUrl.

---

## 📌 Note 4: Student Progress Percentage & Materials Count on Classrooms (GET /api/v1/classrooms)

### 🔍 Issue Description
- Student classroom cards require displaying the student's individual progress percentage (e.g. 75%) and the total number of materials/lessons published in that classroom.

### 💡 Recommendation for Backend Team
- Include studentProgress (integer 0-100 or float) and materialsCount / lessonsCount in the ClassroomSummaryDto returned by GET /api/v1/classrooms and GET /api/v1/classrooms/{id} when accessed with a Student JWT.

---

## 📌 Note 5: Support Image Attachment in Reply Update Endpoint (PUT /api/v1/questions/{questionId}/replies/{replyId})

### 🔍 Issue Description
- While creating a question or reply supports photo attachments via multipart endpoints (/questions/with-photo, /replies/with-photo), updating a reply only accepts raw JSON text without an image URL / attachment option.

### 💡 Recommendation for Backend Team
- Update UpdateReplyRequest or provide a multipart endpoint to allow updating/removing the attached image URL on existing discussion replies.

---

## 📌 Note 6: Password Reset Email Delivery for Supervisors & Admins (POST /api/v1/auth/password-reset/request)

### 🔍 Issue Description
- Password reset emails need to be verified and dispatched properly for all platform roles, specifically Supervisor and Admin accounts, ensuring the generated token and reset link point correctly to the frontend reset screen.

### 💡 Recommendation for Backend Team
- Verify SMTP/SendGrid delivery for Admin and Supervisor user accounts when POST /api/v1/auth/password-reset/request is invoked with an administrator email address.

---

## 📌 Note 7: Global Platform Students Listing Endpoint for Admin (GET /api/v1/admin/students)

### 🔍 Issue Description
- The Admin dashboard requires an endpoint to list and search all enrolled students across all teachers, along with global enrollment counts.

### 💡 Recommendation for Backend Team
- Provide GET /api/v1/admin/students supporting pagination (pageNumber, pageSize), search query (search), and grade level filter (gradeLevelId), returning items with { studentId, fullName, email, phone, parentGuardianPhone, enrolledClassroomsCount, createdAt }.

---

## 📌 Note 8: Admin Profile Information Update (PUT /api/v1/admin/profile or PUT /api/v1/auth/me)

### 🔍 Issue Description
- Platform administrators need to update their display name, phone number, and preferences from the admin settings screen.

### 💡 Recommendation for Backend Team
- Provide PUT /api/v1/admin/profile or extend PUT /api/v1/auth/me to accept { fullName, phoneNumber } for Administrator accounts.

---

## 📌 Note 9: Media Streaming Content Security Headers (GET /api/v1/materials/{id}/stream)

### 🔍 Issue Description
- To prevent unauthorized downloading and piracy of educational materials, streaming endpoints should deliver inline viewing headers.

### 💡 Recommendation for Backend Team
- Return Content-Disposition: inline and X-Frame-Options: SAMEORIGIN on GET /api/v1/materials/{id}/stream responses for protected video and document media.

---

## 📌 Note 10: Real-time Notifications SignalR Hub & History (GET /api/v1/notifications + /hubs/notifications)

### 🔍 Issue Description
- The top navigation bar includes an interactive notification bell to display real-time announcements, exam grade alerts, and new Q&A replies.

### 💡 Recommendation for Backend Team
- Establish a SignalR hub at /hubs/notifications and REST endpoint GET /api/v1/notifications returning { id, title, message, type, read, createdAt } with PUT /api/v1/notifications/{id}/read to mark as seen.

## 📌 Note 11: Fix 403 Forbidden on GET /api/v1/exams for Student Role (or provide GET /api/v1/students/exams)

### 🔍 Issue Description
- Currently, when an enrolled student navigates to `/student/exams`, the frontend calls `GET /api/v1/exams` to retrieve their upcoming, scheduled, and active exams.
- The ASP.NET Core backend rejects the request with **`403 (Forbidden)`** because the `ExamsController` currently enforces `[Authorize(Roles = "Teacher")]` on the entire controller or on `GET /api/v1/exams`.

### 💡 Recommendation for Backend Team
- Either update `GET /api/v1/exams` authorization to:
  ```csharp
  [Authorize(Roles = "Teacher,Student")]
  ```
  and when `User.IsInRole("Student")`, automatically filter exams to only those belonging to the student's enrolled classrooms (`ClassroomEnrollments`).
- OR provide a dedicated student endpoint:
  ```http
  GET /api/v1/students/exams?page=1&pageSize=10
  ```
  returning the list of exams available to the authenticated student.

---

## 📌 Note 12: Inconsistent Route Versioning for Classroom Sections (GET /api/classrooms/{id}/sections)

### 🔍 Issue Description
- Most platform controllers are versioned under `/api/v1/...`, but the `ClassroomSectionsController` is routed under `/api/classrooms/{classroomId}/sections` (missing `/v1`).
- Calling `/api/v1/classrooms/{id}/sections` returns **`404 (Not Found)`**.

### 💡 Recommendation for Backend Team
- Standardize the route by adding `api/v1/classrooms/{classroomId}/sections` (or supporting both `/api/v1/...` and `/api/...` through `[Route("api/v1/classrooms/{classroomId}/sections")]`).

---

## 📌 Note 13: Allow Unenrolled Students & Visitors to View Classroom Feedback (GET /api/v1/classrooms/{id}/feedback)

### 🔍 Issue Description
- When prospective students view package details `/student/packages/{id}` before purchasing to read student reviews and ratings, calling `GET /api/v1/classrooms/{id}/feedback` returns **`403 (Forbidden)`**.
- Prospective students need to see course ratings and reviews to decide whether to purchase the course.

### 💡 Recommendation for Backend Team
- Make `GET /api/v1/classrooms/{classroomId}/feedback` publicly accessible or allow `[AllowAnonymous]` / `[Authorize(Roles = "Student,Teacher,Admin,SuperAdmin")]` without requiring an active classroom enrollment to view public reviews.

---

## 📌 Note 14: Manual Balance Adjustments History / Audit Log for Admin (GET /api/v1/admin/financial/adjustments)

### 🔍 Issue Description
- Platform administrators can create manual balance adjustments via `POST /api/v1/admin/financial/adjustments`.
- However, there is currently no corresponding `GET /api/v1/admin/financial/adjustments` endpoint to view a paginated audit log of all manual adjustments made by administrators across all teachers.

### 💡 Recommendation for Backend Team
- Provide `GET /api/v1/admin/financial/adjustments` with query parameters `(pageNumber, pageSize, teacherId, balanceType)` returning:
  ```json
  {
    "items": [
      {
        "id": "adj-uuid",
        "teacherId": "teacher-uuid",
        "teacherName": "أ. حسام الدين",
        "amount": 1500,
        "balanceType": "Earned",
        "reason": "مكافأة تميز في إنتاج المحتوى",
        "createdByName": "أ. عبدالرحمن العنزي",
        "createdAt": "2026-08-20T14:30:00Z"
      }
    ],
    "totalCount": 1,
    "pageNumber": 1,
    "pageSize": 10
  }
  ```

---
*Last updated: 2026-08-20 by Frontend Team*
