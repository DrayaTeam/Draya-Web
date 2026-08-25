# Draya API Comprehensive Documentation

This guide provides a detailed overview of **all API endpoints** currently available in the Draya system. It is designed for Front-End and Mobile developers, providing exact JSON request bodies, HTTP methods, and required roles.

**Base URL:** `http://localhost:5000` (or your staging/production domain).

> [!IMPORTANT]
> **Authentication:** Unless marked as `[AllowAnonymous]`, all endpoints require a valid JWT token. Include it in the headers as:
> `Authorization: Bearer <YOUR_TOKEN>`

---

## 🔐 1. Authentication & Identity

**Route Prefix:** `/api/v1/auth`

### 1.1 Register Teacher

- **Endpoint:** `POST /api/v1/auth/register/teacher`
- **Auth:** `[AllowAnonymous]`
- **Request Body:**

```json
{
  "email": "teacher@example.com",
  "password": "StrongPassword123!",
  "fullName": "John Doe",
  "phone": "+201012345678"
}
```

- **Response:** `201 Created`

### 1.2 Register Student

- **Endpoint:** `POST /api/v1/auth/register/student`
- **Auth:** `[AllowAnonymous]`
- **Request Body:**

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123!",
  "fullName": "Jane Doe",
  "parentGuardianEmail": "parent@example.com",
  "dateOfBirth": "2010-05-15T00:00:00Z"
}
```

- **Response:** `201 Created`

### 1.3 Login

- **Endpoint:** `POST /api/v1/auth/login`
- **Auth:** `[AllowAnonymous]`
- **Request Body:**

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

- **Response:** `200 OK` (Returns Access Token and Refresh Token)

### 1.4 Refresh Token

- **Endpoint:** `POST /api/v1/auth/refresh-token`
- **Auth:** `[AllowAnonymous]`
- **Request Body:**

```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```

- **Response:** `200 OK` (Returns new Access Token and Refresh Token)

### 1.5 Logout

- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth:** `Bearer Token`
- **Response:** `204 No Content`

### 1.6 Request Password Reset

- **Endpoint:** `POST /api/v1/auth/password-reset/request`
- **Auth:** `[AllowAnonymous]`
- **Request Body:**

```json
{
  "email": "user@example.com"
}
```

- **Response:** `200 OK`

### 1.7 Confirm Password Reset

- **Endpoint:** `POST /api/v1/auth/password-reset/confirm`
- **Auth:** `[AllowAnonymous]`
- **Request Body:**

```json
{
  "token": "RESET_TOKEN_RECEIVED_IN_EMAIL",
  "newPassword": "NewStrongPassword123!"
}
```

- **Response:** `204 No Content`

### 1.8 Get Current User Profile (Me)

- **Endpoint:** `GET /api/v1/auth/me`
- **Auth:** `Bearer Token`
- **Response:** `200 OK` (Returns user details specific to their role)

---

## 👨‍🏫 2. Teacher Classrooms & Subjects

**Route Prefix:** `/api/v1/classrooms`

### 2.1 Get Subjects

- **Endpoint:** `GET /api/v1/classrooms/subjects`
- **Auth:** `Bearer Token`
- **Response:** `200 OK` (List of subjects)

### 2.2 Create Subject

- **Endpoint:** `POST /api/v1/classrooms/subjects`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "name": "Mathematics"
}
```

- **Response:** `201 Created`

### 2.3 Create Classroom

- **Endpoint:** `POST /api/v1/classrooms`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "subjectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Math 101 - Fall 2026",
  "classroomTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "gradeLevelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "startDate": "2026-09-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "price": 300.0
}
```

- **Response:** `201 Created` (Returns details, including `enrollmentCode`)

### 2.4 Get Teacher's Classrooms

- **Endpoint:** `GET /api/v1/classrooms?page=1&pageSize=20`
- **Auth:** `Teacher`
- **Response:** `200 OK` (Paginated list of teacher's classrooms)

### 2.5 Get Classroom Details

- **Endpoint:** `GET /api/v1/classrooms/{classroomId}`
- **Auth:** `Bearer Token`
- **Response:** `200 OK`

### 2.6 Update Classroom

- **Endpoint:** `PUT /api/v1/classrooms/{classroomId}`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "name": "Math 101 - Fall 2026 (Updated)",
  "subjectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "classroomTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "gradeLevelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "startDate": "2026-09-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "price": 350.0,
  "isActive": true
}
```

- **Response:** `200 OK`

### 2.7 Deactivate Classroom

