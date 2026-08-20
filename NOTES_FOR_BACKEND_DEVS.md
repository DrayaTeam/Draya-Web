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
*Last updated: 2026-08-20 by Frontend Team*
