# 📋 Student Module Backend Integration Requirements

> **Target Audience:** Backend Development Team (ASP.NET Core API)  
> **Subject:** Missing Endpoints & Contract Specifications to replace Frontend mock fallbacks with real database-driven functionality.

---

## 🎯 Executive Summary

The entire **Student Module** frontend has been successfully built, designed, responsive, and verified with zero build errors. Real integrations for **Authentication (JWT)**, **Student Profile Update**, **Paymob Payment Checkout**, and **Classroom Q&A Channel (REST + SignalR Hub on `/hubs/qa`)** are already completed and live.

To enable the remaining user journeys (**Exams Taking & Grading**, **Academic Performance Reports**, **Digital Library**, and **In-App Password Management**) to communicate directly with real database records, please implement the following endpoints and data contracts.

---

## 📝 1. Exam Engine & Student Attempts Lifecycle

### 1.1 Get Student Assigned Exams List
* **Method & Route:** `GET /api/v1/students/exams`
* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  * `status`: `"all" | "available" | "scheduled" | "completed"` (optional, default: `"all"`)
  * `classroomId`: `Guid` (optional, filters by enrolled classroom)
* **Response Body (`200 OK`):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Physics Comprehensive Exam — Chapter 1 (Ohm's & Kirchhoff's Laws)",
    "classroomId": "b57492c1-8419-4f76-8f3e-6a56e2ef309a",
    "subjectName": "Physics",
    "teacherName": "Mr. Mohamed Draya",
    "durationMinutes": 45,
    "totalQuestions": 25,
    "status": "available",
    "scheduledDate": "2026-08-20T18:00:00Z",
    "studentScore": 85,
    "totalMark": 100,
    "isPassed": true
  }
]
```

---

### 1.2 Start New Exam Attempt
* **Method & Route:** `POST /api/v1/exams/{examId}/attempts/start`
* **Headers:** `Authorization: Bearer <token>`
* **Purpose:** Creates an active attempt session in the database, records start timestamp to prevent multi-device cheating, and returns questions with obfuscated answers.
* **Response Body (`200 OK` / `201 Created`):**
```json
{
  "attemptId": "e4b11f32-8419-4f76-8f3e-7a56e2ef1111",
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "startedAt": "2026-08-15T20:00:00Z",
  "durationMinutes": 45,
  "questions": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
      "questionText": "In the shown electrical circuit, what is the equivalent resistance across terminals A and B?",
      "questionType": "multiple_choice",
      "points": 4,
      "options": [
        { "id": "opt-1", "text": "4 Ω" },
        { "id": "opt-2", "text": "8 Ω" },
        { "id": "opt-3", "text": "12 Ω" },
        { "id": "opt-4", "text": "16 Ω" }
      ]
    }
  ]
}
```

---

### 1.3 Autosave Question Answer *(Optional but Recommended)*
* **Method & Route:** `POST /api/v1/attempts/{attemptId}/answers`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
  "selectedOptionId": "opt-2"
}
```
* **Response Body:** `200 OK`

---

### 1.4 Submit Exam Attempt & Final Grading
* **Method & Route:** `POST /api/v1/attempts/{attemptId}/submit`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "answers": [
    {
      "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
      "selectedOptionId": "opt-2"
    }
  ],
  "violationCount": 1
}
```
* **Response Body (`200 OK`):**
```json
{
  "attemptId": "e4b11f32-8419-4f76-8f3e-7a56e2ef1111",
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "score": 85,
  "totalMark": 100,
  "scorePercentage": 85,
  "isPassed": true,
  "gradeLabel": "Excellent 🌟",
  "submittedAt": "2026-08-15T20:40:00Z"
}
```

---

### 1.5 Get Attempt AI Result & Weakness Breakdown
* **Method & Route:** `GET /api/v1/attempts/{attemptId}/results`
* **Headers:** `Authorization: Bearer <token>`
* **Response Body (`200 OK`):**
```json
{
  "attemptId": "e4b11f32-8419-4f76-8f3e-7a56e2ef1111",
  "examTitle": "Physics Comprehensive Exam — Chapter 1",
  "scorePercentage": 85,
  "gradeLabel": "Excellent 🌟",
  "isPassed": true,
  "correctAnswersCount": 17,
  "wrongAnswersCount": 3,
  "totalQuestionsCount": 20,
  "weaknesses": [
    {
      "topicTitle": "Kirchhoff's Voltage Law & Potential Division",
      "weaknessPercent": 40,
      "recommendedLectureUrl": "/student/courses/pkg-1"
    }
  ],
  "questionsReview": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
      "questionText": "In the shown electrical circuit...",
      "selectedOptionId": "opt-2",
      "selectedOptionText": "8 Ω",
      "correctOptionId": "opt-2",
      "correctOptionText": "8 Ω",
      "isCorrect": true,
      "modelAnswerExplanation": "Applying Ohm's closed circuit law V = VB - Ir confirms the equivalent resistance is 8 Ω."
    }
  ]
}
```

---

## 📊 2. Student Academic Reports & AI Analytics

### 2.1 Get Student Performance Summary
* **Method & Route:** `GET /api/v1/students/reports/summary`
* **Headers:** `Authorization: Bearer <token>`
* **Purpose:** Aggregates cumulative student marks across all subjects, monthly progress trends, and AI radar skill distribution.
* **Response Body (`200 OK`):**
```json
{
  "overallAverage": 87,
  "completedExamsCount": 12,
  "topScorePercent": 94,
  "monthlyGrowthPercent": 5,
  "evolutionChart": [
    { "monthName": "May", "averageScore": 82 },
    { "monthName": "June", "averageScore": 79 },
    { "monthName": "July", "averageScore": 87 }
  ],
  "skillRadar": [
    { "subject": "Mathematics", "score": 85 },
    { "subject": "Physics", "score": 78 },
    { "subject": "Chemistry", "score": 91 },
    { "subject": "Biology", "score": 82 }
  ],
  "subjectBreakdown": [
    { "subjectName": "Mathematics", "scorePercent": 87 },
    { "subjectName": "Physics", "scorePercent": 82 },
    { "subjectName": "Chemistry", "scorePercent": 91 }
  ],
  "weaknessTopics": [
    {
      "id": "wt-1",
      "topicTitle": "Definite Integration & Area Applications",
      "subjectName": "Mathematics",
      "scorePercent": 42,
      "urgencyBadge": "Urgent Revision Required"
    }
  ]
}
```

---

## 📂 3. Digital Library & Downloadable Summaries

### 3.1 Get Student Available Books & PDF Summaries
* **Method & Route:** `GET /api/v1/students/library`
* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:** `search` (optional), `subject` (optional)
* **Response Body (`200 OK`):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
    "title": "Modern Physics Comprehensive Guide 2026",
    "subjectName": "Physics",
    "fileSizeMb": 12.4,
    "pagesCount": 280,
    "coverImageUrl": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    "downloadUrl": "https://draya-api.runasp.net/uploads/books/physics_guide.pdf",
    "chapters": [
      { "id": "ch-1", "title": "1. Electromagnetism & Applications" },
      { "id": "ch-2", "title": "2. Atomic Physics & Lasers" }
    ]
  }
]
```

