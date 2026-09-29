import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["ADMIN", "MEMBER"], {
    message: "Please select a valid role",
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
