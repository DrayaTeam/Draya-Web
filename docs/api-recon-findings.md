## Teacher Registration (POST /api/v1/auth/register/teacher)

### 1. Valid Registration

**Request:**
`POST /api/v1/auth/register/teacher`

```json
{
  "email": "recon_teacher_9876543@example.com",
  "password": "StrongPassword123!",
  "fullName": "Recon Teacher",
  "phone": "01012345678"
}
```

**Response:**
`Status: 201 Created`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZGIzZjlmNi04YzAyLTRhOTgtYTQxYS0yMjFmNzFiMzhmOWIiLCJlbWFpbCI6InJlY29uX3RlYWNoZXJfOTg3NjU0M0BleGFtcGxlLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRlYWNoZXIiLCJmdWxsTmFtZSI6IlJlY29uIFRlYWNoZXIiLCJqdGkiOiJlODM1ZGRkYS00ODYwLTRhYmUtYmQ3Yi04YzJhMTY5NWUxZGQiLCJpYXQiOjE3ODYwNTYwMzQsImV4cCI6MTc4NjA1OTYzNCwiaXNzIjoiaHR0cDovL2RyYXlhLWFwaS5ydW5hc3AubmV0LyIsImF1ZCI6IkRyYXlhQ2xpZW50cyJ9.cZdtl-_OmddW54biz6W7cHR42tJQ4pT9TY5KLLtlNoY",
  "refreshToken": "XLcCKFcGAx24zbflIykvXPXImKeGPuDOSd0p9KGDCJ5mCKpVj3sDjumeszT6rInX1gr8g205ku/WZzbJlaq1Og==",
  "expiresIn": 3600,
  "user": {
    "userId": "6db3f9f6-8c02-4a98-a41a-221f71b38f9b",
    "fullName": "Recon Teacher",
    "role": "Teacher"
  }
}
```

### 2. Conflict

**Request:**
`POST /api/v1/auth/register/teacher`

```json
{
  "email": "recon_teacher_9876543@example.com",
  "password": "StrongPassword123!",
  "fullName": "Recon Teacher",
  "phone": "01012345678"
}
```

**Response:**
`Status: 409 Conflict`

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with email 'recon_teacher_9876543@example.com' already exists.",
    "details": []
  }
}
```

### 3. Invalid Request

**Request:**
`POST /api/v1/auth/register/teacher`

```json
{
  "email": "not-an-email",
  "password": "123",
  "fullName": "Test",
  "phone": "123"
}
```

**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [
      { "field": "Email", "issue": "A valid email address is required." },
      { "field": "Password", "issue": "Password must be at least 8 characters." },
      { "field": "Password", "issue": "Password must contain at least one uppercase letter." },
      { "field": "Phone", "issue": "Invalid phone number format." }
    ]
  }
}
```

### Mock vs Real Discrepancies

**Flagging differences:** For 400/409, the real API wraps the payload inside an `"error"` object, uses `"issue"` instead of `"message"` within the `details` array, and returns PascalCase field names (e.g. `"Email"`); the 201 response correctly matches our mock's payload shape.

## Login (POST /api/v1/auth/login)

### 1. Valid Credentials

**Request:**
`POST /api/v1/auth/login`

```json
{
  "email": "recon_teacher_9876543@example.com",
  "password": "StrongPassword123!"
}
```

**Response:**
`Status: 200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZGIzZjlmNi04YzAyLTRhOTgtYTQxYS0yMjFmNzFiMzhmOWIiLCJlbWFpbCI6InJlY29uX3RlYWNoZXJfOTg3NjU0M0BleGFtcGxlLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRlYWNoZXIiLCJmdWxsTmFtZSI6IlJlY29uIFRlYWNoZXIiLCJqdGkiOiJkNGFkMDdmNy1iNzA2LTQ5YzctOTdhZS1jYTM0YjhiOTg2M2EiLCJpYXQiOjE3ODYwNTg3MTQsImV4cCI6MTc4NjA2MjMxNCwiaXNzIjoiaHR0cDovL2RyYXlhLWFwaS5ydW5hc3AubmV0LyIsImF1ZCI6IkRyYXlhQ2xpZW50cyJ9.SGMoPHt94qbH-k8WNJmlPbNeUJamSJ1g3-dVAUn2ktY",
  "refreshToken": "wYqN5zQZW0McF0HbN/tmXMkfbVzpL/eGXNBbUrUa/4/bcRcj9NFhV7aBhpLfsW+g6CWsHMGiOf/eYtvWuhhcEw==",
  "expiresIn": 3600,
  "user": {
    "userId": "6db3f9f6-8c02-4a98-a41a-221f71b38f9b",
    "fullName": "Recon Teacher",
    "role": "Teacher"
  }
}
```

### 2. Invalid Credentials

**Request:**
`POST /api/v1/auth/login`

```json
{
  "email": "recon_teacher_9876543@example.com",
  "password": "WrongPassword123!"
}
```

**Response:**
`Status: 401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password.",
    "details": []
  }
}
```

### 3. Attempt 403 Forbidden

**Request:**
`POST /api/v1/auth/login`

```json
{
  "email": "disabled_user@example.com",
  "password": "SomePassword123!"
}
```

**Response:**
`Status: 401 Unauthorized`
(Unable to trigger 403 Forbidden with a fake/disabled user; returns standard 401 instead. Could not reproduce 403.)

### Mock vs Real Discrepancies

**Flagging differences:** The user object in the 200 response matches the exact same shape as Registration (contains only `userId`, `fullName`, and `role`, completely omitting the `email` field).
**Error Wrapper Confirmation:** Confirmed — the 401 response exactly matches the error wrapper pattern `{"error": { "code", "message", "details" }}` found in Teacher Registration.

## Student Registration (POST /api/v1/auth/register/student)

### 1. Valid Registration

**Request:**
`POST /api/v1/auth/register/student`

```json
{
  "email": "recon_student_001@example.com",
  "password": "StrongPassword123!",
  "fullName": "Recon Student",
  "parentGuardianEmail": "parent_001@example.com",
  "dateOfBirth": "2010-01-01T00:00:00.000Z"
}
```

**Response:**
`Status: 201 Created`

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "D8l5...",
  "expiresIn": 3600,
  "user": {
    "userId": "9fc5e9da-9c4c-4a37-bba2-581d6d84f227",
    "fullName": "Recon Student",
    "role": "Student"
  }
}
```

