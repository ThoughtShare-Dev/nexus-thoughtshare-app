# ThoughtShare API Contract

**Document:** `THOUGHTSHARE_API_CONTRACT.md`  
**Version:** 1.0  
**Status:** Backend MVP Contract  
**Base URL:** `/api/v1`  
**Format:** JSON over HTTPS  
**Authentication:** JWT Bearer tokens  
**Source of truth:** ThoughtShare PRD + Backend Implementation Plan

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [API Conventions](#2-api-conventions)
3. [Authentication](#3-authentication)
4. [Response Envelope](#4-response-envelope)
5. [Error Contract](#5-error-contract)
6. [HTTP Status Codes](#6-http-status-codes)
7. [Pagination](#7-pagination)
8. [Resource Contracts](#8-resource-contracts)
9. [Endpoint Specifications](#9-endpoint-specifications)
10. [Security Rules](#10-security-rules)
11. [Cross-Endpoint Business Rules](#11-cross-endpoint-business-rules)
12. [OpenAPI Implementation Notes](#12-openapi-implementation-notes)
13. [Contract Testing Checklist](#13-contract-testing-checklist)
14. [Versioning and Change Management](#14-versioning-and-change-management)

---

## 1. Purpose and Scope

This document is the binding API contract between the ThoughtShare backend and all API consumers, including the web frontend, Postman collections, automated tests, administrative tooling, and future mobile clients.

ThoughtShare is a peer-to-peer skill exchange platform. A member can teach skills, learn skills, discover other members, send a connection request, accept or decline a request, exchange preferred contact details after acceptance, submit reviews after an accepted connection, and report another member. Admins moderate reports, manage the skill library, and remove violating reviews.

The MVP deliberately stops at discovery and connection. It does not expose production APIs for chat, lessons, scheduling, booking, subscriptions, payments, or a professional marketplace.

### Contract goals

- Make frontend/backend integration predictable.
- Define every endpoint and its authentication requirements.
- Define request and response JSON shapes.
- Define validation and business-rule failures.
- Prevent accidental exposure of passwords or private contact information.
- Provide stable error codes for frontend handling.
- Support OpenAPI/Swagger generation and contract testing.

---

## 2. API Conventions

### 2.1 Base paths

- Public API: `/api/v1`
- Health check: `/health`
- API documentation: `/api/docs`
- Authentication: `/api/v1/auth/*`
- Member resources: `/api/v1/members/*`
- Skill resources: `/api/v1/skills/*`
- Search: `/api/v1/search`
- Connection requests: `/api/v1/requests/*`
- Notifications: `/api/v1/notifications`
- Reviews: `/api/v1/reviews/*`
- Reports: `/api/v1/reports/*`
- Admin: `/api/v1/admin/*`

### 2.2 Content type

Requests containing a body use:

```http
Content-Type: application/json
```

Responses use:

```http
Content-Type: application/json
```

Profile picture upload is the exception and uses `multipart/form-data`.

### 2.3 Naming

- JSON fields: `camelCase`.
- URLs: lowercase plural nouns where applicable.
- IDs: UUID strings.
- Dates: ISO-8601 UTC timestamps.
- Enum values: uppercase strings.
- No password field is ever returned.
- Private contact information is returned only when the viewer is an authenticated participant in an `ACCEPTED` connection.

### 2.4 Request IDs

Production deployments should accept or generate an `X-Request-Id` header. The value should be included in structured logs and returned in the response header. This is recommended for incident investigation and distributed tracing.

---

## 3. Authentication

### 3.1 Bearer token format

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

The JWT contains:

```json
{
  "sub": "member-uuid",
  "role": "MEMBER",
  "iat": 1753520000,
  "exp": 1753527200
}
```

Admin authentication uses the same JWT mechanism but a separate Admin identity space and `role: "ADMIN"`.

### 3.2 Token policy

- Algorithm: `HS256` for MVP.
- Default access-token lifetime: `2h`.
- Secret: `JWT_SECRET` environment variable.
- No refresh-token flow in MVP.
- Deactivated members cannot log in.
- Invalid or expired tokens return `401 UNAUTHENTICATED`.

### 3.3 Authentication matrix

| Endpoint | Public | Member JWT | Admin JWT |
|---|---:|---:|---:|
| POST `/auth/register` | Yes | No | No |
| POST `/auth/login` | Yes | No | No |
| GET `/auth/me` | No | Yes | No |
| POST `/auth/logout` | No | Yes | No |
| PUT `/members/me` | No | Yes | No |
| POST `/members/me/picture` | No | Yes | No |
| GET `/members/:id` | No | Yes | No |
| GET `/skills` | Yes | Optional | Optional |
| Teaching/learning skill CRUD | No | Yes | No |
| GET `/search` | No | Yes | No |
| Requests | No | Yes | No |
| Notifications | No | Yes | No |
| Reviews | No | Yes | No |
| Reports | No | Yes | No |
| Admin reports | No | No | Yes |
| Admin skills | No | No | Yes |
| Admin review deletion | No | No | Yes |
| GET `/health` | Yes | No | No |

---

## 4. Response Envelope

### 4.1 Successful response

```json
{
  "success": true,
  "data": {}
}
```

### 4.2 Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 8 characters and include an uppercase letter and a number.",
    "field": "password"
  }
}
```

`field` is optional and appears only for field-specific validation errors.

### 4.3 Collection response

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## 5. Error Contract

| Code | HTTP | Meaning |
|---|---:|---|
| `VALIDATION_ERROR` | 400 | Request body, query, or path validation failed |
| `SELF_REQUEST` | 400 | Member attempted to request themselves |
| `SELF_REPORT` | 400 | Member attempted to report themselves |
| `MAX_TEACHING_SKILLS_REACHED` | 400 | More than 5 teaching skills |
| `MAX_LEARNING_SKILLS_REACHED` | 400 | More than 6 learning skills |
| `SKILL_NOT_FOUND` | 400 | Search skill is not in library |
| `INVALID_SEARCH_MODE` | 400 | Search mode is not `teach` or `learn` |
| `UNAUTHENTICATED` | 401 | Missing, invalid, or expired JWT |
| `INVALID_CREDENTIALS` | 401 | Login credentials are invalid |
| `ACCOUNT_DEACTIVATED` | 401 | Member account has been deactivated |
| `FORBIDDEN` | 403 | Authenticated user lacks permission |
| `NOT_RECIPIENT` | 403 | Request action attempted by non-recipient |
| `NO_ACCEPTED_CONNECTION` | 403 | Review attempted without accepted connection |
| `EDIT_LIMIT_REACHED` | 403 | Review has reached maximum edit count |
| `NOT_FOUND` | 404 | Resource does not exist or is inaccessible |
| `RECIPIENT_NOT_FOUND` | 404 | Request recipient does not exist |
| `EMAIL_TAKEN` | 409 | Email already registered |
| `REQUEST_ALREADY_PENDING` | 409 | Duplicate pending request |
| `INVALID_STATE` | 409 | Resource is not in a valid state for operation |
| `REVIEW_ALREADY_EXISTS` | 409 | Review already exists for connection |
| `REPORT_ALREADY_PENDING` | 409 | Duplicate pending report |
| `SKILL_IN_USE` | 409 | Skill cannot be deleted while referenced |
| `TOO_MANY_ATTEMPTS` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency or database unavailable |

---

## 6. HTTP Status Codes

| Status | Use |
|---:|---|
| 200 | Successful read/update/action |
| 201 | Resource created |
| 400 | Invalid input or business validation failure |
| 401 | Authentication failure |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | State or uniqueness conflict |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
| 503 | Health/dependency failure |

---

## 7. Pagination

Paginated endpoints use:

```text
?page=1&pageSize=20
```

Rules:

- `page` minimum: 1.
- `pageSize` minimum: 1.
- `pageSize` maximum: 100.
- Default `page`: 1.
- Default `pageSize`: 20.
- Results must use deterministic ordering.

---

## 8. Resource Contracts

### 8.1 Public member representation

```json
{
  "id": "uuid",
  "name": "Aisha Example",
  "bio": "Data analyst and Excel mentor.",
  "profilePictureUrl": "https://cdn.example/profile.jpg",
  "avgRating": 4.8,
  "ratingCount": 12,
  "teachingSkills": [
    {
      "skillId": "uuid",
      "name": "Excel",
      "contextNote": "Five years building financial models."
    }
  ],
  "learningSkills": [
    {
      "skillId": "uuid",
      "name": "Video Editing",
      "reasonNote": "I want to create educational content."
    }
  ]
}
```

Never include `passwordHash`.

Never include `preferredContactValue` unless the authenticated viewer is entitled to see it.

### 8.2 Contact visibility rule

Before an accepted connection:

```json
{
  "preferredContactType": null,
  "preferredContactValue": null
}
```

After an accepted connection between the viewer and member:

```json
{
  "preferredContactType": "WHATSAPP",
  "preferredContactValue": "+2348000000000"
}
```

The server decides visibility. The client cannot request private fields by altering the payload or query string.

---

# 9. Endpoint Specifications

## 9.1 Authentication

### POST `/api/v1/auth/register`

**Auth:** Public  
**Purpose:** Create a Member account.

**Request**

```json
{
  "name": "Ada Example",
  "email": "ada@example.com",
  "password": "SecurePass1"
}
```

**Validation**

- `name`: 2-100 characters.
- `email`: valid email, maximum 255, unique.
- `password`: minimum 8 characters, at least one uppercase letter and one digit.

**201 Created**

```json
{
  "success": true,
  "data": {
    "member": {
      "id": "uuid",
      "name": "Ada Example",
      "email": "ada@example.com",
      "bio": null,
      "avgRating": 0,
      "ratingCount": 0
    },
    "accessToken": "jwt"
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`.

---

### POST `/api/v1/auth/login`

**Auth:** Public

**Request**

```json
{
  "email": "ada@example.com",
  "password": "SecurePass1"
}
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "member": {
      "id": "uuid",
      "name": "Ada Example",
      "email": "ada@example.com"
    }
  }
}
```

**Errors:** `401 INVALID_CREDENTIALS`, `401 ACCOUNT_DEACTIVATED`, `429 TOO_MANY_ATTEMPTS`.

Login rate limit: maximum 5 attempts per 15-minute email/IP window.

---

### GET `/api/v1/auth/me`

**Auth:** Member JWT

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ada Example",
    "email": "ada@example.com",
    "bio": "Data analyst.",
    "preferredContactType": "WHATSAPP",
    "preferredContactValue": "+2348000000000",
    "avgRating": 4.8,
    "ratingCount": 12,
    "teachingSkills": [],
    "learningSkills": []
  }
}
```

The authenticated member may see their own contact information.

---

### POST `/api/v1/auth/logout`

**Auth:** Member JWT

MVP behavior is stateless logout: the client deletes the access token. If token revocation is introduced later, this endpoint becomes responsible for token invalidation.

**200 OK**

```json
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

---

## 9.2 Members and Profiles

### PUT `/api/v1/members/me`

**Auth:** Member JWT

**Request**

```json
{
  "name": "Ada Example",
  "bio": "Data analyst and Excel mentor.",
  "preferredContactType": "WHATSAPP",
  "preferredContactValue": "+2348000000000"
}
```

All fields are optional for partial profile updates except the route identity, which comes from JWT.

**200 OK:** Updated member profile.

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`.

---

### POST `/api/v1/members/me/picture`

**Auth:** Member JWT  
**Content-Type:** `multipart/form-data`

Form field:

```text
picture=<binary file>
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "profilePictureUrl": "https://cdn.example/profile/uuid.jpg"
  }
}
```

Recommended validation: image MIME type allowlist, maximum file size, server-generated filename, malware scanning where supported, and object storage rather than database BLOB storage.

---

### GET `/api/v1/members/:id`

**Auth:** Member JWT

Returns a member profile. Contact information is included only when the viewer and profile owner have an `ACCEPTED` connection.

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ada Example",
    "bio": "Data analyst.",
    "preferredContactType": "WHATSAPP",
    "preferredContactValue": "+2348000000000",
    "avgRating": 4.8,
    "ratingCount": 12,
    "teachingSkills": [],
    "learningSkills": []
  }
}
```

Before acceptance, the two contact fields are omitted or null. The API implementation must choose one representation consistently and document it in OpenAPI.

**Errors:** `401 UNAUTHENTICATED`, `404 NOT_FOUND`.

---

## 9.3 Skill Library

### GET `/api/v1/skills`

**Auth:** Public

**Query:**

```text
?category=Productivity&page=1&pageSize=50
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Excel",
        "category": "Productivity"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### POST `/api/v1/members/me/teaching-skills`

**Auth:** Member JWT

**Request**

```json
{
  "skillId": "uuid",
  "contextNote": "I use Excel for financial modelling and reporting."
}
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "skillId": "uuid",
    "name": "Excel",
    "contextNote": "I use Excel for financial modelling and reporting."
  }
}
```

Maximum: 5 teaching skills per member.

**Errors:** `400 VALIDATION_ERROR`, `400 MAX_TEACHING_SKILLS_REACHED`, `404 NOT_FOUND`.

---

### PUT `/api/v1/members/me/teaching-skills/:id`

**Auth:** Member JWT

**Request**

```json
{
  "contextNote": "Updated context about my Excel experience."
}
```

The skill association itself is immutable through this endpoint. To change the skill, delete the association and add a new one.

**200 OK:** Updated teaching skill.

**Errors:** `400 VALIDATION_ERROR`, `404 NOT_FOUND`.

---

### DELETE `/api/v1/members/me/teaching-skills/:id`

**Auth:** Member JWT

**204 No Content**

No response body.

---

### POST `/api/v1/members/me/learning-skills`

**Auth:** Member JWT

**Request**

```json
{
  "skillId": "uuid",
  "reasonNote": "I want to learn video editing for educational content."
}
```

Maximum: 6 learning skills.

**201 Created:** Created learning-skill association.

**Errors:** `400 VALIDATION_ERROR`, `400 MAX_LEARNING_SKILLS_REACHED`, `404 NOT_FOUND`.

---

### PUT `/api/v1/members/me/learning-skills/:id`

**Auth:** Member JWT

**Request**

```json
{
  "reasonNote": "I want to improve my educational video production."
}
```

**200 OK:** Updated learning skill.

---

### DELETE `/api/v1/members/me/learning-skills/:id`

**Auth:** Member JWT

**204 No Content**

---

## 9.4 Search

### GET `/api/v1/search`

**Auth:** Member JWT

**Query**

```text
?skill=Excel&mode=teach&page=1&pageSize=20
```

`mode`: `teach` or `learn`. Default: `teach`.

**200 OK**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "name": "Ada Example",
        "avgRating": 4.8,
        "ratingCount": 12,
        "teachingSkills": ["Excel"]
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Sort order: `avgRating DESC`, then `name ASC`.

Excluded from results:

- `hiddenFromSearch = true` members.
- Deactivated members.
- The requesting member's own profile, if this product decision is retained.

**Errors:** `400 SKILL_NOT_FOUND`, `400 INVALID_SEARCH_MODE`.

---

## 9.5 Learning Requests

### POST `/api/v1/requests`

**Auth:** Member JWT

**Request**

```json
{
  "recipientId": "uuid"
}
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "status": "PENDING",
    "createdAt": "2026-07-26T10:00:00.000Z"
  }
}
```

**Errors:** `400 SELF_REQUEST`, `404 RECIPIENT_NOT_FOUND`, `409 REQUEST_ALREADY_PENDING`.

Side effect: create `NEW_REQUEST` notification for recipient.

---

### PATCH `/api/v1/requests/:id/accept`

**Auth:** Member JWT  
**Authorization:** Request recipient only.

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "status": "ACCEPTED",
    "updatedAt": "2026-07-26T12:00:00.000Z"
  }
}
```

Transaction:

1. Verify request exists.
2. Verify authenticated user is recipient.
3. Verify status is `PENDING`.
4. Update status to `ACCEPTED`.
5. Create `REQUEST_ACCEPTED` notification.
6. Commit.

Contact visibility becomes available through the profile query after acceptance.

**Errors:** `403 NOT_RECIPIENT`, `404 NOT_FOUND`, `409 INVALID_STATE`.

---

### PATCH `/api/v1/requests/:id/decline`

**Auth:** Member JWT  
**Authorization:** Request recipient only.

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DECLINED"
  }
}
```

Side effect: create `REQUEST_DECLINED` notification.

No contact information is revealed.

**Errors:** `403 NOT_RECIPIENT`, `404 NOT_FOUND`, `409 INVALID_STATE`.

---

## 9.6 Notifications

### GET `/api/v1/notifications`

**Auth:** Member JWT

**Query:**

```text
?unreadOnly=true&page=1&pageSize=20
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "REQUEST_ACCEPTED",
        "learningRequestId": "uuid",
        "isRead": false,
        "createdAt": "2026-07-26T12:00:00.000Z"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

MVP notification delivery is refresh-based. No WebSocket or push notification API is required.

---

## 9.7 Reviews

### POST `/api/v1/reviews`

**Auth:** Member JWT

**Request**

```json
{
  "requestId": "uuid",
  "rating": 5,
  "reviewText": "Great at explaining Excel concepts."
}
```

The server derives `reviewerId` from JWT and `revieweeId` from the accepted request. Clients must not submit `reviewerId` or `revieweeId`.

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "requestId": "uuid",
    "reviewerId": "uuid",
    "revieweeId": "uuid",
    "rating": 5,
    "reviewText": "Great at explaining Excel concepts.",
    "editCount": 0,
    "createdAt": "2026-07-26T13:00:00.000Z"
  }
}
```

Transaction also recalculates `avgRating` and `ratingCount`.

**Errors:** `400 VALIDATION_ERROR`, `403 NO_ACCEPTED_CONNECTION`, `409 REVIEW_ALREADY_EXISTS`.

---

### PUT `/api/v1/reviews/:id`

**Auth:** Member JWT  
**Authorization:** Review author only.

**Request**

```json
{
  "rating": 4,
  "reviewText": "Updated review after more experience."
}
```

Maximum edits: 2 by default.

**200 OK:** Updated review.

Transaction:

1. Verify ownership.
2. Verify edit count < 2.
3. Update review and increment edit count.
4. Recalculate reviewee rating.
5. Commit.

**Errors:** `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `403 EDIT_LIMIT_REACHED`, `404 NOT_FOUND`.

---

## 9.8 Reports and Trust & Safety

### POST `/api/v1/reports`

**Auth:** Member JWT

**Request**

```json
{
  "reportedMemberId": "uuid",
  "reason": "Inappropriate behavior outside the platform."
}
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reporterId": "uuid",
    "reportedMemberId": "uuid",
    "reason": "Inappropriate behavior outside the platform.",
    "status": "PENDING",
    "createdAt": "2026-07-26T14:00:00.000Z"
  }
}
```

Transaction also sets `reportedMember.hiddenFromSearch = true`.

**Errors:** `400 SELF_REPORT`, `400 VALIDATION_ERROR`, `404 NOT_FOUND`, `409 REPORT_ALREADY_PENDING`.

---

## 9.9 Admin

### PATCH `/api/v1/admin/reports/:id/dismiss`

**Auth:** Admin JWT

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DISMISSED",
    "resolvedAt": "2026-07-27T10:00:00.000Z",
    "resolvedByAdminId": "admin-uuid"
  }
}
```

If no other pending report exists against the same member, restore `hiddenFromSearch = false`.

**Errors:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 INVALID_STATE`.

---

### PATCH `/api/v1/admin/reports/:id/action`

**Auth:** Admin JWT

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACTIONED",
    "resolvedAt": "2026-07-27T10:00:00.000Z",
    "resolvedByAdminId": "admin-uuid"
  }
}
```

Transaction also sets:

- `Member.isActive = false`
- `Member.hiddenFromSearch = true`

Deactivated members cannot log in.

---

### POST `/api/v1/admin/skills`

**Auth:** Admin JWT

**Request**

```json
{
  "name": "Financial Modelling",
  "category": "Finance"
}
```

**201 Created:** Created skill.

**Errors:** `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN` is not applicable; use a dedicated `SKILL_NAME_TAKEN` code for duplicate skill names.

---

### PUT `/api/v1/admin/skills/:id`

**Auth:** Admin JWT

**Request**

```json
{
  "name": "Advanced Financial Modelling",
  "category": "Finance"
}
```

**200 OK:** Updated skill.

---

### DELETE `/api/v1/admin/skills/:id`

**Auth:** Admin JWT

**204 No Content** if unused.

**409 SKILL_IN_USE** if referenced by teaching or learning associations.

---

### DELETE `/api/v1/admin/reviews/:id`

**Auth:** Admin JWT

Hard-deletes a review that violates moderation guidelines.

**204 No Content**

Transaction also recalculates the reviewee's `avgRating` and `ratingCount`.

---

## 9.10 Operations

### GET `/health`

**Auth:** Public

**200 OK**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "db": "connected",
    "uptime": 12345
  }
}
```

**503 Service Unavailable** if database connectivity fails.

The health endpoint should be lightweight and safe for load balancer and uptime-monitor probes.

---

## 10. Security Rules

1. JWT authentication is mandatory on every protected route.
2. Password hashes are never serialized.
3. Contact details are scoped at query time.
4. Admin routes require `role = ADMIN`.
5. Ownership checks are performed server-side.
6. Reported members are filtered at the database query level.
7. Login attempts are rate limited.
8. Generic authentication errors must not reveal whether an email exists.
9. Error responses must not expose stack traces in production.
10. Secrets must come from environment configuration.
11. Logs must never contain passwords or bearer tokens.
12. File uploads must be validated and stored outside the application container.
13. Database transactions protect multi-step state changes.
14. Foreign keys enforce referential integrity.
15. All input is validated with Zod or equivalent server-side schemas.

---

## 11. Cross-Endpoint Business Rules

### Profile

- Maximum 5 teaching skills.
- Maximum 6 learning skills.
- Teaching and learning notes are mandatory.
- Skills must come from library.
- Bio maximum 500 characters.
- Contact details private until accepted connection.

### Requests

- No self-request.
- Only one pending request per sender/recipient pair.
- State machine: `PENDING -> ACCEPTED` or `PENDING -> DECLINED`.
- Only recipient can accept or decline.
- Acceptance reveals contact details.

### Reviews

- Only accepted connections can be reviewed.
- One review per reviewer/reviewee/request combination.
- Reviewer can edit own review only.
- Maximum 2 edits by default.
- Rating must be 1-5.
- Rating aggregates must remain consistent.

### Reports

- No self-report.
- Reason required.
- Pending report hides reported member from search.
- Dismissal can restore visibility if no pending reports remain.
- Action deactivates account.

---

## 12. OpenAPI Implementation Notes

The backend should maintain an OpenAPI 3.1 document at `docs/openapi.yaml` or generate it using `swagger-jsdoc`.

Recommended reusable components:

- `ErrorResponse`
- `ValidationErrorResponse`
- `Member`
- `PublicMember`
- `Skill`
- `TeachingSkill`
- `LearningSkill`
- `LearningRequest`
- `Review`
- `Report`
- `Notification`
- `PaginationMeta`
- `BearerAuth`

Every endpoint in this document must have a corresponding OpenAPI operation before it is considered complete.

---

## 13. Contract Testing Checklist

For every endpoint:

- [ ] Correct HTTP method.
- [ ] Correct URL.
- [ ] Authentication tested.
- [ ] Authorization tested.
- [ ] Valid request tested.
- [ ] Missing required field tested.
- [ ] Invalid data type tested.
- [ ] Boundary values tested.
- [ ] Unauthorized ownership tested.
- [ ] Success response matches schema.
- [ ] Error response matches schema.
- [ ] Database side effects tested.
- [ ] Transaction rollback tested where applicable.
- [ ] Sensitive fields excluded.
- [ ] OpenAPI specification updated.

---

## 14. Versioning and Change Management

The API is versioned through the URL: `/api/v1`.

Breaking changes require a new major API version, for example `/api/v2`.

Non-breaking additions may be introduced within v1, including:

- New optional response fields.
- New optional query parameters.
- New endpoints.
- New notification types, provided existing consumers ignore unknown values safely.

Breaking changes include:

- Removing fields.
- Renaming fields.
- Changing field types.
- Changing authentication semantics.
- Changing an existing endpoint's required request fields.
- Changing existing status codes in a way that breaks client behavior.

All contract changes require:

1. Updated OpenAPI specification.
2. Updated automated contract tests.
3. Updated frontend integration notes.
4. Pull request review.
5. Changelog entry for material changes.

---

## Appendix A - Endpoint Inventory

| # | Method | Endpoint | Auth | Role |
|---:|---|---|---|---|
| 1 | POST | `/auth/register` | Public | - |
| 2 | POST | `/auth/login` | Public | - |
| 3 | GET | `/auth/me` | JWT | Member |
| 4 | POST | `/auth/logout` | JWT | Member |
| 5 | PUT | `/members/me` | JWT | Member |
| 6 | POST | `/members/me/picture` | JWT | Member |
| 7 | GET | `/members/:id` | JWT | Member |
| 8 | GET | `/skills` | Public | - |
| 9 | POST | `/members/me/teaching-skills` | JWT | Member |
| 10 | PUT | `/members/me/teaching-skills/:id` | JWT | Member |
| 11 | DELETE | `/members/me/teaching-skills/:id` | JWT | Member |
| 12 | POST | `/members/me/learning-skills` | JWT | Member |
| 13 | PUT | `/members/me/learning-skills/:id` | JWT | Member |
| 14 | DELETE | `/members/me/learning-skills/:id` | JWT | Member |
| 15 | GET | `/search` | JWT | Member |
| 16 | POST | `/requests` | JWT | Member |
| 17 | PATCH | `/requests/:id/accept` | JWT | Recipient |
| 18 | PATCH | `/requests/:id/decline` | JWT | Recipient |
| 19 | GET | `/notifications` | JWT | Member |
| 20 | POST | `/reviews` | JWT | Member |
| 21 | PUT | `/reviews/:id` | JWT | Review author |
| 22 | POST | `/reports` | JWT | Member |
| 23 | PATCH | `/admin/reports/:id/dismiss` | JWT | Admin |
| 24 | PATCH | `/admin/reports/:id/action` | JWT | Admin |
| 25 | POST | `/admin/skills` | JWT | Admin |
| 26 | PUT | `/admin/skills/:id` | JWT | Admin |
| 27 | DELETE | `/admin/skills/:id` | JWT | Admin |
| 28 | DELETE | `/admin/reviews/:id` | JWT | Admin |
| 29 | GET | `/health` | Public | - |

---

## Appendix B - MVP Out of Scope

The following are intentionally not part of this API contract:

- Real-time chat.
- Direct messaging.
- Lesson scheduling.
- Calendar integration.
- Booking.
- Payments.
- Subscriptions.
- Pro membership.
- Marketplace commissions.
- Video calls.
- Push notifications.
- Refresh token rotation.

Any addition requires product scope approval and an API contract update before implementation.