---

## ⚙️ 4. Profile & Account Security

### 4.1 In-App Change Password
* **Method & Route:** `POST /api/v1/auth/change-password`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@2026"
}
```
* **Response Body (`200 OK`):**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

### 4.2 Profile Picture / Avatar Upload
* **Method & Route:** `POST /api/v1/students/avatar`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Request Body:** `file` (Image binary)
* **Response Body (`200 OK`):**
```json
{
  "avatarUrl": "https://draya-api.runasp.net/uploads/avatars/student_avatar.png"
}
```

---

## 👨‍🏫 5. Teacher Classrooms Binding Verification

### 5.1 Teacher's Created Classrooms
* **Method & Route:** `GET /api/v1/teachers/{teacherId}/classrooms`
* **Headers:** `Authorization: Bearer <token>`
* **Current Status:** Present in Swagger. Please ensure that when teachers create new classrooms via the Teacher portal, they are automatically returned by this endpoint with valid `classroomId` (`Guid`), `name`, `price`, and `subjectName` so students can view and checkout directly.

---

## 💳 6. Paymob Checkout Redirection / Auto-Close Popup

### 6.1 Option A (Recommended): Redirect to Frontend Callback (Auto-Closes Popup)
* **Route:** `GET /api/v1/payments/callback`
* **Behavior:** Redirect to the frontend callback URL. If opened in a popup tab, the frontend will automatically send a success message to the parent window and close itself (`window.close()`):
  ```csharp
  var frontendBaseUrl = _configuration["Frontend:Url"] ?? "http://localhost:4200";
  return Redirect($"{frontendBaseUrl}/student/checkout/callback?status=success&paymentTransactionId={paymentTransactionId}");
  ```

### 6.2 Option B: Return Auto-Close Script Directly from Backend
* Alternatively, the backend can directly return an HTML snippet that notifies the opener and closes the tab immediately:
  ```csharp
  [HttpGet("callback")]
  public async Task<IActionResult> Callback([FromQuery] PaymobCallbackDto dto)
  {
      // 1. Process payment & activate enrollment in database...

      // 2. Return HTML snippet to auto-close the popup tab
      var script = $@"
          <!DOCTYPE html>
          <html>
            <body>
              <script>
                if (window.opener) {{
                  window.opener.postMessage({{ type: 'PAYMOB_PAYMENT_SUCCESS', status: 'success', transactionId: '{dto.MerchantOrderId}' }}, '*');
                }}
                window.close();
              </script>
            </body>
          </html>";
      return Content(script, "text/html");
  }
  ```

---

## 🚀 Priority Action Checklist for Backend Team:
- [ ] **Priority 1:** Update `GET /api/v1/payments/callback` to return `Redirect()` to the frontend callback URL instead of raw JSON.
- [ ] **Priority 2:** Deploy / Enable `GET /api/v1/dashboard/student` (currently returning 404).
- [ ] **Priority 3:** Implement Exam Attempt endpoints (`POST /attempts/start` and `POST /attempts/submit`).
- [ ] **Priority 4:** Implement Student Academic Summary (`GET /students/reports/summary`).
- [ ] **Priority 5:** Add In-App Password Change endpoint (`POST /auth/change-password`).

---
*Thank you for your continuous support and great collaboration!*