- **Endpoint:** `DELETE /api/v1/classrooms/{classroomId}`
- **Auth:** `Teacher`
- **Response:** `204 No Content`

### 2.8 Regenerate Enrollment Code

- **Endpoint:** `POST /api/v1/classrooms/{classroomId}/regenerate-code`
- **Auth:** `Teacher`
- **Response:** `200 OK` (Returns classroom details with a new code)

### 2.9 Get Enrolled Students

- **Endpoint:** `GET /api/v1/classrooms/{classroomId}/students?page=1&pageSize=20`
- **Auth:** `Teacher`
- **Response:** `200 OK`

### 2.10 Remove Student from Classroom

- **Endpoint:** `DELETE /api/v1/classrooms/{classroomId}/students/{studentId}`
- **Auth:** `Teacher`
- **Response:** `204 No Content`

---

## 👨‍🎓 3. Student Enrollment & Checkout

**Route Prefix:** `/api/v1/classrooms`

### 3.1 Enroll in Classroom via Code (Free)

- **Endpoint:** `POST /api/v1/classrooms/enroll`
- **Auth:** `Student`
- **Request Body:**

```json
{
  "enrollmentCode": "ABC123XYZ"
}
```

- **Response:** `200 OK`

### 3.2 Pay for Classroom (Checkout)

- **Endpoint:** `POST /api/v1/classrooms/{classroomId}/checkout`
- **Auth:** `Student`
- **Response:** `200 OK`

```json
{
  "checkoutUrl": "https://accept.paymob.com/api/acceptance/iframes/xxxxx?payment_token=yyyyy"
}
```

---

## 💳 4. Teacher Wallet & Payouts

**Route Prefix:** `/api/v1/wallet`

### 4.1 Get Wallet Balance

- **Endpoint:** `GET /api/v1/wallet/balance`
- **Auth:** `Teacher`
- **Response:** `200 OK`

### 4.2 Get Wallet Transactions

- **Endpoint:** `GET /api/v1/wallet/transactions?pageNumber=1&pageSize=20`
- **Auth:** `Teacher`
- **Response:** `200 OK`

### 4.3 Initiate Wallet Top-Up

- **Endpoint:** `POST /api/v1/wallet/topup`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "amount": 500.0
}
```

- **Response:** `200 OK` (Returns `checkoutUrl` for Paymob)

### 4.4 Request Withdrawal

- **Endpoint:** `POST /api/v1/wallet/withdrawals`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "amount": 1000.0
}
```

- **Response:** `201 Created`

### 4.5 Get Withdrawal Requests

- **Endpoint:** `GET /api/v1/wallet/withdrawals?pageNumber=1&pageSize=20`
- **Auth:** `Teacher`
- **Response:** `200 OK`

### 4.6 Get Payout Accounts

- **Endpoint:** `GET /api/v1/wallet/payout-accounts`
- **Auth:** `Teacher`
- **Response:** `200 OK`

### 4.7 Add Payout Account

- **Endpoint:** `POST /api/v1/wallet/payout-accounts`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "accountType": "BankTransfer",
  "accountName": "Bank Misr - Ahmed",
  "accountIdentifier": "123456789012345",
  "isDefault": true
}
```

- **Response:** `201 Created`

### 4.8 Update Payout Account

- **Endpoint:** `PUT /api/v1/wallet/payout-accounts/{id}`
- **Auth:** `Teacher`
- **Request Body:**

```json
{
  "accountType": "BankTransfer",
  "accountName": "Bank Misr - Ahmed",
  "accountIdentifier": "123456789012345",
  "isDefault": true
}
```

- **Response:** `200 OK`

### 4.9 Delete Payout Account

- **Endpoint:** `DELETE /api/v1/wallet/payout-accounts/{id}`
- **Auth:** `Teacher`
- **Response:** `204 No Content`

---

## ⚙️ 5. SuperAdmin Classrooms Configuration

**Route Prefix:** `/api/v1/admin/classrooms`

### 5.1 Get Classroom Types

- **Endpoint:** `GET /api/v1/admin/classrooms/types`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 5.2 Create Classroom Type

- **Endpoint:** `POST /api/v1/admin/classrooms/types`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "name": "VIP Session",
  "description": "1 on 1 session with the teacher"
}
```

- **Response:** `201 Created`

### 5.3 Get Classroom Type by ID

- **Endpoint:** `GET /api/v1/admin/classrooms/types/{id}`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 5.4 Update Classroom Type

