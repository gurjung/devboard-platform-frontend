# DevBoard Backend — Simulation & Chaos Engineering Blueprint

This specification documents the backend architecture, endpoints, middleware, and Prisma services required for the standalone Express.js + Prisma backend engine (`devboard-platform-backend`).

---

## 1. Architecture & Middleware Flow

```
HTTP Client (DevBoard Frontend)
      │
      ▼ (Includes Optional Headers: x-simulate-fault, x-simulate-delay, x-simulate-rate-limit)
┌─────────────────────────────────────────────────────────────┐
│                 Express Request Pipeline                    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  1. cors() + cookieParser() + json()                │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  2. Chaos Engineering Middleware                    │   │
│   │     (src/middleware/chaos.middleware.ts)            │   │
│   │     • Inspects simulation headers                   │   │
│   │     • Injects synthetic delay/latency               │   │
│   │     • Injects synthetic 500, 429, 401, 403 errors   │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ (Normal / Non-Faulted Path)  │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  3. Simulation Router (/api/v1/simulation)          │   │
│   │     • POST /simulation/seed                         │   │
│   │     • POST /simulation/teardown                     │   │
│   │     • POST /simulation/burst-test                   │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  4. Prisma ORM + PostgreSQL Database               │   │
│   │     • Ephemeral Sandbox Tenant Seeds                │   │
│   │     • Batch Task Cascade Deletions                  │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Express Chaos Middleware Implementation

**File:** `src/middleware/chaos.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";

export interface ChaosRequestHeaders {
  "x-simulate-fault"?: string; // "500" | "429" | "401" | "403"
  "x-simulate-delay"?: string; // e.g. "2000" (milliseconds)
  "x-simulate-rate-limit"?: string; // "true"
}

export const chaosMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Security guard: Ensure chaos middleware only activates in non-production environments
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SIMULATION_IN_PROD) {
    return next();
  }

  const faultHeader = req.headers["x-simulate-fault"] as string | undefined;
  const delayHeader = req.headers["x-simulate-delay"] as string | undefined;

  // 1. Artificial Latency Simulation
  if (delayHeader) {
    const delayMs = parseInt(delayHeader, 10);
    if (!isNaN(delayMs) && delayMs > 0 && delayMs <= 10000) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // 2. Artificial Fault Status Injection
  if (faultHeader) {
    const statusCode = parseInt(faultHeader, 10);

    if (statusCode === 500) {
      res.status(500).json({
        success: false,
        error: {
          code: "ERR_CHAOS_INTERNAL_SERVER_ERROR",
          message: "Database transaction deadlock: simulated chaos failure.",
        },
      });
      return;
    }

    if (statusCode === 429) {
      res.setHeader("Retry-After", "3");
      res.status(429).json({
        success: false,
        error: {
          code: "ERR_CHAOS_RATE_LIMIT",
          message: "Too Many Requests: Rate quota exceeded. Retry after 3 seconds.",
          retryAfterSec: 3,
        },
      });
      return;
    }

    if (statusCode === 401) {
      res.status(401).json({
        success: false,
        error: {
          code: "ERR_CHAOS_UNAUTHORIZED",
          message: "Access token expired (Simulated 401).",
        },
      });
      return;
    }

    if (statusCode === 403) {
      res.status(403).json({
        success: false,
        error: {
          code: "ERR_CHAOS_FORBIDDEN",
          message: "Insufficient permissions for this resource (Simulated 403).",
        },
      });
      return;
    }
  }

  return next();
};
```

---

## 3. Simulation Controller Implementation

**File:** `src/controllers/simulation.controller.ts`

```typescript
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedSandboxWorkspace = async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId } = req.body;

    const sampleTasks = [
      { title: "Implement Redis Cache Layer", status: "TODO", priority: "HIGH" },
      { title: "Configure SAML 2.0 Identity Provider", status: "TODO", priority: "URGENT" },
      { title: "Optimize Docker Multi-Stage Build", status: "IN_PROGRESS", priority: "MEDIUM" },
      { title: "Refactor API Rate Limiter Middleware", status: "IN_PROGRESS", priority: "HIGH" },
      { title: "Audit Tailwind v4 OKLCH Palettes", status: "IN_REVIEW", priority: "LOW" },
      { title: "Migrate JWT Refresh Rotation to HttpOnly", status: "DONE", priority: "URGENT" },
      { title: "Setup Database Read Replicas", status: "DONE", priority: "HIGH" },
    ];

    if (workspaceId && projectId) {
      // Create tasks inside targeted project
      const created = await Promise.all(
        sampleTasks.map((task) =>
          prisma.task.create({
            data: {
              title: task.title,
              status: task.status as any,
              priority: task.priority as any,
              projectId,
              createdById: req.user?.id || "simulation-system-user",
            },
          })
        )
      );

      return res.status(201).json({
        success: true,
        message: "Sandbox seeded successfully",
        tasksCount: created.length,
        projectsCount: 1,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Simulation parameters verified",
      tasksCount: sampleTasks.length,
      projectsCount: 1,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to seed simulation sandbox",
    });
  }
};

export const teardownSandboxWorkspace = async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId } = req.body;

    if (projectId) {
      await prisma.task.deleteMany({
        where: { projectId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sandbox test data purged cleanly.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to teardown sandbox",
    });
  }
};
```

---

## 4. Route Registration

**File:** `src/routes/simulation.routes.ts`

```typescript
import { Router } from "express";
import {
  seedSandboxWorkspace,
  teardownSandboxWorkspace,
} from "../controllers/simulation.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/seed", authenticate, seedSandboxWorkspace);
router.post("/teardown", authenticate, teardownSandboxWorkspace);
router.post("/burst-test", (req, res) => {
  res.json({ success: true, timestamp: Date.now() });
});

export default router;
```

Mount in main `src/app.ts`:
```typescript
import simulationRoutes from "./routes/simulation.routes";
import { chaosMiddleware } from "./middleware/chaos.middleware";

// Attach Chaos Middleware globally (evaluates simulation headers)
app.use(chaosMiddleware);

// Attach Simulation Router
app.use("/api/v1/simulation", simulationRoutes);
```

---

## 5. OpenAPI 3.0 Specification Fragment

```yaml
paths:
  /simulation/seed:
    post:
      summary: Ingests mock sandbox tasks into a project
      tags:
        - Simulation
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                workspaceId:
                  type: string
                projectId:
                  type: string
      responses:
        201:
          description: Seed data generated
  /simulation/teardown:
    post:
      summary: Purges simulation tasks from a project
      tags:
        - Simulation
      responses:
        200:
          description: Sandbox cleaned
```

