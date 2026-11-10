# DevBoard — Enterprise Frontend Client

<div align="center">

![Next.js 16.3.6](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)
![React 19.2.8](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![shadcn / Base UI](https://img.shields.io/badge/shadcn-Base_UI-111827?style=for-the-badge)
![TanStack Query v5](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

**A high-performance, WCAG Level AA accessible, multi-tenant workspace and project management platform built for modern engineering teams.**

[Live Production Backend](https://devboard-platform-backend.onrender.com) • [API Documentation (Swagger)](https://devboard-platform-backend.onrender.com/api-docs) • [OpenAPI Specification](https://devboard-platform-backend.onrender.com/api-docs/json)

</div>

---

## 🏛️ Architecture Overview

DevBoard Frontend is engineered as a **client-side single-page architecture (SPA)** built on the Next.js 16 App Router. It contains **zero Next.js backend API routes and zero database ORM dependencies**, communicating directly with the standalone Express REST + Socket.IO backend and Supabase Storage.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DevBoard Frontend Client                           │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │   Feature Modules     │  │   TanStack Query v5   │  │ shadcn / BaseUI │  │
│  │ (Auth/Workspaces/     │◄─┼─►│ (Infinite Caching,    │◄─┼─►│ Tailwind CSS v4 │  │
│  │  Projects/Tasks/Notif)│  │  Optimistic Updates)  │  │ (OKLCH Tokens)  │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └─────────────────┘  │
│              │                          │                                   │
│              ▼                          ▼                                   │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ API Client (api-client.ts)   │  │ Socket.IO Client (socket.ts)         │ │
│  │ • In-Memory Ephemeral Token  │  │ • Real-Time Task/Project/Member Sync │ │
│  │ • 401 Promise Refresh Queue  │  │ • Live Notification Feed             │ │
│  └──────────────┬───────────────┘  └──────────────────┬───────────────────┘ │
└─────────────────┼─────────────────────────────────────┼─────────────────────┘
                  │ HTTPS (Bearer + HttpOnly Cookie)    │ WebSocket (WSS)
                  ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                Standalone DevBoard Express Backend Engine                   │
│      (PostgreSQL + Prisma ORM + JWT Refresh Rotation + Socket.IO Rooms)     │
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
  - 📋 **Table View:** High-density tabular layout with inline status and priority badges, sortable columns, and keyboard navigation.
  - 📊 **Kanban Board:** Columnar workflow management powered by `@dnd-kit/core` and `@dnd-kit/sortable` with mouse and keyboard (`sortableKeyboardCoordinates`) drag-and-drop.
  - 📅 **Calendar View:** Monthly deadline grid plus an unscheduled backlog section for tracking deliverables.
- **Slide-Over Task Inspector:** Responsive right-side sheet (`EditTaskDialog`) with editable properties, due dates, descriptions, assignees, and inline delete confirmation.
- **Hybrid Search & Filter Pipeline:**
  - **Server-Side Filter Queries:** Dynamic server fetching for `Status`, `Priority`, `Assignee`, `Due Date`, and `Overdue` filters.
  - **Zero-Latency Keystroke Search:** Client-side memoized filtering across loaded task sets without triggering redundant network requests.
- **Cross-Project "My Tasks" View:** Workspace-wide aggregation of all tasks assigned to the authenticated user.
- **Optimistic Mutation Engine:** Instant UI updates with rollback protection on network degradation.

### 3. Real-Time Collaboration & Notification Center
- **Live Socket.IO Sync:** `SocketProvider` subscribes to workspace, project, and task rooms to automatically sync Kanban boards, member lists, and project metadata across clients.
- **Interactive Notification Bell:** Slide-down popover feed with unread counter badge, `All` / `Unread` filter tabs, mark-as-read, single-item dismissal, and real-time alert toasts.

### 4. Team Member, Invitation & Project Lifecycle
- **Member Directory & Governance:** Real-time member listings, role promotions/demotions, and guarded workspace ownership transfers.
- **Secure Token Invites:** Shareable invite links with a public invitation acceptance landing route (`/invite/[token]`).
- **Project & Workspace Settings:** Logo compression (`browser-image-compression`) + Supabase Storage uploads, renames, avatar fallbacks, and confirmation-guarded deletion danger zones.

### 5. Command Palette, Demo Sandbox & Chaos Simulation
- **Global Command Palette (`Cmd/Ctrl + K`):** Powered by `cmdk` for instant navigation across workspaces, projects, task views (`Table` / `Kanban` / `Calendar`), and theme preferences (`Dark` / `Light` / `System`).
- **Instant Demo Sandbox Access:** Built-in in-memory demo mode on `/sign-in` and `/sign-up` (`Alex Rivera` persona with seeded workspace, projects, members, and multi-stage tasks) for zero-dependency local previews.
- **Simulation & Chaos Engineering Dock:** Floating scenario runner (`SimulationFloatingDock`) supporting walkthrough tours and synthetic `500` / `429` / latency / offline resilience testing.

### 6. Accessibility (WCAG 2.1 / 2.2 Level AA) & Theme Architecture
- **Contrast-Verified Light & Dark OKLCH Tokens:** Explicit `--brand-text`, `--destructive-text`, `--border`, `--input`, and `--ring` tokens meeting `>= 4.5:1` text contrast and `>= 3:1` UI boundary/focus contrast, paired with subtle non-interactive surface hairlines.
- **Keyboard & Assistive Tech Semantics:** `"Skip to main content"` link targeting `<main id="main-content">`, labeled landmarks, unbroken `<h1>`–`<h3>` heading hierarchy, `inert` collapsed sidebar state, roving-`tabIndex` ARIA `tablist`/`tabpanel` project views, non-nested native `<button>` triggers, explicit `useId()` label/error/hint associations, and `>= 24x24px` interactive touch targets.
- **System Preference Resilience:** Respects `@media (prefers-reduced-motion: reduce)` and provides High Contrast fallbacks via `@media (forced-colors: active)`.

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

1. **In-Memory JWT Access Token:** Ephemeral 15-minute token held strictly in JavaScript module scope (`api-client.ts`), never persisted to `localStorage` or `sessionStorage`.
2. **HttpOnly Refresh Cookie:** 7-day refresh token stored in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie inaccessible to client-side scripts.
3. **401 Interceptor with Concurrency Queue:** Prevents race conditions during single-use refresh token rotation by intercepting `401` responses, pausing parallel requests, performing a single refresh call, and replaying queued requests.
4. **Silent Re-Authentication:** Seamless session restoration on browser refresh without Flash of Unauthenticated Content (FOUC).

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale & Architectural Choice |
|---|---|---|
| **Framework** | Next.js 16.3.6 (App Router) | Modern React architecture with Webpack default and optional Turbopack (`dev:turbo`) |
| **Runtime / UI** | React 19.2.8 / React DOM | Concurrent rendering, clean hooks compliance, and strict type checking |
| **Design System** | Tailwind CSS v4 + shadcn (`base-nova`) | CSS-first `@theme inline` tokens with perceptually uniform **OKLCH** palettes |
| **UI Primitives** | `@base-ui/react` | Headless, WAI-ARIA compliant accessible foundational components |
| **Server State** | TanStack React Query v5 | Infinite cursor pagination, optimistic mutations, and cache invalidation |
| **Real-Time** | Socket.IO Client (`socket.io-client`) | Multi-room live updates for tasks, projects, members, and notifications |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Smooth Kanban drag-and-drop with mouse, touch, and keyboard sensor support |
| **Command Menu** | `cmdk` | Fast `Cmd/Ctrl + K` keyboard command palette |
| **Form Engine** | React Hook Form + Zod v4 | Uncontrolled form state with strict schema validation and accessible inline alerts |
| **Media & Storage** | Supabase Storage + `browser-image-compression` | Client-side image optimization and hosted logo uploads |
| **Theming & UX** | `next-themes`, `date-fns` v4, `Lucide React`, `Sonner` | Seamless Dark/Light mode, date math, unified vector icons, and non-blocking toasts |

---

## 📂 Source Code Structure

The codebase is organized into **domain-driven feature modules** and shared UI primitives:

```
src/
├── app/                                       # Next.js App Router root
│   ├── (auth)/                                # Auth layout (Sign In, Sign Up)
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── dashboard/                             # Authenticated workspace shell & pages
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── page.tsx                           # Workspace resolver & dispatcher
│   │   ├── my-tasks/page.tsx                  # User tasks redirector
│   │   └── [workspaceSlug]/                   # Dynamic workspace tenant route
│   │       ├── page.tsx                       # Workspace overview & stats
│   │       ├── my-tasks/page.tsx              # Cross-project assigned tasks
│   │       ├── members/page.tsx               # Member directory & invites
│   │       ├── settings/page.tsx              # Workspace config & danger zone
│   │       └── projects/[projectSlug]/
│   │           ├── page.tsx                   # Table / Kanban / Calendar project board
│   │           └── settings/page.tsx          # Project config & danger zone
│   ├── invite/[token]/page.tsx                # Public invitation acceptance landing
│   ├── error.tsx                              # Global error boundary
│   ├── globals.css                            # Tailwind v4 OKLCH tokens & reduced-motion rules
│   ├── layout.tsx                             # Root layout (Providers, Toaster, Simulation Dock)
│   └── page.tsx                               # Entry auth redirector
│
├── components/
│   ├── dashboard/                             # App shell chrome
│   │   ├── command-palette.tsx                # Cmd/Ctrl + K quick switcher
│   │   ├── dashboard-shell.tsx                # Skip link, <main>, sidebar state wrapper
│   │   ├── navbar.tsx                         # Top bar, sidebar toggle, demo indicator
│   │   ├── navigation.tsx                     # Primary nav links
│   │   ├── sidebar.tsx                        # Responsive collapsible sidebar / mobile drawer
│   │   └── user-button.tsx                    # Account dropdown & sign-out trigger
│   ├── providers/                             # QueryProvider, SessionProvider, SocketProvider
│   ├── shared/                                # ConfirmDialog, FormDialog, DialogActions, Banners
│   ├── theme-provider.tsx & theme-toggle.tsx  # Theme switching wrapper & trigger
│   └── ui/                                    # shadcn / Base UI primitives (Button, Sheet, Tabs, Command, Select, Dialog, Field...)
│
├── features/                                  # Domain-driven feature modules
│   ├── auth/                                  # AuthProvider, AuthGuard, SignIn/SignUp cards, Zod schemas
│   ├── invites/                               # InviteMemberDialog, AcceptInviteCard, invite hooks
│   ├── notifications/                         # NotificationBell popover, live notification hooks
│   ├── projects/                              # ProjectForm, CreateProjectDialog, switcher & uploaders
│   ├── simulation/                            # Demo data, chaos interceptor, tour spotlights & floating dock
│   ├── tasks/                                 # Table/Kanban/Calendar views, FilterBar, Create/Edit sheets, constants
│   └── workspace/                             # Workspace overview cards, forms, switchers & member cards
│
├── hooks/
│   └── use-network-status.ts                  # Online/offline connectivity listener
│
├── lib/                                       # Core infrastructure & utilities
│   ├── api-client.ts                          # Typed API client with 401 refresh queue + chaos hooks
│   ├── constants.ts                           # Auth & navigation route constants
│   ├── socket.ts                              # Socket.IO client singleton
│   ├── supabase.ts                            # Supabase storage upload helper
│   └── utils.ts                               # Tailwind class merging (`cn`)
│
└── locales/
    └── en.ts                                  # Centralized application copy dictionary
```

---

## ⚡ Performance Engineering

1. **Flexible Bundling:** Deterministic Webpack builds by default (`npm run dev` / `npm run build`), with opt-in Turbopack scripts (`dev:turbo` / `build:turbo`) for fast incremental local HMR.
2. **Infinite Cursor Pagination:** Efficient data windowing with TanStack Query's `useInfiniteQuery`, eliminating deep offset database scans.
3. **Decoupled Search Pipeline:** Typing into task search operates in-memory via `useMemo`, preventing redundant network query invalidations while keeping server-side filtering for categorical facets.
4. **Board Column Containment:** Kanban columns apply `content-visibility: auto` and `contain-intrinsic-size` (`.board-column` in `src/app/globals.css`) to avoid cross-board layout reflows during drag-and-drop.
5. **Optimistic UI Updates:** Instant mutation feedback with automatic rollback handling on request failures.
6. **Perceptually Uniform Themes:** OKLCH color coordinates guarantee consistent WCAG contrast across dark and light modes.

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
   Copy `.env.example` to `.env.local` in the root directory and adjust values for your local or deployed backend:
   ```env
   # Backend REST API & WebSocket Endpoints (e.g., http://localhost:5001 for local backend)
   NEXT_PUBLIC_API_URL=https://devboard-platform-backend.onrender.com
   NEXT_PUBLIC_WS_URL=https://devboard-platform-backend.onrender.com

   # Supabase Storage (Required for project & workspace logo uploads)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

   > **Quick Local Preview (No Backend Required):** Click **Instant Demo Sandbox Access** on `/sign-in` to launch a fully populated workspace (`Alex Rivera` persona) entirely in memory, or register a fresh account on `/sign-up` when running your backend API locally.

---

## 📜 Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts local Next.js development server (Webpack) |
| `npm run dev:turbo` | Starts local Next.js development server with Turbopack |
| `npm run build` | Compiles optimized production bundle (Webpack) |
| `npm run build:turbo` | Compiles optimized production bundle with Turbopack |
| `npm run start` | Serves production build locally |
| `npm run lint` | Executes ESLint analysis across `src/` |
| `npx tsc --noEmit` | Runs strict TypeScript type-checking without emitting files |

---

## 🔗 Backend API Reference

The frontend integrates with the DevBoard REST + Socket.IO backend:
- **Base URL:** `https://devboard-platform-backend.onrender.com`
- **Interactive Swagger Docs:** [devboard-platform-backend.onrender.com/api-docs](https://devboard-platform-backend.onrender.com/api-docs)
- **OpenAPI 3.0 Schema:** [devboard-platform-backend.onrender.com/api-docs/json](https://devboard-platform-backend.onrender.com/api-docs/json)