- **Endpoint:** `PUT /api/v1/admin/classrooms/types/{id}`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "name": "VIP Session Updated",
  "description": "1 on 1 session",
  "isActive": true
}
```

- **Response:** `204 No Content`

### 5.5 Deactivate Classroom Type

- **Endpoint:** `DELETE /api/v1/admin/classrooms/types/{id}`
- **Auth:** `SuperAdmin`
- **Response:** `204 No Content`

### 5.6 Get Grade Levels

- **Endpoint:** `GET /api/v1/admin/classrooms/grade-levels`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 5.7 Create Grade Level

- **Endpoint:** `POST /api/v1/admin/classrooms/grade-levels`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "name": "First Secondary",
  "description": "Grade 10",
  "sortOrder": 1
}
```

- **Response:** `201 Created`

### 5.8 Get Grade Level by ID

- **Endpoint:** `GET /api/v1/admin/classrooms/grade-levels/{id}`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 5.9 Update Grade Level

- **Endpoint:** `PUT /api/v1/admin/classrooms/grade-levels/{id}`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "name": "First Secondary",
  "description": "Grade 10",
  "sortOrder": 1,
  "isActive": true
}
```

- **Response:** `204 No Content`

### 5.10 Deactivate Grade Level

- **Endpoint:** `DELETE /api/v1/admin/classrooms/grade-levels/{id}`
- **Auth:** `SuperAdmin`
- **Response:** `204 No Content`

---

## 📈 6. SuperAdmin Financial Management

**Route Prefix:** `/api/v1/admin/financial`

### 6.1 Get Platform Settings

- **Endpoint:** `GET /api/v1/admin/financial/settings`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 6.2 Update Platform Settings

- **Endpoint:** `PUT /api/v1/admin/financial/settings`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "aiExamPrice": 50.0,
  "freeMonthlyAIExamQuota": 3,
  "platformCommissionPercent": 10.0
}
```

- **Response:** `200 OK`

### 6.3 Get Financial Overview

- **Endpoint:** `GET /api/v1/admin/financial/overview`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 6.4 Get All Withdrawal Requests

- **Endpoint:** `GET /api/v1/admin/financial/withdrawals?statusFilter=&pageNumber=1&pageSize=20`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 6.5 Approve Withdrawal

- **Endpoint:** `POST /api/v1/admin/financial/withdrawals/{id}/approve`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

### 6.6 Reject Withdrawal

- **Endpoint:** `POST /api/v1/admin/financial/withdrawals/{id}/reject`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "rejectionReason": "Bank account details invalid"
}
```

- **Response:** `200 OK`

### 6.7 Mark Withdrawal Paid

- **Endpoint:** `POST /api/v1/admin/financial/withdrawals/{id}/mark-paid`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "adminNote": "Transferred via InstaPay"
}
```

- **Response:** `200 OK`

### 6.8 Manual Adjustments

- **Endpoint:** `POST /api/v1/admin/financial/adjustments`
- **Auth:** `SuperAdmin`
- **Request Body:**

```json
{
  "teacherId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 200.0,
  "balanceType": "Current",
  "reason": "Bonus reward for the month"
}
```

- **Response:** `200 OK`

---

## 🔄 7. Payment Webhooks & Callbacks

**Route Prefix:** `/api/v1/payments`

> [!NOTE]
> These endpoints are called automatically by Paymob. UI Developers just need to ensure the App/Website correctly handles the redirect URL when Paymob redirects back to the `callback` endpoint.

### 7.1 Paymob Webhook (POST/GET)

- **Endpoints:**
  - `POST /api/v1/payments/webhook`
  - `GET /api/v1/payments/webhook`
- **Auth:** `[AllowAnonymous]`
- **Response:** `200 OK`

### 7.2 Paymob Callback (POST/GET)

- **Endpoints:**
  - `POST /api/v1/payments/callback`
  - `GET /api/v1/payments/callback`
- **Auth:** `[AllowAnonymous]`
- **Response:** `200 OK`

### 7.3 Confirm Payment Manually

- **Endpoint:** `POST /api/v1/payments/confirm/{id}?isSuccess=true`
- **Auth:** `Bearer Token`
- **Response:** `200 OK`

### 7.4 Refund Payment

- **Endpoint:** `POST /api/v1/payments/{id}/refund`
- **Auth:** `SuperAdmin`
- **Response:** `200 OK`

---

> [!WARNING]
> Note: For the most up-to-date and complete endpoint documentation, especially for Materials, please refer to the live-pulled reference at `docs/draya-api-full-reference.md`.
