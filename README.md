# DevBoard — Enterprise Frontend Client

<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Turbopack](https://img.shields.io/badge/Turbopack-Ready-000000?style=for-the-badge&logo=vercel)

**A high-performance, multi-tenant workspace and project management platform built for modern engineering teams.**

[Live Production Backend](https://devboard-platform-backend.onrender.com) • [API Documentation (Swagger)](https://devboard-platform-backend.onrender.com/api-docs) • [OpenAPI Specification](https://devboard-platform-backend.onrender.com/api-docs/json)

</div>

---

## 🏛️ Architecture Overview

DevBoard Frontend is engineered as a **pure client-side single-page architecture (SPA)** hosted on Next.js 16 App Router. It contains **zero Next.js backend API routes and zero database ORM dependencies**, operating completely decoupled from the standalone Express REST API.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DevBoard Frontend Client                           │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │   Feature Modules     │  │   TanStack Query v5   │  │   Base UI &     │  │
│  │ (Auth/Workspaces/     │◄─┼─►│ (Infinite Caching,    │◄─┼─►│  Tailwind v4    │  │
│  │  Projects/Tasks)      │  │  Optimistic Updates)  │  │  (OKLCH Tokens) │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └─────────────────┘  │
│              │                          │                                   │
│              ▼                          ▼                                   │
│  ┌──────────────────────────────────────────────────┐                       │
│  │   Type-Safe API Client (api-client.ts)           │                       │
│  │   • In-Memory Ephemeral Access Token (XSS-Safe)  │                       │
│  │   • 401 Interceptor with Promise Refresh Queue   │                       │
│  └──────────────────────────┬───────────────────────┘                       │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │ HTTPS / JSON (Bearer Token + HttpOnly Cookie)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                Standalone DevBoard Express Backend Engine                   │
│        (PostgreSQL + Prisma ORM + JWT Auth + Refresh Token Rotation)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Multi-Tenant Workspace Orchestration
- **Dynamic Slug Routing:** Deep URL mapping for seamless workspace navigation (`/dashboard/[workspaceSlug]`).
- **Workspace Switcher:** Instant tenant context switching with persistent user preferences.
- **Role-Based Access Control (RBAC):** Strict UI permission boundaries tailored for `OWNER`, `ADMIN`, and `MEMBER`.
- **Live Metrics Dashboard:** Aggregated stats for project progress, task completions, overdue counts, and team velocity.

### 2. Comprehensive Task Execution Engine
- **Multi-View Modes:**
  - 📋 **Table View:** High-density tabular layout with inline status, priority, and date editing.
  - 📊 **Kanban Board:** Columnar workflow management with instant drag-and-drop / stage transitions.
  - 📅 **Calendar View:** Monthly scheduling view for tracking deliverable deadlines and milestones.
- **Hybrid Search & Filter Pipeline:**
  - **Server-Side Filter Queries:** Dynamic server fetching for `Status`, `Priority`, `Assignee`, `Due Date`, and `Overdue` filters.
  - **Zero-Latency Keystroke Search:** Client-side memoized fuzzy search across loaded task sets without triggering redundant network requests.
  - **Explicit Filter Labels:** Clear inline category indicators (`Status:`, `Priority:`, `Assignee:`) for optimal user orientation.
- **Cross-Project "My Tasks" View:** Workspace-wide aggregation of all tasks assigned to the authenticated user.
- **Optimistic Mutation Engine:** Instant UI updates with rollback protection on network degradation.

### 3. Team Member & Invitation Lifecycle
- **Member Directory:** Real-time member listings with active role designations and avatar fallbacks.
- **Role Governance:** Granular role promotions, demotions, and guarded workspace ownership transfers.
- **Secure Token Invites:** Public invitation landing page (`/invite/[token]`) with automatic workspace onboarding.

### 4. Project & Space Management
- **Project Workspaces:** Dedicated spaces per project with customizable branding and logo upload workflows.
- **Granular Project Settings:** Lifecycle controls including project renames, avatar customisation, and deletion danger zones.

---

## 🔒 Security Architecture

### Dual-Token Authentication Lifecycle
DevBoard implements a security model resilient to both **XSS (Cross-Site Scripting)** and **CSRF (Cross-Site Request Forgery)** attacks:

```
[Browser Client]                                              [Backend API]
       │                                                            │
       │─── 1. POST /auth/login (Credentials) ────────────────────►│
       │◄── 2. Response: Access Token (Body) + Refresh Cookie ──────│
       │    (Token stored in JS memory, Cookie is HttpOnly)         │
       │                                                            │
       │─── 3. GET /projects/... (Authorization: Bearer <Token>) ──►│
       │◄── 4. 401 Unauthorized (Access Token Expired) ────────────│
       │                                                            │
       │─── 5. POST /auth/refresh (HttpOnly Cookie sent auto) ─────►│
       │       [Requests queued while refresh is in flight]         │
       │◄── 6. Response: New Access Token + Rotated Refresh Cookie ─│
       │                                                            │
       │─── 7. Replay original queued requests with new Bearer ────►│
       │◄── 8. 200 OK (Data returned transparently) ────────────────│
```

1. **In-Memory JWT Access Token:** Ephemeral 15-minute token held strictly in JavaScript module scope (`api-client.ts`), never exposed to `localStorage` or `sessionStorage`.
2. **HttpOnly Refresh Cookie:** 7-day refresh token stored in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie inaccessible to client-side scripts.
3. **401 Interceptor with Concurrency Queue:** Prevents race conditions during single-use refresh token rotation by intercepting 401 responses, pausing parallel requests, performing a single refresh call, and replaying queued requests.
4. **Silent Re-Authentication:** Seamless session restoration on browser refresh without Flash of Unauthenticated Content (FOUC).

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale & Architectural Choice |
|---|---|---|
| **Framework** | Next.js 16.3 (Turbopack) | Modern React Server Components architecture with rapid compilation |
| **Runtime / UI** | React 19 / React DOM 19 | Concurrent rendering, latest lifecycle primitives, and form actions |
| **Server State** | TanStack React Query v5 | Infinite cursor pagination, optimistic mutations, cache garbage collection |
| **Design System** | Tailwind CSS v4 | CSS-first `@theme inline` with perceptually uniform **OKLCH** color spaces |
| **UI Primitives** | `@base-ui/react` | Headless, fully accessible WAI-ARIA compliant foundational components |
| **Form Engine** | React Hook Form + Zod | High-performance uncontrolled form state with strict schema validation |
| **Date Engine** | date-fns v4 | Lightweight, immutable date formatting and overdue calculations |
| **Icons & Media** | Lucide React | Unified, tree-shakeable SVG iconography |
| **Toast System** | Sonner | Stackable, non-blocking toast notifications |

---

## 📂 Source Code Structure

The codebase is organized into **domain-driven feature modules** for high cohesion and maintainability:

```
src/
├── app/                                 # Next.js App Router root
│   ├── (auth)/                          # Unauthenticated layout (Sign In, Sign Up)
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── dashboard/                       # Authenticated core application layout
│   │   ├── [workspaceSlug]/             # Dynamic workspace tenant route
│   │   │   ├── members/page.tsx         # Workspace member management
│   │   │   ├── my-tasks/page.tsx        # Assigned tasks cross-project view
│   │   │   ├── projects/[projectSlug]/  # Project board, kanban, table, calendar
│   │   │   │   └── settings/page.tsx    # Project configuration & danger zone
│   │   │   ├── settings/page.tsx        # Workspace settings & branding
│   │   │   └── page.tsx                 # Workspace overview & metrics dashboard
│   │   ├── my-tasks/page.tsx            # Global user task redirection
│   │   └── page.tsx                     # Workspace resolver & tenant dispatcher
│   ├── invite/[token]/page.tsx          # Public invitation acceptance landing
│   ├── globals.css                      # Tailwind v4 theme & OKLCH color tokens
│   └── layout.tsx                       # Root layout (QueryClient, Auth, Themes)
│
├── components/                          # Shared cross-domain UI components
│   ├── providers/                       # QueryProvider, SessionProvider, ThemeProvider
│   ├── shared/                          # ConfirmDialog, EmptyStates, Skeletons
│   └── ui/                              # Headless primitives (Button, Select, Dialog, Card)
│
├── features/                            # Domain-driven feature modules
│   ├── auth/                            # Auth context, guards, mutations, schemas
│   ├── invites/                         # Invite dialogs, hooks, token actions
│   ├── projects/                        # Project forms, hooks, avatar resolvers
│   ├── tasks/                           # Table/Kanban/Calendar views, filters, hooks
│   │   ├── components/                  # TaskFilterBar, TaskTableView, TaskKanbanView
│   │   ├── hooks/                       # useTasks, useMyTasks, useCreateTask, useUpdateTask
│   │   ├── constants.ts                 # Status/Priority configs, colors, icons
│   │   └── types.ts                     # Task, TaskFilters, TaskView interfaces
│   └── workspace/                       # Workspace switchers, stats, member cards
│
├── lib/                                 # Core infrastructure & utilities
│   ├── api-client.ts                    # Typed API client with 401 refresh queue
│   ├── constants.ts                     # Application route definitions
│   └── utils.ts                         # Class merging (clsx + tailwind-merge)
│
└── locales/
    └── en.ts                            # Centralized application copy dictionary
```

---

## ⚡ Performance Engineering

1. **Turbopack Compilation:** Sub-second incremental builds and Instant Hot Module Replacement (HMR).
2. **Infinite Cursor Pagination:** Efficient data windowing with TanStack Query's `useInfiniteQuery`, eliminating deep offset database scans.
3. **Decoupled Search Pipeline:** Typing into search operates entirely in-memory via `useMemo`, preventing network query invalidations while keeping full server-side filtering for categorical facets.
4. **Optimistic UI Updates:** Instant mutation feedback with automatic rollback handling if backend updates fail.
5. **Perceptually Uniform Themes:** OKLCH color coordinates eliminate contrast degradation across dark and light viewing modes.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js:** `20.x` or higher (LTS recommended)
- **npm:** `10.x` or higher

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gurjung/devboard-platform-frontend.git
   cd devboard-platform-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Live Backend API Endpoint
   NEXT_PUBLIC_API_URL=https://devboard-platform-backend.onrender.com
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Compiles optimized production bundle with full static analysis |
| `npm run start` | Serves production build locally |
| `npm run lint` | Executes ESLint analysis |
| `npx tsc --noEmit` | Runs strict TypeScript type-checking without emitting files |

---

## 🔗 Backend API Reference

The frontend connects with the live DevBoard REST API backend:
- **Base URL:** `https://devboard-platform-backend.onrender.com`
- **Interactive Swagger Docs:** [devboard-platform-backend.onrender.com/api-docs](https://devboard-platform-backend.onrender.com/api-docs)
- **OpenAPI 3.0 Schema:** [devboard-platform-backend.onrender.com/api-docs/json](https://devboard-platform-backend.onrender.com/api-docs/json)
