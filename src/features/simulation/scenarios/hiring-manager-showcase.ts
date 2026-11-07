import type { SimulationScenario, SimulationStepContext } from "../types";
import { toast } from "sonner";
import {
  addDemoTask,
  updateDemoTask,
  deleteDemoTask,
  addDemoProject,
  deleteDemoProject,
} from "../mock-demo-data";
import { apiClient } from "@/lib/api-client";
import type { InfiniteData } from "@tanstack/react-query";
import type { TasksResponse } from "@/features/tasks/types";

export const hiringManagerShowcaseScenario: SimulationScenario = {
  id: "hiring-manager-showcase",
  title: "Full Product Walkthrough",
  description:
    "Comprehensive, hands-free product walkthrough: covers Workspaces & Invites, Project Management, Task Engineering & Kanban, Multi-Facet Filters & Views, My Tasks, and Self-Healing Resilience.",
  category: "happy_path",
  estimatedDuration: "~3m",
  badge: "Interactive Tour",
  steps: [
    // ═════════════════════════════════════════════════════════════════════════
    // CHAPTER 1: WORKSPACES, VELOCITY ANALYTICS & MEMBER INVITES
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "step-1-workspace-overview",
      chapter: "1. Workspaces & Invites",
      title: "1. Workspace Analytics & Velocity Dashboard",
      description: "Navigates to workspace root and highlights multi-project aggregated analytics.",
      expectedOutcome: "Workspace statistics, total projects, and completion metrics rendered on screen.",
      highlights: [
        "Aggregates multi-project engineering velocity, task counts, and milestones in real time.",
        "Built with TanStack Query infinite caching with automatic background revalidation.",
        "Serves as the high-level executive command center for engineering leaders.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "1. Workspaces & Invites",
          title: "1. Workspace Analytics & Velocity Dashboard",
          explanation: "Viewing the workspace dashboard. DevBoard aggregates velocity metrics, completed deliverables, and active milestones across all projects in real time.",
          type: "info",
          highlights: [
            "Aggregates multi-project engineering velocity, task counts, and milestones in real time.",
            "Built with TanStack Query infinite caching with automatic background revalidation.",
            "Serves as the high-level executive command center for engineering leaders.",
          ],
          resilienceDetail: "Multi-tenant caching partitions workspace data with zero cross-tenant leakage.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("workspace-stats", "Active Focus: Real-Time Multi-Project Velocity Metrics");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-2-workspace-members",
      chapter: "1. Workspaces & Invites",
      title: "2. Team Roster & Role-Based Access Control",
      description: "Inspects the workspace team roster, avatars, and role tiers (Owner, Admin, Member).",
      expectedOutcome: "Member list rendered with role badges and permission controls.",
      highlights: [
        "Granular RBAC cleanly separates Owners, Admins, and Members across workspace actions.",
        "Member cards display verified avatars, initials fallback, and assigned deliverable metrics.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "1. Workspaces & Invites",
          title: "2. Team Roster & Role-Based Access Control (RBAC)",
          explanation: "Navigating to the Team Members view. DevBoard provides clear role separation (Owner, Admin, Member) and permissions.",
          type: "info",
          highlights: [
            "Granular RBAC cleanly separates Owners, Admins, and Members across workspace actions.",
            "Member cards display verified avatars, initials fallback, and assigned deliverable metrics.",
          ],
          resilienceDetail: "Permission checks evaluate client-side for instant UI feedback and verify server-side on every mutation.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/members");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("members-list", "Active Focus: Team Member Roster & RBAC Roles");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-3-workspace-invite-generation",
      chapter: "1. Workspaces & Invites",
      title: "3. Cryptographic Workspace Invite Links",
      description: "Generates a secure, shareable workspace invitation token with instant clipboard copying.",
      expectedOutcome: "Invite link generated with token and confirmation notification displayed.",
      highlights: [
        "Admins can dispatch email invitations or generate cryptographically signed one-time invite tokens.",
        "Tokens feature configurable expiration windows and can be regenerated or revoked instantly to protect enterprise data.",
      ],
      delayMs: 4000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "1. Workspaces & Invites",
          title: "3. Cryptographic Workspace Invite Generation",
          explanation: "Generating a secure, shareable invite link with token expiration for new team onboarding.",
          type: "success",
          highlights: [
            "Admins can dispatch email invitations or generate cryptographically signed one-time invite tokens.",
            "Tokens feature configurable expiration windows and can be regenerated or revoked instantly to protect enterprise data.",
          ],
          resilienceDetail: "Tokenized invite architecture prevents unauthorized workspace enumeration.",
        });

        ctx.setSpotlight("invite-section", "Active Focus: Single-Use Cryptographic Invite Token");
        toast.info("Generating secure invite link for 'sarah.connor@enterprise.io'...");
        await ctx.sleep(1200);

        try {
          await apiClient.post("/workspaces/ws-demo-corp/invites", {
            email: "sarah.connor@enterprise.io",
            role: "MEMBER",
          });
        } catch {}

        toast.success("Invite Link Generated: /invite/demo-invite-token-okta-azure (Copied!)");
        await ctx.sleep(2000);
      },
    },
    {
      id: "step-4-public-invite-accept",
      chapter: "1. Workspaces & Invites",
      title: "4. Public Member Onboarding View",
      description: "Navigates to the public /invite/[token] onboarding card showing inviter details.",
      expectedOutcome: "Public-safe invite accept card rendered on screen.",
      highlights: [
        "Prospective team members land on a dedicated, public-safe accept view with inviter details and workspace branding.",
        "One-click acceptance securely attaches the user to the workspace with immediate cache reconciliation.",
      ],
      delayMs: 3800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "1. Workspaces & Invites",
          title: "4. Public Member Onboarding View (/invite/[token])",
          explanation: "Navigating to the invite acceptance card. Prospective members get a clean, zero-friction invitation portal.",
          type: "info",
          highlights: [
            "Prospective team members land on a dedicated, public-safe accept view with inviter details and workspace branding.",
            "One-click acceptance securely attaches the user to the workspace with immediate cache reconciliation.",
          ],
          resilienceDetail: "Zero-auth endpoint: validates token authenticity without exposing internal database structures.",
        });

        if (ctx.navigate) {
          ctx.navigate("/invite/demo-invite-token-okta-azure");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("accept-invite-card", "Active Focus: Public Frictionless Onboarding Portal");
        await ctx.sleep(2200);
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // CHAPTER 2: MULTI-PROJECT MANAGEMENT & SETTINGS
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "step-5-project-navigation",
      chapter: "2. Projects & Architecture",
      title: "5. Multi-Project Engineering Workspaces",
      description: "Navigates to the core engineering project board.",
      expectedOutcome: "Active project board rendered with Kanban columns.",
      highlights: [
        "Workspaces partition engineering work across concurrent projects (Platform Core, Mobile App).",
        "Sidebar and switcher support rapid 1-click project switching with persistent route state.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "2. Projects & Architecture",
          title: "5. Multi-Project Engineering Workspaces",
          explanation: "Navigating back into the Platform Core project. Workspaces support multiple isolated project backlogs under one roof.",
          type: "info",
          highlights: [
            "Workspaces partition engineering work across concurrent projects (Platform Core, Mobile App).",
            "Sidebar and switcher support rapid 1-click project switching with persistent route state.",
          ],
          resilienceDetail: "Project route parameters (?view=kanban) preserve view preferences across navigation.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("project-header", "Active Focus: Multi-Project Workspace Partitioning");
        await ctx.sleep(2000);
      },
    },
    {
      id: "step-6-create-project",
      chapter: "2. Projects & Architecture",
      title: "6. Dynamic Project Creation",
      description: "Creates 'Cloud Native Edge API' project with automatic cache synchronization.",
      expectedOutcome: "New project created and immediately accessible across switcher and sidebar.",
      highlights: [
        "Teams can spin up new projects with custom slugs, descriptions, and icon assets.",
        "New projects reflect immediately in the switcher and sidebar without full page reloads.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "2. Projects & Architecture",
          title: "6. Dynamic Project Creation",
          explanation: "Simulating creation of a new project: 'Cloud Native Edge API'. Watch it register in the project roster.",
          type: "info",
          highlights: [
            "Teams can spin up new projects with custom slugs, descriptions, and icon assets.",
            "New projects reflect immediately in the switcher and sidebar without full page reloads.",
          ],
          resilienceDetail: "React Query invalidation synchronizes project lists across header, sidebar, and switcher simultaneously.",
        });

        addDemoProject({
          name: "Cloud Native Edge API",
          slug: "cloud-native-edge",
        });

        await ctx.queryClient.invalidateQueries({ queryKey: ["projects"] });
        ctx.setSpotlight("project-header", "Active Focus: New Project 'Cloud Native Edge API'");
        toast.success("Project Created: 'Cloud Native Edge API'");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-7-project-settings",
      chapter: "2. Projects & Architecture",
      title: "7. Project Settings & Deletion Safeguards",
      description: "Inspects project settings, logo uploaders, and double-confirmation danger zones.",
      expectedOutcome: "Project settings page rendered with configuration options.",
      highlights: [
        "Project settings allow updating names, logo uploads, and danger-zone deletion safeguards.",
        "Deletion actions utilize double-confirmation prompts to prevent accidental production outages.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "2. Projects & Architecture",
          title: "7. Project Settings & Deletion Safeguards",
          explanation: "Viewing project settings. DevBoard provides logo uploaders, metadata editing, and double-confirmation danger zones.",
          type: "info",
          highlights: [
            "Project settings allow updating names, logo uploads, and danger-zone deletion safeguards.",
            "Deletion actions utilize double-confirmation prompts to prevent accidental production outages.",
          ],
          resilienceDetail: "Destructive mutations require explicit confirmation strings before server execution.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core/settings");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("project-settings", "Active Focus: Project Settings & Danger Zone Safeguards");
        await ctx.sleep(2000);

        // Clean up temporary project created in step 6
        deleteDemoProject("cloud-native-edge");
        await ctx.queryClient.invalidateQueries({ queryKey: ["projects"] });
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // CHAPTER 3: TASK ENGINEERING & KANBAN LIFECYCLE
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "step-8-create-task",
      chapter: "3. Tasks & Kanban",
      title: "8. Task Creation with Rich Typing (TODO)",
      description: "Creates 'GraphQL Gateway Federation' task with High priority and due date in TODO column.",
      expectedOutcome: "New highlighted task card rendered in the TODO column.",
      highlights: [
        "Tasks support full metadata: title, description, priority badges (Urgent/High/Med/Low), due dates, and assignee linking.",
        "New tasks appear in the Backlog or TODO column instantly via optimistic client caching.",
      ],
      delayMs: 4000,
      execute: async (ctx: SimulationStepContext) => {
        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
        }
        await ctx.sleep(1200);

        ctx.setStoryBanner({
          chapter: "3. Tasks & Kanban",
          title: "8. Task Creation with Rich Typing (TODO)",
          explanation: "Created 'GraphQL Gateway Federation' with HIGH priority. Notice the highlighted card in the TODO column.",
          type: "info",
          highlights: [
            "Tasks support full metadata: title, description, priority badges (Urgent/High/Med/Low), due dates, and assignee linking.",
            "New tasks appear in the Backlog or TODO column instantly via optimistic client caching.",
          ],
          resilienceDetail: "Zero-latency creation updates the local Kanban column immediately while persisting in the background.",
        });

        const newTask = addDemoTask({
          id: "task-showcase-1",
          title: "GraphQL Gateway Federation & Subgraph Stitching",
          description: "Apollo Gateway configured with Apollo Router and JWT claims validation.",
          status: "TODO",
          priority: "HIGH",
        });

        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page, idx) =>
                idx === 0
                  ? {
                      ...page,
                      tasks: [newTask, ...page.tasks.filter((t) => t.id !== newTask.id)],
                      totalCount: (page.totalCount || 0) + 1,
                    }
                  : page
              ),
            };
          }
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-showcase-1", "Active Focus: New Deliverable in TODO");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-9-drag-drop-kanban",
      chapter: "3. Tasks & Kanban",
      title: "9. Fluid Kanban Transitions & dnd-kit Physics",
      description: "Physically moves the task from TODO to IN_PROGRESS with animation.",
      expectedOutcome: "Card visibly transitions into the IN_PROGRESS column.",
      highlights: [
        "Kanban uses dnd-kit pointer sensors with distance activation constraints to cleanly separate clicks from drags.",
        "Cards animate fluidly between columns using hardware-accelerated CSS transforms.",
      ],
      delayMs: 4000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "3. Tasks & Kanban",
          title: "9. Fluid Kanban Transitions & dnd-kit Physics",
          explanation: "Developer pulls task into active development. Card physically slides from TODO to In Progress.",
          type: "info",
          highlights: [
            "Kanban uses dnd-kit pointer sensors with distance activation constraints to cleanly separate clicks from drags.",
            "Cards animate fluidly between columns using hardware-accelerated CSS transforms.",
          ],
          resilienceDetail: "Optimistic status update transitions the card on screen prior to remote network acknowledgment.",
        });

        updateDemoTask("task-showcase-1", { status: "IN_PROGRESS" });

        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                tasks: page.tasks.map((t) =>
                  t.id === "task-showcase-1" ? { ...t, status: "IN_PROGRESS" as const } : t
                ),
              })),
            };
          }
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-showcase-1", "Active Focus: Transitioned to In Progress ➔");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-10-edit-task",
      chapter: "3. Tasks & Kanban",
      title: "10. Task Detail Dialog & Priority Escalation",
      description: "Simulates opening task detail, editing description, and escalating priority to URGENT.",
      expectedOutcome: "Task priority badge updates to URGENT with amber badge styling.",
      highlights: [
        "Clicking any card opens the detailed modal for live updates without disrupting board state.",
        "Reassigning teammates or shifting deadlines updates both the card preview and the backend concurrently.",
      ],
      delayMs: 3800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "3. Tasks & Kanban",
          title: "10. Task Detail Dialog & Priority Escalation",
          explanation: "Task details updated: priority escalated to URGENT and acceptance criteria verified.",
          type: "warning",
          highlights: [
            "Clicking any card opens the detailed modal for live updates without disrupting board state.",
            "Reassigning teammates or shifting deadlines updates both the card preview and the backend concurrently.",
          ],
          resilienceDetail: "Optimistic updates patch the single task cache and the parent collection cache concurrently.",
        });

        updateDemoTask("task-showcase-1", {
          priority: "URGENT",
          description: "All GraphQL subgraphs stitched and verified against Okta federation SSO.",
        });

        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                tasks: page.tasks.map((t) =>
                  t.id === "task-showcase-1" ? { ...t, priority: "URGENT" as const } : t
                ),
              })),
            };
          }
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-showcase-1", "Active Focus: Priority Escalated to URGENT ⚡");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-11-complete-task",
      chapter: "3. Tasks & Kanban",
      title: "11. Deliverable Shipped to DONE & Metric Sync",
      description: "Moves card to DONE column and updates workspace completed counts.",
      expectedOutcome: "Card moves to DONE column with strikethrough styling.",
      highlights: [
        "Once code review passes, deliverable moves to DONE with visual strikethrough styling.",
        "Workspace velocity stats and project completion counters update automatically.",
      ],
      delayMs: 3800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "3. Tasks & Kanban",
          title: "11. Deliverable Shipped to DONE & Metric Sync",
          explanation: "Testing passed! Deliverable moves to DONE. Notice the completed strikethrough styling.",
          type: "success",
          highlights: [
            "Once code review passes, deliverable moves to DONE with visual strikethrough styling.",
            "Workspace velocity stats and project completion counters update automatically.",
          ],
          resilienceDetail: "Completion invalidates workspace analytics counters in the background.",
        });

        updateDemoTask("task-showcase-1", { status: "DONE" });

        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                tasks: page.tasks.map((t) =>
                  t.id === "task-showcase-1" ? { ...t, status: "DONE" as const } : t
                ),
              })),
            };
          }
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        await ctx.queryClient.invalidateQueries({ queryKey: ["workspace-stats"] });
        ctx.setSpotlight("task-showcase-1", "Active Focus: Deliverable Shipped to DONE! ✓");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-12-delete-task",
      chapter: "3. Tasks & Kanban",
      title: "12. Safe Task Deletion with Snapshot Rollback",
      description: "Deletes the demo task and demonstrates clean cache evacuation.",
      expectedOutcome: "Task cleanly evacuated from client state.",
      highlights: [
        "Task deletion immediately removes the card from view to keep the UI snappy.",
        "React Query stores an in-memory cache snapshot; if the server fails, the deleted card restores instantly.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "3. Tasks & Kanban",
          title: "12. Safe Task Deletion with Snapshot Rollback",
          explanation: "Demonstrating task deletion. DevBoard snapshots cache state before deleting, enabling instantaneous rollback if servers fail.",
          type: "info",
          highlights: [
            "Task deletion immediately removes the card from view to keep the UI snappy.",
            "React Query stores an in-memory cache snapshot; if the server fails, the deleted card restores instantly.",
          ],
          resilienceDetail: "Optimistic deletion preserves previous query snapshot for zero-data-loss rollback.",
        });

        deleteDemoTask("task-showcase-1");
        ctx.setSpotlight("task-filter-bar", "Active Focus: Snapshot-Preserving Deletion");

        ctx.queryClient.setQueriesData<InfiniteData<TasksResponse>>(
          { queryKey: ["tasks"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                tasks: page.tasks.filter((t) => t.id !== "task-showcase-1"),
              })),
            };
          }
        );

        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Task deleted safely with cache snapshotting.");
        await ctx.sleep(2000);
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // CHAPTER 4: VIEWS & DISCOVERY (SEARCH, FILTERS, TABLE, CALENDAR)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "step-13-search",
      chapter: "4. Views & Discovery",
      title: "13. Real-Time Debounced Task Search",
      description: "Filters deliverables instantly by title and description.",
      expectedOutcome: "Search filter bar highlighted on screen.",
      highlights: [
        "Search queries filter across task titles, descriptions, and IDs with debounced client evaluation.",
        "Zero latency—engineers find deliverables across large backlogs in milliseconds.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "4. Views & Discovery",
          title: "13. Real-Time Debounced Task Search",
          explanation: "Search evaluates titles and descriptions instantly with debouncing for high performance.",
          type: "info",
          highlights: [
            "Search queries filter across task titles, descriptions, and IDs with debounced client evaluation.",
            "Zero latency—engineers find deliverables across large backlogs in milliseconds.",
          ],
          resilienceDetail: "Debounce controller avoids firing redundant re-render passes on every keystroke.",
        });

        ctx.setSpotlight("task-filter-bar", "Active Focus: Real-Time Debounced Task Search");
        toast.info("Filter: Searching for 'Tailwind OKLCH' deliverables...");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-14-filters",
      chapter: "4. Views & Discovery",
      title: "14. Multi-Facet Filtering (Status, Priority, Assignee)",
      description: "Demonstrates combining multiple filter facets concurrently with 1-click reset.",
      expectedOutcome: "Filter criteria applied with active filter badges.",
      highlights: [
        "Filters can combine status (In Progress), priority (High), and assignee concurrently.",
        "Filter states synchronize cleanly with URL query parameters so filtered views can be bookmarked or shared.",
      ],
      delayMs: 3500,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "4. Views & Discovery",
          title: "14. Multi-Facet Filtering (Status, Priority, Assignee)",
          explanation: "Filters can be combined across Priority (High/Urgent), Status (In Progress), and Assignees with 1-click clear.",
          type: "info",
          highlights: [
            "Filters can combine status (In Progress), priority (High), and assignee concurrently.",
            "Filter states synchronize cleanly with URL query parameters so filtered views can be bookmarked or shared.",
          ],
          resilienceDetail: "Query parameter synchronization enables shareable deep-linked team views.",
        });

        ctx.setSpotlight("task-filter-bar", "Active Focus: Multi-Facet Filtering (Status + Priority + Assignee)");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-15-table-view",
      chapter: "4. Views & Discovery",
      title: "15. Dense Table / Spreadsheet View",
      description: "Switches to tabular view with column sorting and assignee avatars.",
      expectedOutcome: "Project rendered in Table layout (?view=table).",
      highlights: [
        "Engineers who prefer spreadsheet-style bulk reviews can switch to the Table view.",
        "Includes column sorting, status chips, assignee avatars, and formatted due dates.",
      ],
      delayMs: 3800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "4. Views & Discovery",
          title: "15. Dense Table / Spreadsheet View (?view=table)",
          explanation: "Switching to Table view. Perfect for engineers who prefer spreadsheet-style bulk reviews with sorting.",
          type: "info",
          highlights: [
            "Engineers who prefer spreadsheet-style bulk reviews can switch to the Table view.",
            "Includes column sorting, status chips, assignee avatars, and formatted due dates.",
          ],
          resilienceDetail: "Shared TanStack Query cache avoids re-fetching when toggling between Kanban and Table views.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=table");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("task-table-view", "Active Focus: Dense Tabular Grid with Sorting");
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-16-calendar-view",
      chapter: "4. Views & Discovery",
      title: "16. Interactive Calendar & Sprint Timeline",
      description: "Switches to Calendar view plotting task deadlines across the month grid.",
      expectedOutcome: "Project rendered in Calendar layout (?view=calendar).",
      highlights: [
        "The calendar view plots upcoming sprint deadlines visually onto a responsive month grid.",
        "Engineering leads can identify delivery clusters and balance team workload.",
      ],
      delayMs: 3800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "4. Views & Discovery",
          title: "16. Interactive Calendar & Sprint Timeline (?view=calendar)",
          explanation: "Switching to Calendar view. Visualizes deliverables mapped across sprint milestones and due dates.",
          type: "info",
          highlights: [
            "The calendar view plots upcoming sprint deadlines visually onto a responsive month grid.",
            "Engineering leads can identify delivery clusters and balance team workload.",
          ],
          resilienceDetail: "Date math computed using lightweight date-fns utilities without bundle bloat.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=calendar");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("task-calendar-view", "Active Focus: Sprint Milestones Calendar Grid");
        await ctx.sleep(2200);
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // CHAPTER 5: PERSONAL PRODUCTIVITY ("MY TASKS")
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "step-17-my-tasks",
      chapter: "5. Personal Hub",
      title: "17. Cross-Project 'My Tasks' Command Center",
      description: "Navigates to dedicated personal hub aggregating user's tasks across all projects.",
      expectedOutcome: "My Tasks table rendered with assigned deliverables.",
      highlights: [
        "Engineers don't have to hunt across multiple projects to see what they own.",
        "The My Tasks hub aggregates all deliverables assigned to the authenticated user with sorting and status toggling.",
      ],
      delayMs: 3800,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "5. Personal Hub",
          title: "17. Cross-Project 'My Tasks' Command Center",
          explanation: "Navigating to 'My Tasks'. Aggregates all deliverables assigned to the current engineer across every project.",
          type: "info",
          highlights: [
            "Engineers don't have to hunt across multiple projects to see what they own.",
            "The My Tasks hub aggregates all deliverables assigned to the authenticated user with sorting and status toggling.",
          ],
          resilienceDetail: "Single aggregation endpoint reduces N+1 queries across workspace project boundaries.",
        });

        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/my-tasks");
        }
        await ctx.sleep(1000);
        ctx.setSpotlight("my-tasks-table", "Active Focus: Cross-Project Personal Tasks Roster");
        await ctx.sleep(2200);
      },
    },

    // ═════════════════════════════════════════════════════════════════════════
    // CHAPTER 6: SENIOR ARCHITECTURE & PRODUCTION RESILIENCE
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "step-18-resilience-500-rollback",
      chapter: "6. Senior Architecture",
      title: "18. Self-Healing Optimistic Rollback (500 Error)",
      description: "Moves card to DONE, simulates server database crash (500), and demonstrates safe auto-rollback.",
      expectedOutcome: "Card visibly snaps back to IN_PROGRESS to prevent state corruption.",
      highlights: [
        "DevBoard incorporates chaos engineering directly into the frontend architecture.",
        "When a database deadlock (500) strikes, optimistic updates catch the failure and snap the card back safely to prevent data corruption.",
      ],
      delayMs: 4500,
      execute: async (ctx: SimulationStepContext) => {
        if (ctx.navigate) {
          ctx.navigate("/dashboard/devboard-engineering/projects/platform-core?view=kanban");
        }
        await ctx.sleep(1200);

        ctx.setStoryBanner({
          chapter: "6. Senior Architecture",
          title: "18. Self-Healing Optimistic Rollback (Simulated 500 Crash)",
          explanation: "Card was moved to DONE, but the server crashed with 500 Deadlock! Watch DevBoard automatically roll the card back safely.",
          type: "error",
          highlights: [
            "DevBoard incorporates chaos engineering directly into the frontend architecture.",
            "When a database deadlock (500) strikes, optimistic updates catch the failure and snap the card back safely to prevent data corruption.",
          ],
          resilienceDetail: "Self-Healing Architecture: Automatic rollback prevents ghost/corrupted data when APIs fail.",
        });

        // 1. Optimistic move to DONE
        updateDemoTask("task-demo-3", { status: "DONE" });
        await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
        ctx.setSpotlight("task-demo-3", "Active Focus: Optimistically Moved to Done ➔");
        await ctx.sleep(1800);

        // 2. Inject 500 error & roll back
        ctx.setChaos({
          enabled: true,
          nextErrorStatus: 500,
          nextErrorMessage: "Transaction deadlock: Could not serialize task status transition",
        });

        try {
          await apiClient.patch("/simulation/tasks/test-task-123", { status: "DONE" });
        } catch {
          updateDemoTask("task-demo-3", { status: "IN_PROGRESS" });
          await ctx.queryClient.invalidateQueries({ queryKey: ["tasks"] });
          ctx.setSpotlight("task-demo-3", "Active Focus: Safe Rollback: Restored to In Progress ↺");
          toast.error("500 Server Error caught! Card safely rolled back to In Progress.");
        }

        ctx.resetChaos();
        await ctx.sleep(2200);
      },
    },
    {
      id: "step-19-resilience-offline",
      chapter: "6. Senior Architecture",
      title: "19. Offline Network Dropout & Auto-Reconnection",
      description: "Simulates sudden internet disconnection, shows top offline banner, and auto-resyncs on reconnection.",
      expectedOutcome: "Red offline banner appears, then turns green upon reconnection.",
      highlights: [
        "TanStack Query's OnlineManager pauses background requests when internet drops, preventing unhandled exceptions.",
        "Upon reconnection, stale queries automatically re-fetch in the background with zero manual page refreshes.",
      ],
      delayMs: 4000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setSpotlight(null);
        ctx.setStoryBanner({
          chapter: "6. Senior Architecture",
          title: "19. Offline Network Dropout & Auto-Reconnection",
          explanation: "Simulating internet dropout. Top alert turns red and pauses queries. When connection restores, it auto-syncs.",
          type: "warning",
          highlights: [
            "TanStack Query's OnlineManager pauses background requests when internet drops, preventing unhandled exceptions.",
            "Upon reconnection, stale queries automatically re-fetch in the background with zero manual page refreshes.",
          ],
          resilienceDetail: "Zero Data Loss: Browser connectivity synchronized with TanStack OnlineManager.",
        });

        // Cut offline
        ctx.setChaos({ enabled: true, forceOffline: true });
        toast.warning("Network disconnected! Check top status banner.");
        await ctx.sleep(2000);

        // Restore online
        ctx.setChaos({ forceOffline: false });
        toast.success("Network connection restored! Queries auto-resynced.");
        await ctx.sleep(1800);
        ctx.resetChaos();
      },
    },
    {
      id: "step-20-showcase-complete",
      chapter: "Tour Complete",
      title: "20. Walkthrough Complete: Enterprise Production Readiness",
      description: "Concludes the complete product walkthrough tour.",
      expectedOutcome: "All board states and metrics in 100% synchronization.",
      highlights: [
        "DevBoard delivers a modern, resilient, full-stack workflow for agile engineering teams.",
        "Every interaction is optimized for speed, clarity, and fault tolerance.",
      ],
      delayMs: 3000,
      execute: async (ctx: SimulationStepContext) => {
        ctx.setStoryBanner({
          chapter: "Tour Complete",
          title: "Full Product Walkthrough Complete!",
          explanation: "You have completed the walkthrough: Workspaces, Invites, Projects, Kanban, Search, Filters, Table/Calendar Views, My Tasks, and Self-Healing Resilience.",
          type: "success",
          highlights: [
            "DevBoard delivers a modern, resilient, full-stack workflow for agile engineering teams.",
            "Every interaction is optimized for speed, clarity, and fault tolerance.",
          ],
          resilienceDetail: "Enterprise grade: All caches, optimistic states, and route parameters 100% in sync.",
        });

        ctx.setSpotlight(null);
        toast.success("Full Product Walkthrough Complete!");
        await ctx.sleep(2000);
      },
    },
  ],
};