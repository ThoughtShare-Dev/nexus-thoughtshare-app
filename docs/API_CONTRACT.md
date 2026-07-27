# ThoughtShare API Contract

The single source of truth for how the backend and frontend talk. Every endpoint, request body, and response shape lives here. If any of it changes, it changes here first, in the same commit as the code.

**Base URL (local):** `http://localhost:3000`
**Owner:** Backend team · **Status:** Draft for frontend sign-off

---

## 1. Response format

### Success
```json
{ "success": true, "data": { }, "message": "Human-readable summary" }
```
`data` is an object or an array depending on the endpoint.

### Error
```json
{ "success": false, "error": { "code": "MACHINE_CODE", "message": "Human-readable summary", "field": "optional" } }
```
`field` appears only on validation errors that point at one input.

### Status codes
| Code | Meaning | Used when |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates something |
| 400 | Bad Request | Validation failed / bad input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Logged in, but not allowed |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate (email taken, duplicate pending request, duplicate review) |

### Auth
Protected endpoints require the header `Authorization: Bearer <token>`. The token comes from `POST /auth/login`.

---

## 2. Endpoints

Core MVP loop is marked with a star (register -> login -> profile -> search -> request -> accept -> review). The rest support it.

### Auth

**[core] POST /auth/register** - no auth
Request: `{ "name": "Ada Okoye", "email": "ada@example.com", "password": "Secret123" }`
201: `{ "success": true, "data": { "id": "m1", "name": "Ada Okoye", "email": "ada@example.com" }, "message": "Account created" }`
Errors: 400 (validation), 409 (email already exists)

**[core] POST /auth/login** - no auth
Request: `{ "email": "ada@example.com", "password": "Secret123" }`
200: `{ "success": true, "data": { "token": "<JWT>", "member": { "id": "m1", "name": "Ada Okoye" } }, "message": "Logged in" }`
Errors: 401 (invalid credentials), 429 (too many attempts)

**[core] GET /auth/me** - auth
Request: none (token in header)
200: `{ "success": true, "data": { "id": "m1", "name": "Ada Okoye", "email": "ada@example.com", "bio": "...", "teachingSkills": [], "learningSkills": [], "contactMethod": "WhatsApp: ...", "averageRating": 4.8, "reviewCount": 12 }, "message": "OK" }`
Errors: 401

### Profile

**[core] GET /members/:id** - no auth
200: `{ "success": true, "data": { "id": "m2", "name": "Tunde Bello", "bio": "...", "teachingSkills": [ { "name": "Excel", "note": "6 yrs" } ], "learningSkills": [ { "name": "Video Editing", "reason": "..." } ], "averageRating": 4.9, "reviewCount": 20, "contactMethod": null }, "message": "OK" }`
Note: `contactMethod` is `null` unless the viewer has an ACCEPTED connection with this member.
Errors: 404