### 2. fullName Edge Cases

**Request 2a (<3 chars):** `fullName: "Ab"`
**Response 2a:** `Status: 201 Created` (Success)
**Request 2b (pure numeric):** `fullName: "12345"`
**Response 2b:** `Status: 201 Created` (Success)
**Field value returned:** N/A (No error returned)

### 3. password Edge Cases

**Request 3a (<12 chars):** `password: "Str0ngPass!"` (11 chars)
**Response 3a:** `Status: 201 Created` (Success)
**Request 3b (missing symbol):** `password: "StrongPassword1234"`
**Response 3b:** `Status: 201 Created` (Success)
**Field value returned:** N/A (No error returned)

### 4. parentGuardianEmail same-as-student-email

**Request:** `email` and `parentGuardianEmail` both set to `"recon_student_006@example.com"`
**Response:** `Status: 201 Created` (Success)
**Field value returned:** N/A (No error returned)

### 5. dateOfBirth Edge Cases

**Request 5a (future date):** `dateOfBirth: "2030-01-01T00:00:00.000Z"`
**Response 5a:** `Status: 201 Created` (Success)
**Request 5b (exactly 9 years old):** `dateOfBirth: "2017-08-07T18:29:56.804Z"`
**Response 5b:** `Status: 201 Created` (Success)
**Request 5c (exactly 10 years old):** `dateOfBirth: "2016-08-07T18:29:56.804Z"`
**Response 5c:** `Status: 201 Created` (Success)
**Field value returned:** N/A (No error returned)

### 6. Duplicate Email

**Request:** Reuse `"recon_student_001@example.com"`
**Response:**
`Status: 409 Conflict`

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with email 'recon_student_001@example.com' already exists.",
    "details": []
  }
}
```

### Mock vs Real Discrepancies

**Flagging differences:** CRITICAL DISCREPANCY: The backend API currently enforces **NONE** of the frontend validation rules for Student Registration (name length, pure numeric name, password strength, matching emails, or future/underage DOB). All invalid edge-cases successfully created an account and returned 201 Created. The frontend mock currently assumes the backend validates these and returns 400s. The user object in the 201 response also correctly matches the structure of other endpoints (omitting `email`).
**Error Wrapper Confirmation:** Confirmed — the 409 Conflict response exactly matches the error wrapper pattern `{"error": { "code", "message", "details" }}` found in Teacher Registration and Login.

## Teacher Registration — Validation Gap Check

### A1. Valid email format but password < 8 chars

**Request:** `password: "Ab1!"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "Password", "issue": "Password must be at least 8 characters." }]
  }
}
```

**Verdict:** ENFORCED

### A2. Valid email format but password only lowercase

**Request:** `password: "onlylowercase"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [
      { "field": "Password", "issue": "Password must contain at least one uppercase letter." },
      { "field": "Password", "issue": "Password must contain at least one number." }
    ]
  }
}
```

**Verdict:** ENFORCED

### A3. fullName as a single character

**Request:** `fullName: "A"`
**Response:** `Status: 201 Created` (Success)
**Verdict:** NOT ENFORCED

### A4. fullName as pure digits

**Request:** `fullName: "99999"`
**Response:** `Status: 201 Created` (Success)
**Verdict:** NOT ENFORCED

### A5. phone as an obviously invalid string

**Request:** `phone: "not-a-phone-number"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "Phone", "issue": "Invalid phone number format." }]
  }
}
```

**Verdict:** ENFORCED

### A6. email in a clearly malformed format

**Request:** `email: "plainstring"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "Email", "issue": "A valid email address is required." }]
  }
}
```

**Verdict:** ENFORCED

## Login — Validation Gap Check

### B1. Malformed email format in the login body

**Request:** `email: "notanemail"`, `password: "SomePassword123!"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "Email", "issue": "A valid email address is required." }]
  }
}
```

**Verdict:** ENFORCED

### B2. Empty string password with a valid registered email

**Request:** `email: "recon_teacher_9876543@example.com"`, `password: ""`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "Password", "issue": "Password is required." }]
  }
}
```

