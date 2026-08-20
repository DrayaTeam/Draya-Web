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
  - ullName (string)
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

- In some responses of GET /classrooms and GET /teachers, the eacherName property returns the subject name instead of the teacher's actual ullName, and pictureUrl is occasionally mismatched or empty.

### 💡 Recommendation for Backend Team

- Ensure SQL joins/projections consistently map Teacher.FullName and Teacher.ProfilePictureUrl to eacherName and eacherAvatarUrl / pictureUrl.

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

_Last updated: 2026-08-20 by Frontend Team_
