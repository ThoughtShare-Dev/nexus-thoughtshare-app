# ThoughtShare Backend Team Design Guide

## Purpose

This document defines how the backend team will collaborate, structure the project, and deliver the MVP.

## Recommended Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Validation | Zod |
| Logging | Winston |
| API Docs | Swagger |
| Testing | Jest + Supertest |
| Linting | ESLint |
| Formatting | Prettier |
| Containerization | Docker |

## Repository Strategy

```
main
└── develop
    ├── feature/authentication
    ├── feature/profile
    ├── feature/skills
    ├── feature/search
    ├── feature/requests
    ├── feature/reviews
    └── feature/admin
```

Rules

- Protect `main` and `develop`.
- No direct commits to `main`.
- Merge only through Pull Requests.
- Require at least one review before merge.

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

## Database First

Core entities

- Member
- Skill
- MemberTeachingSkill
- MemberLearningSkill
- LearningRequest
- Review
- Report
- Notification
- Admin

Deliverables

- ER Diagram
- Prisma schema
- Initial migration
- Seed data

## API Contract

Authentication

- POST /auth/register
- POST /auth/login
- GET /auth/me

Profile

- GET /users/me
- PUT /users/profile

Skills

- GET /skills

Search

- GET /search

Learning Requests

- POST /requests
- PATCH /requests/:id/accept
- PATCH /requests/:id/decline

Reviews

- POST /reviews

Reports

- POST /reports

## Team Allocation

### Backend Engineer 1

- Authentication
- User Profile
- Middleware
- Validation
- Tests

### Backend Engineer 2

- Skills
- Search
- Learning Requests
- Notifications

### Backend Engineer 3

- Reviews
- Reports
- Admin
- Database
- Deployment support

## Development Timeline

### Week 1

- Project setup
- Folder structure
- Database design
- Authentication
- Swagger

### Week 2

- Profile
- Skills
- Search
- Requests

### Week 3

- Reviews
- Reports
- Notifications
- Admin

### Week 4

- Integration
- Testing
- Deployment
- Demo

## Engineering Standards

### Git

- Conventional Commits
- Feature branches
- Pull Requests only

### Commit Types

- feat:
- fix:
- docs:
- refactor:
- test:
- chore:

### Code Quality

- ESLint required
- Prettier required
- Unit tests for services
- Integration tests for APIs

## Immediate Action Checklist

- Finalize folder structure
- Choose Prisma
- Design database
- Create API contract
- Configure Docker
- Configure GitHub Actions
- Add Swagger
- Protect branches
- Assign module ownership
- Create GitHub Issues
- Create first migration
- Add `.env.example`

## Success Criteria

- Stable API contract
- Minimal merge conflicts
- Shared coding standards
- Complete MVP within the project timeline