**Verdict:** ENFORCED

### B3. Extremely long password (500+ characters)

**Request:** `email: "recon_teacher_9876543@example.com"`, `password: "A".repeat(600)`
**Response:**
`Status: 401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password.",
    "details": []
  }
}
```

**Verdict:** ENFORCED (handled robustly, no crash)

### B4. SQL-injection-style string in the email field

**Request:** `email: "test' OR '1'='1"`, `password: "WrongPassword123!"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "Email", "issue": "A valid email address is required." }]
  }
}
```

**Verdict:** ENFORCED (Confirmed: No 500 error or sign of injection reaching the database; it was safely rejected by basic email format validation before any query could be executed).

## Refresh Token (Duplicate Endpoint Check + Behavior)

### 1a. POST /api/v1/auth/refresh-token (Valid Token)

**Request:** `{ "refreshToken": "VALID_TOKEN" }`
**Response:**
`Status: 200 OK`

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "IBXywh...",
  "expiresIn": 3600,
  "user": {
    "userId": "0a390d8e-30ce-4c2f-9873-4fa4684d5297",
    "fullName": "Recon Teacher",
    "role": "Teacher"
  }
}
```

### 1b. POST /api/auth/refresh (Valid Token)

**Request:** `{ "refreshToken": "FRESH_VALID_TOKEN" }`
**Response:**
`Status: 200 OK`
(Response body structure is identical to 1a. Returns accessToken, refreshToken, expiresIn, and user object).

### 2a. Fake Token (on /api/v1/auth/refresh-token)

**Request:** `{ "refreshToken": "bWFrZXVwZmFrZXRva2Vu..." }`
**Response:**
`Status: 401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid, expired, or revoked refresh token.",
    "details": []
  }
}
```

### 2b. Empty Token (on /api/v1/auth/refresh-token)

**Request:** `{ "refreshToken": "" }`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "Token",
        "issue": "Refresh token is required."
      }
    ]
  }
}
```

### Token Rotation Behavior Check

**Request:** POST to `/api/v1/auth/refresh-token` with the **SAME** token that was already used in 1a.
**Response:**
`Status: 401 Unauthorized` (with `INVALID_REFRESH_TOKEN` error wrapper).

### Conclusion & Mock Discrepancies

**Working Endpoints:** BOTH endpoints are live and fully functional, returning identical structures. The frontend should standardly use `/api/v1/auth/refresh-token` to match the `v1` convention of the other routes.
**Token Rotation Verdict:** ROTATES (The original token was immediately invalidated after its first successful use; reusing it resulted in a 401).
**Flagging differences:** The response returns a full `user` object exactly like the Login and Register endpoints (omitting `email`). The frontend mock may need to be aware that the refreshToken is rotated on every use, requiring it to strictly overwrite the stored refreshToken with the new one on every successful refresh.

## View Profile (GET /api/v1/auth/me)

### 1. Valid Request (Teacher)