**[core] PUT /members/:id** - auth (self only)
Request: `{ "bio": "...", "contactMethod": "WhatsApp: ...", "teachingSkills": [ { "skillId": "s2", "note": "5 yrs" } ], "learningSkills": [ { "skillId": "s1", "reason": "..." } ] }`
200: returns the updated profile
Errors: 400 (max 5 teaching / max 6 learning skills), 401, 403 (editing someone else's)

**GET /members/:id/reviews** - no auth
200: `{ "success": true, "data": [ { "id": "rev1", "reviewer": { "id": "m1", "name": "Ada Okoye" }, "rating": 5, "text": "...", "createdAt": "..." } ], "message": "1 review(s)" }`

### Skills & search

**GET /skills** - no auth
200: `{ "success": true, "data": [ { "id": "s1", "name": "Excel" }, { "id": "s2", "name": "Video Editing" } ], "message": "8 skills" }`

**[core] GET /members?skill=&q=** - no auth
Example: `/members?skill=Excel`
200: `{ "success": true, "data": [ { "id": "m2", "name": "Tunde Bello", "teachingSkills": [], "averageRating": 4.9, "contactMethod": null } ], "message": "1 result(s)" }`
Rules: returns members who TEACH the skill, sorted by rating (desc) then name; reported members excluded; no matches returns an empty array with 200.

### Learning requests

**[core] POST /requests** - auth
Request: `{ "recipient": "m2", "skill": "Excel" }`
201: `{ "success": true, "data": { "id": "r9", "sender": "m1", "recipient": "m2", "skill": "Excel", "status": "PENDING", "createdAt": "..." }, "message": "Request sent" }`
Side effect: emails the recipient a nudge (best-effort; the request is still created if the email fails).
Errors: 400 (self-request), 401, 404 (recipient not found), 409 (pending request already exists)

**[core] GET /requests** - auth
200: `{ "success": true, "data": { "incoming": [ { "id": "r2", "sender": { "id": "m4", "name": "Chidi Eze" }, "skill": "Video Editing", "status": "PENDING", "createdAt": "..." } ], "outgoing": [ { "id": "r1", "recipient": { "id": "m2", "name": "Tunde Bello" }, "skill": "Excel", "status": "PENDING", "createdAt": "..." } ] }, "message": "OK" }`
Errors: 401

**[core] PATCH /requests/:id** - auth (recipient only)
Request: `{ "status": "ACCEPTED" }` (or `"DECLINED"`)
200 (accept): `{ "success": true, "data": { "id": "r2", "status": "ACCEPTED", "contactRevealed": { "theirContact": "Email: chidi@example.com" } }, "message": "Request accepted" }`
200 (decline): `{ "success": true, "data": { "id": "r2", "status": "DECLINED", "contactRevealed": null }, "message": "Request declined" }`
Side effect on accept: both contacts become mutually visible; emails the sender.
Errors: 401, 403 (not the recipient), 404, 409 (already decided)

### Reviews

**[core] POST /reviews** - auth
Request: `{ "requestId": "r3", "reviewee": "m3", "rating": 5, "text": "Great session." }`
201: returns the created review
Errors: 403 (no accepted connection), 409 (already reviewed this connection)

**PUT /reviews/:id** - auth (author only)
Request: `{ "rating": 4, "text": "Updated." }`
200: returns the updated review with `editCount` increased
Errors: 403 (not the author, or edit limit of 2 reached)

### Reporting

**POST /reports** - auth
Request: `{ "reportedMember": "m4", "reason": "Inappropriate messages" }`
201: returns the created report with `status: "PENDING"`
Errors: 400 (self-report or missing reason)

### Admin

**GET /admin/reports** - admin -> list of pending reports
**PATCH /admin/reports/:id** - admin -> `{ "resolution": "dismissed" }` or `"actioned"`
**POST /admin/skills** - admin -> `{ "name": "Graphic Design" }` adds to the library
**DELETE /admin/reviews/:id** - admin -> removes a review

---

## 3. Shared data shapes

**Member (public):** `{ id, name, bio, teachingSkills: [{ name, note }], learningSkills: [{ name, reason }], averageRating, reviewCount, contactMethod }` - `contactMethod` is `null` unless there is an ACCEPTED connection; `email` and password are never included for other members.

**LearningRequest:** `{ id, sender, recipient, skill, status, createdAt }` where status is `PENDING | ACCEPTED | DECLINED`.

**Review:** `{ id, reviewer, reviewee, requestId, rating, text, editCount, createdAt }`.

---

## 4. Rules that affect every response

1. Passwords and password hashes are never returned, anywhere.
2. `contactMethod` is only returned when the two members have an ACCEPTED connection - enforced in the backend query, not by the frontend.
3. Reported members (pending review) are excluded from search results server-side.
4. Email sending is a side effect only; it never blocks or fails the main request.

---

## 5. Sign-off

- [ ] Backend team agreed
- [ ] Frontend team agreed

Changes to this contract require updating this file and notifying both teams.