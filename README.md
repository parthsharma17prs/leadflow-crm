# LeadFlow CRM — VyorAI SDE Internship Evaluation

A full-stack CRM web application built for the **VyorAI SDE Internship Technical Evaluation**. It implements every single mandatory requirement (M01–M08) with a high-caliber UI/UX, strict data persistence, automated CSV lead uploads, Google OAuth + email/password authentication, and an optional **FastAPI + Python ML microservice**.

---

## 1. Compliance Checklist with Assignment Brief

| ID | Module / Requirement | Assignment Specification | Implementation Status & Evidence |
|:---:|:---|:---|:---|
| **M01** | **Authentication** | Register, log in, client logout and protected API routes. | ✅ **Complete**: Split-screen auth with email/password + bcryptjs + JWT tokens. Dedicated Google OAuth button with `@react-oauth/google`. Protected routes guard all private screens. |
| **M02** | **Lead Management** | Create, list, view, edit and delete leads; search by name/company; filter by stage. | ✅ **Complete**: Full lead catalog with real-time text search (name/company) and stage filter dropdown. Create, edit, and cascade-delete modals. Bulk CSV lead ingestion with pre-flight stats. |
| **M03** | **Pipeline** | Update lead stage using a dropdown or equivalent simple control. | ✅ **Complete**: 6-column pipeline Kanban board (*New*, *Contacted*, *Qualified*, *Proposal Sent*, *Won*, *Lost*) with direct stage dropdown controls on cards and instant MongoDB persistence. |
| **M04** | **Follow-ups** | Create a follow-up for a lead, list follow-ups and mark one complete. | ✅ **Complete**: Scheduled activities linked to lead IDs (Call, Email, Meeting, Task). Toggle complete/incomplete button with `completedAt` timestamp and visual overdue warning badges. |
| **M05** | **Dashboard** | Show total leads, active leads, won leads and pending/overdue follow-ups. | ✅ **Complete**: Real-time aggregated metrics computed directly from MongoDB Atlas. Dynamic Recharts pipeline distribution bar chart and activity status doughnut. |
| **M06** | **Security & Validation** | Server-side input validation, password hashing, authentication and record access checks. | ✅ **Complete**: Zod schema validation middleware on Express routes, bcryptjs (salt rounds 10), Bearer token verification, Helmet headers, CORS policies, and rate-limiting. |
| **M07** | **Persistence** | Persist users, leads and activities in MongoDB; data remains after refresh. | ✅ **Complete**: Cloud MongoDB Atlas database with schemas for Users, Leads, and Activities. Cascading deletions ensure data integrity. |
| **M08** | **Handover & Tests** | README, .env.example, basic test checklist and short demonstration. | ✅ **Complete**: Clean README, `.env.example` across all directories, automated test scripts (`test_e2e.sh` and `test_fastapi_pipelines.sh`), and sample leads CSV. |

---

## 2. Primary Workflow Verification

The primary evaluation workflow specified in the assignment is fully operational:
```text
Capture lead (Manual Modal or CSV Upload)
   ↓
View / Search / Update lead in Leads Table
   ↓
Change stage via Pipeline Kanban dropdown
   ↓
Schedule follow-up against the lead
   ↓
Complete follow-up & observe real-time metrics update on Dashboard
```

---

## 3. Technology Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, Axios, `@react-oauth/google`.
- **Backend API Gateway**: Node.js, Express.js (ES Modules), Mongoose, Zod, JWT, bcryptjs, multer.
- **Database**: MongoDB Atlas (`leadflow_crm` database).
- **Intelligence Microservice (Optional & Demonstrable)**: FastAPI (Python 3.9), PyMongo, Pandas (CSV analysis), scikit-learn (Linear Regression forecaster), fuzzywuzzy (duplicate detection).

```
[React + Vite (Port 5173)]
         │
         ▼ HTTP / REST
[Express.js Gateway (Port 5001)] ───► [MongoDB Atlas (leadflow_crm)]
         │                                       ▲
         ▼ (Proxy / Direct REST)                 │
[FastAPI Microservice (Port 8001)] ──────────────┘
 (Lead Scoring, Fuzzy Match, Pandas, Sklearn)
```

---

## 4. Quick Start & Execution

### Prerequisites
- Node.js (v20+)
- Python (3.9+)

### 1. Run Backend (Express Gateway — Port 5001)
```bash
cd backend
npm install
npm run dev
```

### 2. Run Frontend (React Vite — Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Run FastAPI Microservice (Optional — Port 8001)
```bash
cd fastapi_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001
```
Open Swagger UI at **`http://localhost:8001/docs`**.

---

## 5. Demo Credentials & Sample Data

- **Demo Admin Email**: `admin@leadflow.io`
- **Demo Password**: `password123`
*(Or click the "Autofill Demo Credentials" button on the login screen, or sign in directly with Google OAuth).*
- **Sample CSV for Upload**: `sample_leads.csv` included in project root and available via the **"Download Sample Template"** button on the Dashboard.

---

## 6. Automated Test Suites

Run the end-to-end test scripts from the root directory:
```bash
# 1. Express backend & MongoDB Atlas tests (CRUD, Auth, Pipeline, CSV upload)
./test_e2e.sh

# 2. FastAPI microservice & Python pipelines test suite
./test_fastapi_pipelines.sh
```
Both test scripts execute live HTTP requests against running services and assert strict JSON response structures.
