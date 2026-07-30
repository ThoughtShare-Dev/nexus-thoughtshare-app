# ThoughtShare Backend Team Design Guide

## Purpose

This document defines how the backend team will collaborate, structure the project, and deliver the ThoughtShare MVP. It establishes shared engineering standards, ownership, development workflow, and architectural guidelines to ensure consistency across all backend modules.

---

## Recommended Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Validation | Zod |
| Logging | Winston |
| API Documentation | Swagger (OpenAPI) |
| Testing | Jest + Supertest |
| Linting | ESLint |
| Formatting | Prettier |
| Containerization | Docker |

---

## Repository Strategy

Current repository workflow:

```text
main
└── develop
    ├── be-001
    ├── be-002
    ├── be-003
    ├── fe-001
    ├── fe-002
    ├── devops-001
    └── docs/*
```

### Branching Rules

- Protect `main` and `develop`.
- Never commit directly to `main`.
- All work must be done in feature branches.
- Merge changes only through Pull Requests.
- Require at least one approving review before merging.
- Keep branches focused on a single feature or task.

---

## Suggested Backend Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── validators/
│   ├── models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── utils/
│   ├── constants/
│   └── app.js
├── tests/
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Database First

The database schema should be finalized before implementing business logic.

### Core Entities

- Member
- Skill
- MemberTeachingSkill
- MemberLearningSkill
- LearningRequest
- Review
- Report
- Notification
- Admin

### Deliverables

- Entity Relationship Diagram (ERD)
- Prisma Schema
- Initial Database Migration
- Seed Data
- Database Index Strategy

---

## API Modules

The backend implementation follows the official `API_CONTRACT.md`.

Any changes to endpoints, request bodies, response formats, authentication rules, or business rules must be updated in `API_CONTRACT.md` before implementation.

### Authentication

| Method | Endpoint | Purpose |
|---------|----------|---------|
| POST | `/auth/register` | Register a new member |
| POST | `/auth/login` | Authenticate a member and return a JWT |
| GET | `/auth/me` | Retrieve the authenticated member's profile |

### Member Profile

| Method | Endpoint | Purpose |
|---------|----------|---------|
| GET | `/members/:id` | View a member's public profile |
| PUT | `/members/:id` | Update the authenticated member's profile |
| GET | `/members/:id/reviews` | Retrieve reviews for a member |

### Skills & Search

| Method | Endpoint | Purpose |
|---------|----------|---------|
| GET | `/skills` | Retrieve the skill library |
| GET | `/members?skill=&q=` | Search members by teaching skill or keyword |

### Learning Requests

| Method | Endpoint | Purpose |
|---------|----------|---------|
| POST | `/requests` | Send a learning request |
| GET | `/requests` | Retrieve incoming and outgoing requests |
| PATCH | `/requests/:id` | Accept or decline a learning request |

### Reviews

| Method | Endpoint | Purpose |
|---------|----------|---------|
| POST | `/reviews` | Create a review |
| PUT | `/reviews/:id` | Update an existing review |

### Reporting

| Method | Endpoint | Purpose |
|---------|----------|---------|
| POST | `/reports` | Report a member |

### Administration

| Method | Endpoint | Purpose |
|---------|----------|---------|
| GET | `/admin/reports` | List pending reports |
| PATCH | `/admin/reports/:id` | Resolve a report |
| POST | `/admin/skills` | Add a new skill |
| DELETE | `/admin/reviews/:id` | Remove an inappropriate review |

---

## Team Allocation

### Backend Engineer 1

Responsible for:

- Authentication
- User Profile
- Middleware
- Validation
- Unit Tests

### Backend Engineer 2

Responsible for:

- Skills
- Search
- Learning Requests
- Notifications

### Backend Engineer 3

Responsible for:

- Reviews
- Reports
- Admin
- Database
- Deployment Support

---

## Development Timeline

### Week 1

- Project setup
- Folder structure
- Database design
- Authentication
- Swagger setup

### Week 2

- Profile
- Skills
- Search
- Learning Requests

### Week 3

- Reviews
- Reports
- Notifications
- Admin

### Week 4

- Integration
- Testing
- Deployment
- Final Demo

---

## Engineering Standards

### Git

- Conventional Commits
- Feature branches
- Pull Requests only
- No direct commits to `main` or `develop`

### Commit Types

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

### Code Quality

- ESLint required
- Prettier required
- Unit tests for services
- Integration tests for API endpoints
- Consistent error handling
- Meaningful logging

---

## Immediate Action Checklist

- Finalize folder structure
- Approve database schema
- Complete Prisma schema
- Finalize API Contract
- Configure Docker
- Configure GitHub Actions
- Configure Swagger
- Protect repository branches
- Assign backend module ownership
- Create GitHub Issues
- Create first database migration
- Add `.env.example`

---

## Success Criteria

- Stable and version-controlled API Contract.
- Database schema approved before implementation.
- All backend modules implemented according to the PRD.
- Minimum 80% test coverage for core business logic.
- Successful integration with the frontend.
- Dockerized application running consistently across environments.
- CI pipeline passing before every merge.
- All Pull Requests reviewed and approved before merging into `develop`.
- MVP delivered within the agreed project timeline.