# DevBoard — Frontend Client

DevBoard is a modern, multi-tenant workspace and project management platform built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**. 

The frontend is engineered as a decoupled, high-performance client interface communicating with a standalone **Express REST API** backend live at [devboard-platform-backend.onrender.com](https://devboard-platform-backend.onrender.com).

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React Server Components, client-side routing, Turbopack |
| **UI Library** | React 19 / React DOM 19 | Modern hooks and concurrent rendering |
| **Styling** | Tailwind CSS v4 | CSS-first `@theme inline` with OKLCH color space |
| **UI Primitives** | `@base-ui/react` (Base-Rhea) | Headless, accessible primitives (WAI-ARIA compliant) |
| **State & Fetching**| TanStack React Query v5 | Cache synchronization and mutation handling |
| **Forms & Validation**| React Hook Form + Zod | Strict schema validation with `@hookform/resolvers/zod` |
| **Notifications** | Sonner | Modern toast notifications |
| **Icons** | Lucide React | Consistent UI iconography |

---

## Architectural Highlights

### 1. Pure Client Architecture
The frontend contains **zero Next.js API routes** and **zero Prisma database schemas**. All business logic, authorization checks, and data persistence reside exclusively in the standalone Express backend.

### 2. Dual-Token Security Model
- **In-Memory Access Token (JWT):** The 15-minute access token is stored strictly in JavaScript heap memory (`src/lib/api-client.ts`), never in `localStorage` or `sessionStorage`, protecting it from Cross-Site Scripting (XSS) exfiltration.
- **HttpOnly Refresh Token:** The 7-day refresh token is managed in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie inaccessible to JavaScript.
- **CSRF Defense:** State-mutating API calls transmit credentials via explicit `Authorization: Bearer <token>` headers rather than relying on automatic ambient cookie submission.

### 3. Silent Re-Authentication on App Mount
Browser reloads wipe in-memory tokens. The application avoids Flash of Unauthenticated Content (FOUC) by:
1. Initializing `AuthContext` with `isLoading = true`.
2. Automatically dispatching `POST /auth/refresh` on client mount with `credentials: "include"`.
3. Restoring the user profile and in-memory access token seamlessly before rendering protected routes.

### 4. 401 Interceptor with Promise Concurrency Queue
When the access token expires, multiple parallel queries would typically trigger multiple refresh requests simultaneously. Because the backend enforces single-use refresh token rotation, concurrent refresh calls would trigger security token-theft alarms. 

The custom `apiClient` solves this with an internal concurrency queue:
- The first 401 request pauses and dispatches `POST /auth/refresh`.
- Concurrent 401 requests are pushed into a pending subscribers queue.
- Once the token rotates, the new token updates in memory, the queue drains, and all requests are replayed with the new Bearer header.

### 5. OKLCH Color System
DevBoard leverages Tailwind CSS v4's OKLCH color model. Unlike standard HSL or RGB, OKLCH provides **perceptual uniformity** across all color hues, ensuring predictable contrast ratios and clean, consistent light and dark themes.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx         # Centered authentication layout
│   │   ├── sign-in/page.tsx   # Login page
│   │   └── sign-up/page.tsx   # Registration page
│   ├── dashboard/
│   │   └── page.tsx           # Protected workspace dashboard entry point
│   ├── globals.css            # Tailwind v4 @theme inline + OKLCH variables
│   ├── layout.tsx             # Root layout with QueryClient, Auth, Theme, Sonner
│   └── page.tsx               # Root redirector based on auth state
├── components/
│   ├── providers/
│   │   ├── query-provider.tsx    # TanStack Query client provider
│   │   └── session-provider.tsx  # AuthProvider re-export
│   ├── theme-provider.tsx        # next-themes wrapper
│   └── ui/
│       ├── button.tsx         # Base UI button with CVA variants
│       ├── card.tsx           # Card container primitives
│       ├── field.tsx          # Accessible form field & error display
│       ├── input.tsx          # Base UI input with focus rings
│       ├── label.tsx          # Form label primitive
│       ├── separator.tsx      # Semantic divider
│       └── sonner.tsx         # Toast notification container
├── features/
│   └── auth/
│       ├── components/
│       │   ├── auth-guard.tsx            # Protected route wrapper
│       │   ├── sign-in-card.tsx          # Sign-in form with Zod validation
│       │   ├── sign-up-card.tsx          # Sign-up form with instant auth
│       │   └── social-auth-buttons.tsx   # Google & GitHub OAuth triggers
│       ├── context/
│       │   └── auth-context.tsx          # Auth provider & state machine
│       ├── hooks/
│       │   ├── use-login.ts              # TanStack login mutation
│       │   └── use-register.ts           # TanStack registration mutation
│       ├── schema.ts                     # Zod login & registration schemas
│       └── types.ts                      # User and AuthResponse types
├── lib/
│   ├── api-client.ts          # Typed fetch wrapper with 401 refresh queue
│   ├── constants.ts           # Route path constants
│   └── utils.ts               # clsx + twMerge helper (cn)
└── locales/
    └── en.ts                  # Centralized English copy dictionary
```

---

## Getting Started

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gurjung/devboard-platform-frontend.git
   cd devboard-platform-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_URL=https://devboard-platform-backend.onrender.com
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Scripts

- `npm run dev` — Starts the Next.js development server with Turbopack
- `npm run build` — Builds the optimized production bundle
- `npm run start` — Starts the production server
- `npx tsc --noEmit` — Runs static TypeScript type checking
- `npm run lint` — Runs ESLint checks

---

## Backend Reference

- **Live API Base URL:** `https://devboard-platform-backend.onrender.com`
- **Swagger Documentation:** `https://devboard-platform-backend.onrender.com/api-docs`
- **OpenAPI JSON Specification:** `https://devboard-platform-backend.onrender.com/api-docs/json`
