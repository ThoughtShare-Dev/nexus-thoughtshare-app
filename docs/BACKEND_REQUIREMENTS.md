# ThoughtShare Backend — Routes & Requirements

What the backend team must build, and the rules each route must follow. Based on the official PRD and the email-nudge connection flow.

---

## The flow we are building

1. A member registers and logs in.
2. They set up a profile: teaching skills, learning skills, and a preferred contact method (the contact method is hidden from everyone else).
3. They search for a skill they want to learn.
4. They find a teacher and **send a learning request**. Sending the request emails the teacher a nudge: "someone wants to learn X from you, log in to respond."
5. The teacher logs in and **accepts or declines** inside the app.
6. On accept, both members' contact methods become visible to each other, and the sender is emailed that it was accepted.
7. Afterward, the learner can leave a rating and review.

Key rule: **email is only a nudge.** Accept and decline always happen inside the app through the API, never from a button in the email. This keeps all the real logic behind normal logged-in routes.

---

## Response format (every route follows this)

Success:
```json
{ "success": true, "data": { }, "message": "..." }
```
Error:
```json
{ "success": false, "error": { "code": "...", "message": "...", "field": "optional" } }
```

Status codes: 200 OK · 201 Created · 400 validation · 401 not logged in · 403 not allowed · 404 not found · 409 conflict (duplicate).

Auth: protected routes require the header `Authorization: Bearer <token>`.

---

## The routes

### Auth

**POST /auth/register** — create an account · no auth
- Requires name, email, password.
- Email must be unique; password hashed with bcrypt.
- Returns the new member (never the password).
- Errors: 400 (bad input), 409 (email taken).

**POST /auth/login** — log in · no auth
- Checks email + password, returns a JWT.
- Errors: 401 (wrong credentials).

**GET /auth/me** — my own profile · auth
- Returns the logged-in member's full profile (including their own contact method).
- Errors: 401.

### Profile

**GET /members/:id** — view a profile · no auth
- Returns the member's public profile.
- **contactMethod is null** unless the viewer has an ACCEPTED connection with this member.
- Errors: 404.

**PUT /members/:id** — edit my profile · auth (self only)
- Edit bio, contact method, teaching skills, learning skills.
- Max 5 teaching skills, each with a note. Max 6 learning skills, each with a reason.
- A member can only edit their own profile.
- Errors: 400 (too many skills / bad input), 401, 403 (editing someone else's).

**GET /members/:id/reviews** — a member's reviews · no auth
- Returns the list of reviews left for this member.

### Skills & search

**GET /skills** — the skill library · no auth
- Returns the fixed list of skills members choose from.

**GET /members?skill=&q=** — search/browse · no auth
- Returns members who **teach** the given skill.
- Sorted by average rating (high to low), then by name.
- **Reported members (pending review) must be excluded** — enforced in the query, not the UI.

### Learning requests (the core loop)

**POST /requests** — send a request · auth
- Body: recipient and the skill being requested.
- A member cannot request from themselves (400).
- Only one PENDING request allowed per sender→recipient pair (409 if one exists).
- New request starts as PENDING.
- **Side effect: email the recipient a nudge** ("log in to respond"). If the email fails, the request should still be created — email is best-effort, not blocking.
- Errors: 400 (self-request), 401, 404 (recipient missing), 409 (duplicate pending).

**GET /requests** — my requests · auth
- Returns { incoming: [...], outgoing: [...] } for the logged-in member.
- Errors: 401.

**PATCH /requests/:id** — accept or decline · auth (recipient only)
- Body: status = "ACCEPTED" or "DECLINED".
- Only the recipient may respond (403 otherwise).
- Cannot respond to an already-decided request (409).
- **On ACCEPTED:** both members' contact methods become mutually visible, and **email the original sender** that it was accepted (include the revealed contact if you like).
- **On DECLINED:** nothing is revealed.
- Errors: 401, 403, 404, 409.

### Reviews

**POST /reviews** — leave a review · auth
- Body: requestId, reviewee, rating (1–5), text.
- Only allowed if the two members have an ACCEPTED connection (403 otherwise).
- One review per connection (409 if already reviewed — edit instead).
- On save, recalculate the reviewee's average rating.

**PUT /reviews/:id** — edit my review · auth (author only)
- Author only (403 otherwise).
- Max 2 edits per review (403 once the limit is hit).
- Recalculate the average rating on save.

### Reporting

**POST /reports** — report a member · auth
- Body: reportedMember, reason (required).
- Cannot report yourself (400).
- Reported member is immediately hidden from search until an admin resolves it.

### Admin

**GET /admin/reports** — list pending reports · admin
**PATCH /admin/reports/:id** — dismiss (restore visibility) or action (deactivate) · admin
**POST /admin/skills** — add a skill to the library · admin
**DELETE /admin/reviews/:id** — remove a review that breaks guidelines · admin

---

## Cross-cutting rules (every route must respect)

1. **Passwords and password hashes are never returned** in any response, including nested objects.
2. **Contact method is never returned** unless the two members have an ACCEPTED connection — enforced in the backend query, not hidden by the frontend.
3. **Reported members are excluded** from search/browse at the query level while a report is pending.
4. Protected routes check a valid token first, then ownership where relevant (only edit your own profile, only the recipient responds to a request, only the author edits a review).
5. Wrap multi-step writes (e.g. accept a request + reveal contacts, or save a review + recalc average) so a half-finished write can't happen.
6. Email sending is a side effect only — it never blocks or fails the main action.

---

## Email (real backend, not the mock)

Two emails, both fired from inside routes you're already building:

| When | To | Message |
|---|---|---|
| A request is sent (`POST /requests`) | The recipient (teacher) | "Someone wants to learn X from you. Log in to accept or decline." |
| A request is accepted (`PATCH /requests/:id`) | The original sender | "Your request was accepted. Here's how to reach them." |

Use an email service (Resend, SendGrid, or Nodemailer with Gmail) rather than building a mail server. The email only links back to the app — it never contains accept/decline buttons that act without logging in. Note: this replaces the PRD's in-app-notification approach, so confirm the change with the team.

---

## Build order (critical path)

Register → Login → Auth middleware → Profile → Skills/Search → **POST /requests (+ email)** → PATCH /requests (+ reveal + email) → Reviews → Reports → Admin.

Get the loop from register through accept working first. Reviews, reports, and admin come after the core loop is solid.