**Request:** `GET /api/v1/auth/me` with valid Teacher `accessToken`.
**Response:**
`Status: 404 Not Found`

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Active subscription not found.",
    "details": []
  }
}
```

_(This suggests the endpoint may be incorrectly coupled to a Student subscription concept, breaking for Teachers)._

### 5. Cross-role check (Student)

**Request:** `GET /api/v1/auth/me` with valid Student `accessToken`.
**Response:**
`Status: 200 OK`

```json
{
  "userId": "55225fd8-5532-40c4-b235-b2e3a1c5b0bf",
  "email": "recon_student_6_1786133810440@example.com",
  "fullName": "Recon Student Profile",
  "parentGuardianEmail": "parent_6_1786133810440@example.com",
  "dateOfBirth": "2010-01-01T00:00:00"
}
```

### 2. No Authorization header

**Request:** `GET /api/v1/auth/me` without any auth headers.
**Response:** `Status: 401 Unauthorized` (Empty response body, no JSON wrapper).

### 3. Malformed/garbage token

**Request:** `GET /api/v1/auth/me` with `Authorization: Bearer thisisnotarealtoken`
**Response:** `Status: 401 Unauthorized` (Empty response body, no JSON wrapper).

### 4. Expired/rotated-out token

_(Skipped: An old token was tested, but it was generated only ~30 minutes prior and had not actually expired yet, returning the same 404 result as Case 1)._

### Profile Field List & Mock Discrepancies

**Student Field List:** `userId`, `email`, `fullName`, `parentGuardianEmail`, `dateOfBirth`.
**Teacher Field List:** N/A (Endpoint errors out with 404 for Teachers).
**Explicit Confirmation:** **email IS included in /auth/me** (for students).
**Flagging differences:** CRITICAL DISCREPANCY: The `/auth/me` endpoint completely fails for Teachers with a `404 Active subscription not found` error. The frontend mock currently assumes this endpoint works universally for all authenticated users to fetch their profile data. Furthermore, generic 401 auth errors (missing/bad token) return an empty body rather than the `INVALID_REFRESH_TOKEN`-style JSON wrapper seen on the refresh endpoint.

## Logout (POST /api/v1/auth/logout)

### 1. Valid Request (Logout)

**Request:** `POST /api/v1/auth/logout` with valid `Authorization: Bearer <accessToken>`.
**Response:**
`Status: 204 No Content` (Empty body)

### 2. Call again immediately with the same token

**Request:** `POST /api/v1/auth/logout` with the exact same accessToken.
**Response:**
`Status: 204 No Content` (Empty body)

### 3. No Authorization header

**Request:** `POST /api/v1/auth/logout`
**Response:**
`Status: 401 Unauthorized` (Empty body)

### 4. Garbage/malformed token

**Request:** `POST /api/v1/auth/logout` with `Authorization: Bearer thisisnotarealtoken`.
**Response:**
`Status: 401 Unauthorized` (Empty body)

### 5. Use refresh token after logout

**Request:** `POST /api/v1/auth/refresh-token` using the `refreshToken` associated with the logged-out session.
**Response:**
`Status: 401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid, expired, or revoked refresh token.",
    "details": []
  }
}
```

### Server-side Invalidation Verdict

**Verdict:** **MIXED (Client-side deletion still required for immediate security).**
Logout **DOES** successfully revoke the refresh token server-side, meaning an attacker cannot renew the session once the user logs out. This makes it a real security boundary for long-term sessions. However, the access token itself appears to remain valid until its 1-hour expiration time hits (calling logout twice with the same access token returns 204 instead of 401, implying stateless JWTs without an active blacklist). Thus, the frontend MUST immediately delete tokens from `localStorage` to secure the client.

## Password Reset (Request & Confirm)

### 1. Request Reset (Real Email)

**Request:** `POST /api/v1/auth/password-reset/request` with `email: "recon_teacher_9876543@example.com"`
**Response:**
`Status: 200 OK`

```json
{
  "message": "If the account exists, a password reset email has been sent."
}
```

### 2. Request Reset (Fake Email)

**Request:** `POST /api/v1/auth/password-reset/request` with `email: "definitely_does_not_exist_12345@example.com"`
**Response:**
`Status: 200 OK`

```json
{
  "message": "If the account exists, a password reset email has been sent."
}
```

**Security Flag:** The endpoint does **NOT** leak whether an email exists. It behaves exactly the same for valid and invalid emails, which is a perfect implementation of email enumeration protection.

### 3. Confirm Reset (Fake Token, Valid Password)

**Request:** `POST /api/v1/auth/password-reset/confirm` with `token: "faketoken123", newPassword: "NewValidPassword123!"`
**Response:**
`Status: 401 Unauthorized`

```json
{
  "error": {
    "code": "INVALID_PASSWORD_RESET_TOKEN",
    "message": "The password reset token is invalid, expired, or has already been used.",
    "details": []
  }
}
```

_(Note: No real token was leaked in the request response, so a full end-to-end reset could not be safely tested)._

### 4. Confirm Reset (Fake Token, Weak Password)

**Request:** `POST /api/v1/auth/password-reset/confirm` with `token: "faketoken123", newPassword: "weak"`
**Response:**
`Status: 400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "details": [
      { "field": "NewPassword", "issue": "Password must be at least 8 characters." },
      { "field": "NewPassword", "issue": "Password must contain at least one uppercase letter." },
      { "field": "NewPassword", "issue": "Password must contain at least one number." }
    ]
  }
}
```

**Validation Flag:** Password-strength validation **IS** correctly enforced server-side here, even taking precedence before token validation fails. The error wrapper pattern exactly matches prior recon findings.
