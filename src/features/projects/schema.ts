import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(50, "Project name must be 50 characters or less"),
  logo: z.string().optional().nullable().or(z.literal("")),
});

export type CreateProjectSchemaInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(50, "Project name must be 50 characters or less")
    .optional(),
  logo: z.string().optional().nullable().or(z.literal("")),
});

export type UpdateProjectSchemaInput = z.infer<typeof updateProjectSchema>;
