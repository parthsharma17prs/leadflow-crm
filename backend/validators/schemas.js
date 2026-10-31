import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const leadCreateSchema = z
  .object({
    name: z.string().min(1, "Lead name is mandatory"),
    company: z.string().optional().default(""),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional().default(""),
    serviceInterest: z.string().optional().default("General CRM"),
    source: z.string().optional().default("Direct"),
    budget: z.coerce.number().min(0, "Budget cannot be negative").default(0),
    stage: z
      .enum(["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"])
      .default("New"),
  })
  .refine(
    (data) => (data.email && data.email.trim()) || (data.phone && data.phone.trim()),
    {
      message: "At least one of email or phone must be provided",
      path: ["email"],
    }
  );

export const leadUpdateSchema = z.object({
  name: z.string().min(1, "Lead name cannot be empty").optional(),
  company: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  serviceInterest: z.string().optional(),
  source: z.string().optional(),
  budget: z.coerce.number().min(0, "Budget cannot be negative").optional(),
  stage: z
    .enum(["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"])
    .optional(),
});

export const activityCreateSchema = z.object({
  leadId: z.string().min(1, "Valid Lead ID is required"),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Call", "Email", "Meeting", "Task"]).default("Call"),
  dueAt: z.string().datetime().or(z.string().min(1, "Due date is required")),
  status: z.enum(["Pending", "Completed"]).default("Pending"),
});

export const activityUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["Call", "Email", "Meeting", "Task"]).optional(),
  dueAt: z.string().optional(),
  status: z.enum(["Pending", "Completed"]).optional(),
});

