# LeadFlow CRM — Postman API Testing Guide

Complete reference for testing every endpoint in the LeadFlow CRM backend.

---

## Table of Contents

- [Base URL & Environment Setup](#base-url--environment-setup)
- [Authentication Setup](#authentication-setup)
- [Auth Endpoints](#auth-endpoints)
- [Lead Endpoints](#lead-endpoints)
- [Activity / Follow-up Endpoints](#activity--follow-up-endpoints)
- [Dashboard Endpoint](#dashboard-endpoint)
- [Health Check](#health-check)
- [Validation Rules](#validation-rules)
- [Error Reference](#error-reference)
- [Recommended Test Flow](#recommended-test-flow)

---

## Base URL & Environment Setup

### 1. Create a Postman Environment

Go to **Environments → + New Environment** and add these variables:

| Variable   | Initial Value                    | Notes                        |
|------------|----------------------------------|------------------------------|
| `base_url` | `http://localhost:5001/api/v1`   | Change port if you modified it |
| `token`    | *(leave empty)*                  | Auto-filled after login      |
| `lead_id`  | *(leave empty)*                  | Fill after creating a lead   |

Select this environment from the top-right dropdown before testing.

### 2. Auto-save Token After Login

In the **Login** request → **Tests** tab, paste this script:

```js
const res = pm.response.json();
if (res.data && res.data.token) {
  pm.environment.set("token", res.data.token);
  console.log("✅ Token saved to environment");
}
```

### 3. Auto-save Lead ID After Create

In the **Create Lead** request → **Tests** tab:

```js
const res = pm.response.json();
if (res.data && res.data._id) {
  pm.environment.set("lead_id", res.data._id);
  console.log("✅ Lead ID saved:", res.data._id);
}
```

---

## Authentication Setup

All routes except **Register**, **Login**, and **Health Check** require a Bearer token.

For every protected request, go to the **Authorization** tab:

```
Type   → Bearer Token
Token  → {{token}}
```

**Tip:** Set this at the **Collection level** so all requests inherit it automatically:
Collection → Edit → Authorization → Bearer Token → `{{token}}`

---

## Auth Endpoints

### POST /auth/register

Creates a new user account.

```
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "password123"
}
```

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@test.com",
      "role": "agent"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation Rules:**
- `name` — min 2 characters, required
- `email` — valid email format, required, must be unique
- `password` — min 6 characters, required

---

### POST /auth/login

Authenticate with email and password.

```
POST {{base_url}}/auth/login
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john@test.com",
  "password": "password123"
}
```

**Demo credentials (pre-seeded):**
```json
{
  "email": "admin@leadflow.io",
  "password": "password123"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "agent" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /auth/google

Login or register via Google OAuth credential.

```
POST {{base_url}}/auth/google
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "credential": "<google_id_token_from_frontend>"
}
```

> **Note:** This token comes from the Google Identity Services button on the frontend. To test manually you need a real Google ID token — use the frontend login page for this flow.

---

### GET /auth/me

Returns the currently authenticated user's profile.

```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@test.com",
      "role": "agent",
      "authProvider": "local"
    }
  }
}
```

---

## Lead Endpoints

All lead routes require `Authorization: Bearer {{token}}`.

---

### GET /leads

Fetch all leads for the logged-in user.

```
GET {{base_url}}/leads
Authorization: Bearer {{token}}
```

**Optional Query Parameters:**

| Param    | Type   | Example            | Description                          |
|----------|--------|--------------------|--------------------------------------|
| `search` | string | `?search=acme`     | Searches name and company fields     |
| `stage`  | string | `?stage=Qualified` | Filter by pipeline stage             |

**Examples:**
```
GET {{base_url}}/leads
GET {{base_url}}/leads?search=john
GET {{base_url}}/leads?stage=New
GET {{base_url}}/leads?search=acme&stage=Qualified
```

**Success Response `200`:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "name": "Jane Smith",
      "company": "Acme Corp",
      "email": "jane@acme.com",
      "phone": "+1-555-0100",
      "stage": "New",
      "budget": 15000,
      "source": "Referral",
      "serviceInterest": "CRM Implementation",
      "createdAt": "..."
    }
  ]
}
```

---

### GET /leads/:id

Fetch a single lead with its associated activities.

```
GET {{base_url}}/leads/{{lead_id}}
Authorization: Bearer {{token}}
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "lead": { ... },
    "activities": [ ... ]
  }
}
```

---

### POST /leads

Create a new lead.

```
POST {{base_url}}/leads
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Jane Smith",
  "company": "Acme Corp",
  "email": "jane@acme.com",
  "phone": "+1-555-0100",
  "serviceInterest": "CRM Implementation",
  "source": "Referral",
  "budget": 15000,
  "stage": "New"
}
```

**Field Reference:**

| Field             | Type   | Required | Notes                                              |
|-------------------|--------|----------|----------------------------------------------------|
| `name`            | string | ✅ Yes   | Min 1 character                                    |
| `email`           | string | ⚠️ Either| Valid email. Required if no phone                  |
| `phone`           | string | ⚠️ Either| Required if no email                               |
| `company`         | string | No       | Defaults to empty string                           |
| `serviceInterest` | string | No       | Defaults to `"General CRM"`                        |
| `source`          | string | No       | Defaults to `"Direct"`                             |
| `budget`          | number | No       | Must be ≥ 0, defaults to `0`                       |
| `stage`           | string | No       | See valid stages below, defaults to `"New"`        |

**Valid `stage` values:**
`New` · `Contacted` · `Qualified` · `Proposal Sent` · `Won` · `Lost`

**Valid `source` values (recommended):**
`Direct` · `Referral` · `Website` · `LinkedIn` · `Inbound` · `CSV Import`

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": { "_id": "...", "name": "Jane Smith", ... }
}
```

---

### PATCH /leads/:id

Update one or more fields on an existing lead. Send only what you want to change.

```
PATCH {{base_url}}/leads/{{lead_id}}
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body examples:**

Move to next stage:
```json
{
  "stage": "Qualified"
}
```

Update budget and company:
```json
{
  "budget": 25000,
  "company": "New Corp Name"
}
```

Full update:
```json
{
  "name": "Jane Smith",
  "company": "Acme Corp",
  "email": "jane@acme.com",
  "phone": "+1-555-0100",
  "serviceInterest": "Enterprise Setup",
  "source": "LinkedIn",
  "budget": 30000,
  "stage": "Proposal Sent"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": { ... updated lead ... }
}
```

---

### DELETE /leads/:id

Delete a lead and all its associated activities (cascade delete).

```
DELETE {{base_url}}/leads/{{lead_id}}
Authorization: Bearer {{token}}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Lead and associated follow-ups deleted successfully"
}
```

---

### POST /leads/upload

Bulk import leads from a CSV file.

```
POST {{base_url}}/leads/upload
Authorization: Bearer {{token}}
Body: form-data
```

**Postman Setup:**
1. Body → **form-data**
2. Key: `file` → hover the key field and switch type from **Text** to **File**
3. Value: select your `.csv` file

**Required CSV columns:**
- `name` — required
- `email` or `phone` — at least one required

**Optional CSV columns:**
`company` · `phone` · `email` · `serviceInterest` · `source` · `budget` · `stage`

**Sample CSV content:**
```csv
name,company,email,phone,serviceInterest,source,budget,stage
Alice Johnson,TechCorp,alice@techcorp.com,+1-555-0101,CRM Setup,Website,12000,New
Bob Williams,StartupXYZ,,+1-555-0202,Consulting,Referral,5000,Contacted
Carol Davis,Enterprise Co,carol@ent.com,,Analytics,LinkedIn,50000,Qualified
```

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Successfully imported 3 leads!",
  "count": 3,
  "skippedCount": 0
}
```

---

## Activity / Follow-up Endpoints

All activity routes require `Authorization: Bearer {{token}}`.

---

### GET /activities

Fetch all activities for the logged-in user.

```
GET {{base_url}}/activities
Authorization: Bearer {{token}}
```

**Optional Query Parameters:**

| Param    | Type   | Example              | Description               |
|----------|--------|----------------------|---------------------------|
| `status` | string | `?status=Pending`    | `Pending` or `Completed`  |
| `leadId` | string | `?leadId=<id>`       | Filter by specific lead   |

**Examples:**
```
GET {{base_url}}/activities
GET {{base_url}}/activities?status=Pending
GET {{base_url}}/activities?status=Completed
GET {{base_url}}/activities?leadId={{lead_id}}
```

**Success Response `200`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "title": "Discovery Call",
      "type": "Call",
      "status": "Pending",
      "dueAt": "2026-11-15T10:00:00.000Z",
      "leadId": {
        "_id": "...",
        "name": "Jane Smith",
        "company": "Acme Corp",
        "stage": "New"
      }
    }
  ]
}
```

---

### POST /activities

Create a new follow-up activity linked to a lead.

```
POST {{base_url}}/activities
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "leadId": "{{lead_id}}",
  "title": "Discovery Call",
  "type": "Call",
  "dueAt": "2026-11-20T10:00:00.000Z",
  "status": "Pending"
}
```

**Field Reference:**

| Field    | Type   | Required | Notes                                      |
|----------|--------|----------|--------------------------------------------|
| `leadId` | string | ✅ Yes   | Must be a valid MongoDB ObjectId           |
| `title`  | string | ✅ Yes   | Min 1 character                            |
| `type`   | string | No       | `Call`, `Email`, `Meeting`, `Task`         |
| `dueAt`  | string | ✅ Yes   | ISO 8601 datetime string                   |
| `status` | string | No       | `Pending` or `Completed`, defaults to `Pending` |

**Valid `type` values:**
`Call` · `Email` · `Meeting` · `Task`

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Follow-up created successfully",
  "data": { "_id": "...", "title": "Discovery Call", ... }
}
```

---

### PATCH /activities/:id

Update an activity — typically used to mark as complete or reschedule.

```
PATCH {{base_url}}/activities/<activity_id>
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Mark as completed:**
```json
{
  "status": "Completed"
}
```

**Reopen / mark pending:**
```json
{
  "status": "Pending"
}
```

**Reschedule:**
```json
{
  "dueAt": "2026-12-01T14:00:00.000Z"
}
```

**Update multiple fields:**
```json
{
  "title": "Follow-up Demo Call",
  "type": "Meeting",
  "dueAt": "2026-12-05T09:30:00.000Z",
  "status": "Pending"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Follow-up updated successfully",
  "data": { ... updated activity ... }
}
```

---

## Dashboard Endpoint

### GET /dashboard/summary

Returns all metrics, chart data, recent leads, and upcoming/overdue follow-ups in one call.

```
GET {{base_url}}/dashboard/summary
Authorization: Bearer {{token}}
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalLeads": 24,
      "activeLeads": 18,
      "wonLeads": 4,
      "lostLeads": 2,
      "pendingFollowUps": 7,
      "overdueFollowUps": 2
    },
    "charts": {
      "leadsByStage": [
        { "stage": "New", "count": 6 },
        { "stage": "Contacted", "count": 5 },
        { "stage": "Qualified", "count": 4 },
        { "stage": "Proposal Sent", "count": 3 },
        { "stage": "Won", "count": 4 },
        { "stage": "Lost", "count": 2 }
      ],
      "followUpDistribution": [
        { "name": "Pending", "count": 5 },
        { "name": "Overdue", "count": 2 },
        { "name": "Completed", "count": 10 }
      ],
      "creationTrends": [ ... ]
    },
    "recentLeads": [ ... ],
    "upcomingFollowUps": [ ... ],
    "overdueList": [ ... ]
  }
}
```

---

## Health Check

### GET /health

Check if the server is running. No token required.

```
GET {{base_url}}/health
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "LeadFlow CRM API is running!",
  "data": {
    "status": "OK",
    "environment": "development"
  }
}
```

---

## Validation Rules

### Password
- Min 6 characters

### Email
- Must be valid format (e.g. `user@domain.com`)

### Lead
- `name` is always required
- At least one of `email` or `phone` must be present
- `budget` must be a number ≥ 0
- `stage` must be exactly one of: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`

### Activity
- `leadId` must be a valid MongoDB ObjectId that belongs to you
- `dueAt` must be a valid ISO 8601 datetime string
- `type` must be one of: `Call`, `Email`, `Meeting`, `Task`
- `status` must be one of: `Pending`, `Completed`

---

## Error Reference

| Status | Meaning                        | Common Cause                                      |
|--------|--------------------------------|---------------------------------------------------|
| `400`  | Bad Request                    | Validation failed, missing required fields        |
| `401`  | Unauthorized                   | No token, invalid token, or expired token         |
| `404`  | Not Found                      | Lead or activity doesn't exist or belongs to another user |
| `429`  | Too Many Requests              | Rate limit hit (300 req / 15 min per IP)          |
| `500`  | Internal Server Error          | Unexpected server error                           |

**Error response shape:**
```json
{
  "success": false,
  "message": "Description of what went wrong",
  "errors": [ { "field": "email", "message": "Invalid email address" } ]
}
```

---

## Recommended Test Flow

Run requests in this order for a complete end-to-end test:

```
1.  GET  /health                      → confirm server is up
2.  POST /auth/register               → create account
3.  POST /auth/login                  → get token (auto-saved by Tests script)
4.  GET  /auth/me                     → verify token works
5.  POST /leads                       → create a lead (auto-save lead_id)
6.  GET  /leads                       → list all leads
7.  GET  /leads?search=jane           → test search
8.  GET  /leads?stage=New             → test stage filter
9.  GET  /leads/{{lead_id}}           → get single lead with activities
10. PATCH /leads/{{lead_id}}          → update stage to "Qualified"
11. POST /activities                  → create follow-up for the lead
12. GET  /activities                  → list all activities
13. GET  /activities?status=Pending   → filter pending only
14. PATCH /activities/<id>            → mark as Completed
15. GET  /dashboard/summary           → verify all metrics updated
16. POST /leads/upload                → bulk import via CSV
17. DELETE /leads/{{lead_id}}         → delete lead + cascade activities
```

---

## Collection Structure

```
📁 LeadFlow CRM
├── 📁 Auth
│   ├── Register
│   ├── Login          ← run first, saves token automatically
│   ├── Google Login
│   └── Get Me
├── 📁 Leads
│   ├── Get All Leads
│   ├── Get All (search filter)
│   ├── Get All (stage filter)
│   ├── Get Lead by ID
│   ├── Create Lead    ← saves lead_id automatically
│   ├── Update Lead
│   ├── Delete Lead
│   └── Upload CSV
├── 📁 Activities
│   ├── Get All
│   ├── Get Pending
│   ├── Get by Lead ID
│   ├── Create Activity
│   └── Update Activity
├── 📁 Dashboard
│   └── Get Summary
└── Health Check
```

---

*Backend: Node.js + Express · Database: MongoDB Atlas · Auth: JWT (7d expiry) · Validation: Zod*
