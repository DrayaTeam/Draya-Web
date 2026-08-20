# Draya API Full Reference

## Classrooms — Core

### Get Classroom Students Roster
- **Endpoint**: `GET /api/v1/classrooms/{classroomId}/students`
- **Query Parameters**: `page`, `pageSize`
- **Response**: `StudentRosterItemDtoPagedResult`
  - `studentId`: string
  - `fullName`: string
  - `enrolledAt`: string (ISO Date)
  - `status`: string (e.g., "Active")
- **UNVERIFIED ASSUMPTION**: We assume this endpoint returns ALL enrolled students, whether they enrolled via a free `enrollmentCode` or paid through a Paymob checkout. **Action Item**: Confirm this against a live priced classroom with at least one Paymob-enrolled student once available.

### Remove Student from Classroom
- **Endpoint**: `DELETE /api/v1/classrooms/{classroomId}/students/{studentId}`
- **Description**: Fully removes the student from the classroom (no lingering "removed" status).
- **Response**: 204 No Content / void

## Materials (Classrooms)

### Get Classroom Materials
- **Endpoint**: `GET /api/v1/classrooms/{classroomId}/materials`
- **Query Parameters**: `page`, `pageSize`
- **Response**: `200 OK` (Returns a raw JSON array `ClassroomMaterialDto[]`, not a paginated object. `pageSize` limits the result, but lacks `totalCount`/`totalPages` metadata)

### Upload Initial Material
- **Endpoint**: `POST /api/v1/classrooms/{classroomId}/materials`
- **Request Body**: `multipart/form-data` (includes `materialType`, `title`, `file`)
- **Response**: `202 Accepted` (Returns the newly created `ClassroomMaterialDto`)

### Get Material Stream/File
- **Endpoint**: `GET /api/v1/materials/{materialId}/stream`
- **Response**: `200 OK` (Returns `MaterialStreamDto` containing `provider`, `videoId`, `streamUrl`, and `expiresAt`)
- 🔴 **KNOWN BUG (frontend hotfix applied)**: The backend returns a `streamUrl` with Arabic path segments incorrectly encoded (`%645` instead of the standard UTF-8 `%D9%85`). The frontend currently reverses this via a fragile regex hotfix in `classroom-materials.component.ts`. This hotfix should be removed once the backend fixes their encoding, as it could misinterpret a legitimate `%XXX` pattern in a filename.

### Delete Material
- **Endpoint**: `DELETE /api/v1/materials/{materialId}`
- **Response**: `200 OK`

### Upload New Version
- **Endpoint**: `POST /api/v1/materials/{materialId}/versions`
- **Request Body**: `multipart/form-data`
- **Response**: `202 Accepted` (Returns the new `MaterialVersionDto`)

### Get Material Version History
- **Endpoint**: `GET /api/v1/materials/{materialId}/versions`
- **Response**: `200 OK` (Returns array of `MaterialVersionDto` with `parseStatus` inline)

### Get Specific Version Status
- **Endpoint**: `GET /api/v1/materials/{materialId}/versions/{versionId}/status`
- **Response**: `200 OK` (`{"versionId":"...","parseStatus":"Parsed","errorMessage":null}`)
