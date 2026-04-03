# 🛂 PassportEase — Online Passport Application System

A full-stack web application that digitizes the Indian passport application process. Users can register, fill multi-step application forms with auto-save, upload supporting documents, book PSK (Passport Seva Kendra) appointments, and receive application receipts — all through a modern, responsive interface.

> **Built for:** Anshumat Foundation Internship Task

---

## 📑 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Design Approach](#-design-approach)
- [Screenshots](#-screenshots)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **User Authentication** | Custom authentication via bcrypt + JWT tokens (Supabase used strictly for database) |
| **Multi-Step Application Form** | 5-step wizard (Personal → Family → Address → Travel → Review) |
| **Auto-Save Drafts** | Form data auto-saves every 10 seconds so users never lose progress |
| **Document Upload** | Upload ID proof, address proof, passport photo, and signature with format validation |
| **PSK Appointment Booking** | Browse nearest PSK locations, select date (excludes Sundays), and pick a time slot |
| **Application Tracking** | Dashboard to view all applications with status badges (Draft, Submitted, Under Review, Ready) |
| **Confirmation & Receipt** | Post-submission summary with copyable Application ID and downloadable receipt |
| **Responsive Design** | Fully responsive across desktop, tablet, and mobile |
| **Animated UI** | Smooth page transitions, staggered animations, and micro-interactions via Framer Motion |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Justification |
|------------|---------|---------------|
| **React** | 18.2 | Component-based architecture enables reusable UI elements across the multi-step form, dashboard, and shared layouts. Virtual DOM ensures efficient re-renders during auto-save operations. |
| **Vite** | 5.0 | Lightning-fast HMR (Hot Module Replacement) for development. Significantly faster build times compared to CRA/Webpack, with native ES module support. |
| **React Router** | 6.20 | Declarative routing for the multi-page flow (Landing → Signup → Dashboard → Form → Documents → Appointment → Confirmation). Supports dynamic route params for application IDs. |
| **Tailwind CSS** | 3.3 | Utility-first CSS framework that accelerates UI development. Eliminates context-switching between component and stylesheet files. Custom theme tokens extend the design system. |
| **Framer Motion** | 10.16 | Production-ready animation library for React. Powers page transitions, staggered list animations, floating elements, and micro-interactions without complex CSS keyframes. |
| **Axios** | 1.6 | Promise-based HTTP client with interceptor support. Request interceptors automatically attach JWT tokens to every API call. Cleaner API than native `fetch` for error handling. |
| **Lucide React** | 0.294 | Lightweight, tree-shakeable icon library. Consistent icon style across the interface without adding heavy SVG bundles. |

### Backend

| Technology | Version | Justification |
|------------|---------|---------------|
| **Node.js** | 18+ | JavaScript runtime enabling full-stack JS development. Non-blocking I/O handles concurrent API requests efficiently. |
| **Express** | 4.18 | Minimal, unopinionated web framework. Lightweight footprint is ideal for a REST API server — no unnecessary abstractions. |
| **Supabase JS** | 2.38 | Official client for Supabase. Provides typed methods for database queries, auth operations, and file storage — all through a single SDK. |
| **JSON Web Token** | 9.0 | Stateless authentication — the server doesn't need to store sessions. Tokens encode user ID and email, with 7-day expiry for convenience. |
| **Multer** | 1.4 | Middleware for handling `multipart/form-data` file uploads. Buffers files to disk before forwarding to Supabase Storage. |
| **bcrypt** | 5.1 | Industry-standard password hashing with salt rounds. Included as a dependency for potential future local auth fallback. |
| **dotenv** | Latest | Loads environment variables from `.env` file. Keeps secrets (API keys, JWT secret) out of source code. |

### Database & Infrastructure

| Technology | Justification |
|------------|---------------|
| **Supabase (PostgreSQL)** | Managed PostgreSQL with Storage and real-time capabilities. Free tier is sufficient for development. Eliminates the need to self-host a database server. Auth/RLS features are not used; the Express backend handles all security. |
| **Custom Auth** | Handles user registration, and password hashing using bcrypt. |
| **Supabase Storage** | S3-compatible object storage for uploaded documents. Files are organized by `user_id/application_id/` for easy retrieval and cleanup. |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)             │
│                     localhost:5173                       │
│                                                         │
│  Landing → Signup/Login → Onboarding → Dashboard        │
│  → ApplicationForm (5 steps) → Documents → Appointment  │
│  → Confirmation                                         │
│                                                         │
│  Auth Context (JWT in localStorage)                     │
│  Axios Interceptors (auto-attach Bearer token)          │
└───────────────────────┬─────────────────────────────────┘
                        │ /api/* (Vite proxy)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                     │
│                   localhost:3001                         │
│                                                         │
│  REST API Routes:                                       │
│  • /api/auth/*         (register, login, me)            │
│  • /api/applications/* (CRUD + export)                  │
│  • /api/documents/*    (upload, list)                   │
│  • /api/appointments/* (book, locations)                │
│                                                         │
│  JWT Middleware (authenticateToken)                      │
│  Multer (file upload handling)                          │
└───────────────────────┬─────────────────────────────────┘
                        │ Supabase JS Client
                        │ (service_role key)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE (Cloud PostgreSQL)           │
│                                                         │
│  PostgreSQL:  profiles, applications, documents,        │
│               appointments                              │
│  Storage:     Document file uploads (S3-compatible)     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Anshumat Foundation/
├── README.md
│
├── frontend/                      # React + Vite Frontend
│   ├── index.html                 # Entry point (loads /src/main.jsx)
│   ├── package.json
│   ├── vite.config.js             # Dev server config + API proxy to :3001
│   ├── tailwind.config.js         # Custom theme (colors, fonts, animations)
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx               # React DOM root
│       ├── App.jsx                # Router + AuthProvider wrapper
│       ├── index.css              # Global styles, CSS variables, custom components
│       ├── api/
│       │   └── index.js           # Axios instance + API service functions
│       ├── context/
│       │   └── AuthContext.jsx    # Auth state management (login/register/logout)
│       └── pages/
│           ├── Landing.jsx        # Marketing landing page with hero + features
│           ├── Login.jsx          # Email/password login form
│           ├── Signup.jsx         # Two-step registration (credentials → profile)
│           ├── Onboarding.jsx     # Pre-application checklist + document requirements
│           ├── Dashboard.jsx      # Application list, status tracking, quick actions
│           ├── ApplicationForm.jsx # 5-step wizard with auto-save every 10s
│           ├── Documents.jsx      # Document upload interface (4 document types)
│           ├── Appointment.jsx    # PSK location selector + date/time picker
│           └── Confirmation.jsx   # Success page with receipt + next steps
│
├── backend/                       # Express API Server
│   ├── server.js                  # All routes, middleware, Supabase client
│   ├── schema.sql                 # Full database schema (tables, RLS, triggers)
│   ├── package.json
│   ├── .env                       # Environment variables (not committed)
│   └── .gitignore                 # Excludes .env, node_modules, uploads
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Supabase account** ([sign up free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Anshumat Foundation"
```

### 2. Demo User Seed (Evaluation Requirement)

To allow reviewers to test the app without registering, run the seed endpoint after the server starts:

**Demo Credentials**:
- **Email**: `hire-me@anshumat.org`
- **Password**: `HireMe@2025!`

To seed this user data (contains a profile and pre-populated dashboard applications), run:
```bash
curl -X POST http://localhost:3001/api/seed
```
Alternatively, just use the built-in frontend or API client to send a `POST` request to `/api/seed`.

### 3. Set Up Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Once the project is ready, go to **SQL Editor**
3. Copy the contents of `backend/schema.sql` and run it in the SQL Editor
4. This creates all tables (`profiles`, `applications`, `documents`, `appointments`) and the storage bucket.
5. *Note: Supabase Auth is intentionally bypassed in favor of a custom bcrypt/JWT implementation.*

### 3. Configure Backend Environment

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** and **`service_role` secret key**

```bash
cd backend
npm install
```

3. Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3001

# JWT
JWT_SECRET=your-secure-random-string-here

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...your-service-role-key
```

> ⚠️ **Important:** The backend uses the `service_role` key to interact with Supabase directly. All endpoint authorization is handled by Express middleware via custom JWTs.

### 4. Start the Backend

```bash
cd backend
npm start
```

Server starts at: `http://localhost:3001`

### 5. Set Up and Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

> The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:3001`, so the frontend and backend communicate seamlessly during development.

### 6. Verify

1. Open `http://localhost:5173` in your browser
2. Click "Get Started" to create an account
3. Fill in the registration form — you should be redirected to the dashboard
4. Start a new passport application and walk through all steps

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `3001`) |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens. Use a random 32+ character string. |
| `SUPABASE_URL` | **Yes** | Your Supabase project URL (e.g., `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key — grants full database access, bypassing RLS |

---

## 🗃 Database Schema

Four main tables, all with Row Level Security enabled:

```
┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│   profiles   │     │  applications │     │  documents   │
├──────────────┤     ├───────────────┤     ├─────────────┤
│ id (PK, FK)  │◄────│ user_id (FK)  │     │ id (PK)     │
│ email        │     │ id (PK)       │◄────│ app_id (FK) │
│ full_name    │     │ status        │     │ user_id(FK) │
│ dob          │     │ form_data     │     │ type        │
│ city         │     │ current_step  │     │ file_url    │
│ gender       │     │ created_at    │     │ uploaded_at │
│ created_at   │     │ updated_at    │     └─────────────┘
│ updated_at   │     └───────────────┘
└──────────────┘            │
                            │
                     ┌──────┴────────┐
                     │ appointments  │
                     ├───────────────┤
                     │ id (PK)       │
                     │ app_id (FK)   │
                     │ user_id (FK)  │
                     │ psk_location  │
                     │ appt_date     │
                     │ appt_time     │
                     │ booked_at     │
                     └───────────────┘
```

**Key design decisions:**
- `profiles` extends `auth.users` with a foreign key to Supabase's built-in auth table
- `applications.form_data` uses **JSONB** to flexibly store multi-step form data without rigid column structures
- `applications.status` is an enum-like CHECK constraint: `draft`, `submitted`, `under_review`, `ready`, `completed`
- A database trigger auto-creates a profile row when a new auth user is created
- All tables have `updated_at` triggers for automatic timestamp management

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user (creates auth user + profile) |
| `POST` | `/api/auth/login` | No | Login with email/password, returns JWT |
| `GET` | `/api/auth/me` | JWT | Get current user's profile |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/applications` | JWT | List all user's applications |
| `POST` | `/api/applications` | JWT | Create new draft application |
| `GET` | `/api/applications/:id` | JWT | Get application details + documents |
| `PUT` | `/api/applications/:id` | JWT | Update application (auto-save) |
| `GET` | `/api/applications/:id/export` | JWT | Get full application data for receipt |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/documents/upload` | JWT | Upload document (multipart/form-data) |
| `GET` | `/api/applications/:id/documents` | JWT | List documents for an application |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/psk/locations` | No | List available PSK locations |
| `POST` | `/api/appointments/book` | JWT | Book appointment slot |

### Utility
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Server health check |

---

## 🎨 Design Approach

### UI/UX Philosophy

The application uses a **warm, dark-themed design language** with amber/orange accents — intentionally chosen to feel premium and trustworthy for a government-adjacent service while remaining modern and approachable.

**Key design choices:**
- **Dark background** (`#0d0b09`) with warm amber accents (`#f59e0b`) creates a high-contrast, easy-to-read interface
- **Glassmorphism cards** with subtle borders and backdrop blur for depth
- **Progressive disclosure** in the appointment flow — date picker only appears after selecting a location, time slots appear after selecting a date
- **Multi-step wizard** with a visual progress bar and step-by-step completion indicators
- **Auto-save indicator** in the header gives users confidence that their data won't be lost

### Typography
- **Outfit** (Google Fonts) — primary font for headings and body text
- **Space Mono** — monospace font for Application IDs and code-like elements

### Animation Strategy
All animations use **Framer Motion** with a deliberate approach:
- **Page transitions** — fade + slide for smooth navigation between steps
- **Staggered list rendering** — items appear sequentially (100ms delay each) for a polished feel
- **Floating elements** — subtle hover animations on the landing page hero
- **Micro-interactions** — button hover effects, loading spinners, save indicators

### Responsive Design
- Mobile-first breakpoints via Tailwind (`sm:`, `md:`, `lg:`)
- Collapsible navigation elements on smaller screens
- Grid layouts that stack vertically on mobile

---

## 🔒 Security Considerations

- **Service role key** is only used server-side, never sent to the browser
- **JWT tokens** are stored in `localStorage` with 7-day expiry
- **RLS policies** enforce data isolation — users can only access their own records
- **File uploads** are scoped to `userId/applicationId/` paths in Supabase Storage
- **CORS** is enabled for cross-origin requests between frontend and backend

---

## 📝 License

This project was built as a task submission for the Anshumat Foundation internship program.
